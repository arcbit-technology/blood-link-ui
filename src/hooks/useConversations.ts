"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getConversations, openDirectConversation } from "@/api/chat";
import type { Conversation } from "@/types";

export const CONVERSATIONS_KEY = ["conversations"] as const;

/** The signed-in user's conversations (kept fresh by the socket) and total unread. */
export function useConversations() {
  const { token, isAuthenticated } = useAuth();
  const query = useQuery({
    queryKey: CONVERSATIONS_KEY,
    enabled: isAuthenticated && !!token,
    queryFn: () => getConversations(token as string),
    staleTime: 60_000,
  });
  const conversations: Conversation[] = query.data ?? [];
  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  return { ...query, conversations, unreadTotal };
}

/** Opens the 1:1 chat about a post and navigates to it. */
export function useOpenDirectChat() {
  const { token } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, userId }: { postId: number | string; userId: number | string }) =>
      openDirectConversation(postId, userId, token as string),
    onSuccess: (conversation) => {
      void queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      router.push(`/messages?c=${conversation.id}`);
    },
  });
}
