import { http } from "@/api/http";
import { camelize, queryString } from "@/api/camelize";
import { API_BASE_URL } from "@/config/api";
import type { ChatMessage, Conversation } from "@/types";

type Envelope<T> = { result?: T; error?: string };

async function call<T>(
  method: "GET" | "POST" | "PUT",
  path: string,
  token: string,
  body?: unknown,
): Promise<T> {
  const res = await http<Envelope<unknown>>({ method, path, token, body });
  return camelize(res.result) as T;
}

export const MESSAGE_PAGE_SIZE = 50;

/** ws(s)://host/ws?token=… (browsers cannot set headers on websockets). */
export function socketUrl(token: string): string {
  return `${String(API_BASE_URL).replace(/^http/, "ws")}/ws?token=${encodeURIComponent(token)}`;
}

export async function getConversations(token: string) {
  return (await call<Conversation[]>("GET", "/conversations", token)) ?? [];
}

export const getConversation = (id: number, token: string) =>
  call<Conversation>("GET", `/conversation/${id}`, token);

export async function getMessages(id: number, token: string, beforeId?: number) {
  return (
    (await call<ChatMessage[]>(
      "GET",
      `/conversation/${id}/messages${queryString({ before_id: beforeId, size: MESSAGE_PAGE_SIZE })}`,
      token,
    )) ?? []
  );
}

/** Opens (or reuses) the 1:1 chat between the post author and an interested donor. */
export const openDirectConversation = (postId: number | string, userId: number | string, token: string) =>
  call<Conversation>("POST", "/conversation/direct", token, {
    post_id: Number(postId),
    user_id: Number(userId),
  });

/** REST fallback used when the socket is not connected. */
export const sendMessageRest = (id: number, body: string, clientId: string, token: string) =>
  call<ChatMessage>("POST", `/conversation/${id}/message`, token, { body, client_id: clientId });

export const markConversationRead = (id: number, messageId: number, token: string) =>
  call<string>("PUT", `/conversation/${id}/read?message_id=${messageId}`, token);
