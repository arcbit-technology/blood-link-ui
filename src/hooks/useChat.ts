"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { getMessages, markConversationRead, MESSAGE_PAGE_SIZE, sendMessageRest } from "@/api/chat";
import type { ChatMessage, SocketEvent } from "@/types";

type Pages = InfiniteData<ChatMessage[], number | undefined>;

export const messagesKey = (conversationId: number) => ["messages", conversationId] as const;

/**
 * Adds a message to the newest page. A server message replaces the
 * optimistic one with the same client id; duplicates (same id) are ignored.
 */
export function mergeMessage(data: Pages | undefined, msg: ChatMessage): Pages | undefined {
  if (!data) return data;
  const pages = data.pages.map((p) => p.slice());
  const exists = pages.some((p) => p.some((m) => m.id === msg.id && !m.pending));
  if (exists) return data;

  if (msg.clientId) {
    for (const page of pages) {
      const i = page.findIndex((m) => m.pending && m.clientId === msg.clientId);
      if (i >= 0) {
        page[i] = { ...msg, pending: false, failed: false };
        return { ...data, pages };
      }
    }
  }
  pages[0] = [...(pages[0] ?? []), msg];
  return { ...data, pages };
}

/** Marks the optimistic message with this client id as failed. */
export function failMessage(data: Pages | undefined, clientId: string): Pages | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((p) =>
      p.map((m) => (m.clientId === clientId && m.pending ? { ...m, pending: false, failed: true } : m)),
    ),
  };
}

const newClientId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Messages, live updates, sending, typing and read receipts for one conversation. */
export function useChat(conversationId: number | null) {
  const { token, user } = useAuth();
  const { send: socketSend, subscribe, status } = useSocket();
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<Record<number, number>>({});
  const lastTypingSent = useRef(0);
  const lastReadSent = useRef(0);
  const myId = user ? Number(user.id) : 0;

  const query = useInfiniteQuery({
    queryKey: messagesKey(conversationId ?? 0),
    enabled: !!conversationId && !!token,
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) => getMessages(conversationId as number, token as string, pageParam),
    // pages[0] is the newest page; older pages are fetched with before_id
    getNextPageParam: (lastPage) =>
      lastPage.length >= MESSAGE_PAGE_SIZE ? lastPage[0]?.id : undefined,
    staleTime: 30_000,
  });

  // live messages / typing
  useEffect(() => {
    if (!conversationId) return;
    const offMessage = subscribe("message", (e: SocketEvent) => {
      if (e.conversationId !== conversationId || !e.message) return;
      const msg = { ...e.message, clientId: e.clientId };
      queryClient.setQueryData<Pages>(messagesKey(conversationId), (d) => mergeMessage(d, msg));
      setTypingUsers((prev) => {
        if (!(msg.senderId in prev)) return prev;
        const next = { ...prev };
        delete next[msg.senderId];
        return next;
      });
    });
    const offTyping = subscribe("typing", (e: SocketEvent) => {
      if (e.conversationId !== conversationId || !e.userId) return;
      setTypingUsers((prev) => ({ ...prev, [e.userId as number]: Date.now() }));
    });
    const offError = subscribe("error", (e: SocketEvent) => {
      if (e.conversationId !== conversationId || !e.clientId) return;
      queryClient.setQueryData<Pages>(messagesKey(conversationId), (d) => failMessage(d, e.clientId as string));
    });
    return () => {
      offMessage();
      offTyping();
      offError();
    };
  }, [conversationId, subscribe, queryClient]);

  // typing indicators expire after 3s
  useEffect(() => {
    if (Object.keys(typingUsers).length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const next = Object.fromEntries(Object.entries(prev).filter(([, at]) => now - at < 3000));
        return Object.keys(next).length === Object.keys(prev).length ? prev : next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [typingUsers]);

  const messages = useMemo(
    () => (query.data ? [...query.data.pages].reverse().flat() : []),
    [query.data],
  );

  // read receipt for the newest server message
  const newestId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) if (!messages[i].pending && messages[i].id > 0) return messages[i].id;
    return 0;
  }, [messages]);

  useEffect(() => {
    if (!conversationId || !token || newestId <= lastReadSent.current) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    lastReadSent.current = newestId;
    const sent = socketSend({ type: "read", conversation_id: conversationId, message_id: newestId });
    if (!sent) void markConversationRead(conversationId, newestId, token).catch(() => undefined);
    // optimistic: clear the unread badge
    queryClient.setQueryData(["conversations"], (list: unknown) =>
      Array.isArray(list)
        ? list.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
        : list,
    );
  }, [conversationId, newestId, token, socketSend, queryClient]);

  useEffect(() => {
    lastReadSent.current = 0;
  }, [conversationId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const body = text.trim();
      if (!conversationId || !token || !body) return;
      const clientId = newClientId();
      const optimistic: ChatMessage = {
        id: -Date.now(),
        conversationId,
        senderId: myId,
        senderName: user?.name ?? "",
        body,
        createdAt: new Date().toISOString(),
        clientId,
        pending: true,
      };
      queryClient.setQueryData<Pages>(messagesKey(conversationId), (d) =>
        d ? { ...d, pages: [[...(d.pages[0] ?? []), optimistic], ...d.pages.slice(1)] } : d,
      );

      if (socketSend({ type: "send", conversation_id: conversationId, body, client_id: clientId })) return;

      // socket down: REST fallback
      try {
        const saved = await sendMessageRest(conversationId, body, clientId, token);
        queryClient.setQueryData<Pages>(messagesKey(conversationId), (d) =>
          mergeMessage(d, { ...saved, clientId }),
        );
      } catch {
        queryClient.setQueryData<Pages>(messagesKey(conversationId), (d) => failMessage(d, clientId));
      }
    },
    [conversationId, token, myId, user?.name, socketSend, queryClient],
  );

  const notifyTyping = useCallback(() => {
    if (!conversationId) return;
    const now = Date.now();
    if (now - lastTypingSent.current < 2000) return;
    lastTypingSent.current = now;
    socketSend({ type: "typing", conversation_id: conversationId });
  }, [conversationId, socketSend]);

  return {
    messages,
    isLoading: query.isLoading,
    isError: query.isError,
    hasOlder: !!query.hasNextPage,
    loadOlder: query.fetchNextPage,
    isLoadingOlder: query.isFetchingNextPage,
    sendMessage,
    notifyTyping,
    typingUserIds: Object.keys(typingUsers).map(Number),
    socketStatus: status,
    myId,
  };
}
