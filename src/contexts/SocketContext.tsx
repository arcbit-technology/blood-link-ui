"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { socketUrl } from "@/api/chat";
import { camelize } from "@/api/camelize";
import type { AppNotification, SocketEvent } from "@/types";

export type SocketStatus = "idle" | "connecting" | "open" | "closed";

/** Client -> server websocket event. */
export type OutgoingSocketEvent =
  | { type: "send"; conversation_id: number; body: string; client_id: string }
  | { type: "typing"; conversation_id: number }
  | { type: "read"; conversation_id: number; message_id: number };

type Handler = (event: SocketEvent) => void;

interface SocketContextValue {
  status: SocketStatus;
  /** Sends the event when connected; returns false otherwise. */
  send: (event: OutgoingSocketEvent) => boolean;
  /** Listens to one event type ("*" for all). Returns the unsubscribe function. */
  subscribe: (type: SocketEvent["type"] | "*", handler: Handler) => () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

const MAX_BACKOFF_MS = 30_000;

/** React Query keys refreshed when a notification of that kind arrives. */
const NOTIFICATION_INVALIDATIONS: Record<string, string[][]> = {
  bank_approved: [["myBloodBank"], ["bloodBank"], ["bloodBanks"], ["gamification"], ["conversations"]],
  bank_rejected: [["myBloodBank"], ["bloodBank"]],
  bank_suspended: [["myBloodBank"], ["bloodBank"]],
  join_requested: [["bankMembers"]],
  join_approved: [["myBloodBank"], ["bloodBank"], ["bankMembers"], ["conversations"]],
  join_rejected: [["myBloodBank"]],
  member_removed: [["myBloodBank"], ["bloodBank"], ["bankMembers"], ["conversations"]],
  role_changed: [["myBloodBank"], ["bankMembers"]],
  admin_transferred: [["myBloodBank"], ["bloodBank"], ["bankMembers"]],
  donation_confirmed: [["gamification"], ["leaderboard"], ["posts"]],
  badge_earned: [["gamification"]],
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SocketStatus>("idle");
  const wsRef = useRef<WebSocket | null>(null);
  const listeners = useRef(new Map<string, Set<Handler>>());

  const emit = useCallback((event: SocketEvent) => {
    listeners.current.get(event.type)?.forEach((h) => h(event));
    listeners.current.get("*")?.forEach((h) => h(event));
  }, []);

  const handleNotification = useCallback(
    (n: AppNotification) => {
      for (const key of NOTIFICATION_INVALIDATIONS[n.kind] ?? []) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
      if (n.kind === "badge_earned") {
        toast.success(n.title, { description: n.body, icon: "🏅", duration: 8000 });
      } else if (n.kind === "donation_confirmed") {
        toast.success(n.title, { description: n.body, icon: "🩸", duration: 8000 });
      } else {
        toast(n.title, { description: n.body });
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (!isAuthenticated || !token || typeof WebSocket === "undefined") {
      setStatus("idle");
      return;
    }

    let closedByUs = false;
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let invalidateTimer: ReturnType<typeof setTimeout> | undefined;

    // conversation previews / unread counts change with every message;
    // refetch them at most every 300ms
    const refreshConversations = () => {
      if (invalidateTimer) return;
      invalidateTimer = setTimeout(() => {
        invalidateTimer = undefined;
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }, 300);
    };

    const connect = () => {
      setStatus("connecting");
      const ws = new WebSocket(socketUrl(token));
      wsRef.current = ws;

      ws.onopen = () => {
        attempt = 0;
        setStatus("open");
        // anything missed while offline
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
        void queryClient.invalidateQueries({ queryKey: ["messages"] });
      };
      ws.onmessage = (e) => {
        let event: SocketEvent;
        try {
          event = camelize(JSON.parse(String(e.data))) as SocketEvent;
        } catch {
          return;
        }
        if (event.type === "notification" && event.notification) handleNotification(event.notification);
        if (event.type === "message" || event.type === "read") refreshConversations();
        emit(event);
      };
      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null;
        setStatus("closed");
        if (closedByUs) return;
        const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt) + Math.random() * 500;
        attempt += 1;
        retryTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closedByUs = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (invalidateTimer) clearTimeout(invalidateTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [isAuthenticated, token, queryClient, emit, handleNotification]);

  const send = useCallback((event: OutgoingSocketEvent) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(event));
    return true;
  }, []);

  const subscribe = useCallback((type: SocketEvent["type"] | "*", handler: Handler) => {
    const map = listeners.current;
    if (!map.has(type)) map.set(type, new Set());
    map.get(type)!.add(handler);
    return () => {
      map.get(type)?.delete(handler);
    };
  }, []);

  const value = useMemo(() => ({ status, send, subscribe }), [status, send, subscribe]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
}
