"use client";

import { useTranslation } from "react-i18next";
import { MessagesSquare, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { conversationTitle } from "@/components/chat/ChatWindow";
import { UserAvatar } from "@/components/images/UserAvatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading?: boolean;
  activeId: number | null;
  onSelect: (id: number) => void;
  myId: number;
}

export function ConversationList({ conversations, isLoading, activeId, onSelect, myId }: ConversationListProps) {
  const { t, i18n } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-muted-foreground">
        <MessagesSquare className="mx-auto mb-3 h-10 w-10 opacity-40" />
        <p>{t("chat.noConversations")}</p>
      </div>
    );
  }

  const when = (iso: string) => {
    const d = new Date(iso);
    return d.toDateString() === new Date().toDateString()
      ? d.toLocaleTimeString(i18n.language, { hour: "numeric", minute: "2-digit" })
      : d.toLocaleDateString(i18n.language, { day: "numeric", month: "short" });
  };

  return (
    <ul className="space-y-1 p-2">
      {conversations.map((c) => {
        const last = c.lastMessage;
        const preview = last
          ? `${last.senderId === myId ? t("chat.you") + ": " : c.type === "bank" && last.senderName ? last.senderName.split(" ")[0] + ": " : ""}${last.body}`
          : c.type === "direct" && c.postTitle
            ? c.postTitle
            : t("chat.noMessagesYet");
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              aria-current={c.id === activeId ? "true" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                c.id === activeId ? "bg-primary/10" : "hover:bg-primary/5",
              )}
            >
              {c.type === "direct" ? (
                <UserAvatar src={c.otherUser?.photo} name={conversationTitle(c, t)} size={40} />
              ) : (
                <span className="icon-tile-soft h-10 w-10 shrink-0 rounded-xl">
                  <Users className="h-5 w-5" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={cn("truncate", c.unreadCount > 0 ? "font-bold" : "font-medium")}>
                    {conversationTitle(c, t)}
                  </span>
                  {(last?.createdAt ?? c.lastMessageAt) && (
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {when(last?.createdAt ?? (c.lastMessageAt as string))}
                    </span>
                  )}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-xs",
                      c.unreadCount > 0 ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {preview}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                      {c.unreadCount > 99 ? "99+" : c.unreadCount}
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
