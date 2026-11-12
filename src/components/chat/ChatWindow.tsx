"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AlertCircle, Loader2, MessagesSquare, SendHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import type { ChatMessage, Conversation } from "@/types";

const MAX_LENGTH = 2000;

export function conversationTitle(c: Conversation, t: (k: string) => string) {
  if (c.type === "bank") return c.bloodBankName || t("chat.bankChat");
  const name = [c.otherUser?.firstName, c.otherUser?.lastName].filter(Boolean).join(" ");
  return name || t("chat.unknownUser");
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

interface ChatWindowProps {
  conversation: Conversation;
  className?: string;
  /** Hide the header (when the page already shows the context). */
  hideHeader?: boolean;
}

export function ChatWindow({ conversation, className, hideHeader }: ChatWindowProps) {
  const { t, i18n } = useTranslation();
  const chat = useChat(conversation.id);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const prevHeight = useRef(0);
  const prevFirstId = useRef<number | null>(null);

  // keep the view pinned to the bottom for new messages, and keep the
  // position when older messages are prepended
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const firstId = chat.messages[0]?.id ?? null;
    if (prevFirstId.current !== null && firstId !== prevFirstId.current && !stickToBottom.current) {
      el.scrollTop += el.scrollHeight - prevHeight.current;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
    prevFirstId.current = firstId;
    prevHeight.current = el.scrollHeight;
  }, [chat.messages]);

  useEffect(() => {
    stickToBottom.current = true;
    setDraft("");
  }, [conversation.id]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (el.scrollTop < 60 && chat.hasOlder && !chat.isLoadingOlder) void chat.loadOlder();
  };

  const submit = () => {
    const body = draft.trim();
    if (!body || body.length > MAX_LENGTH) return;
    stickToBottom.current = true;
    void chat.sendMessage(body);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const nameOf = (userId: number) =>
    [...chat.messages].reverse().find((m) => m.senderId === userId)?.senderName ||
    (conversation.otherUser?.id === userId
      ? [conversation.otherUser.firstName, conversation.otherUser.lastName].filter(Boolean).join(" ")
      : "");
  const typingNames = chat.typingUserIds.map(nameOf).filter(Boolean);
  const time = (m: ChatMessage) =>
    new Date(m.createdAt).toLocaleTimeString(i18n.language, { hour: "numeric", minute: "2-digit" });

  return (
    <section
      className={cn("flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-card", className)}
      aria-label={conversationTitle(conversation, t)}
    >
      {!hideHeader && (
        <header className="flex items-center gap-3 border-b px-4 py-3">
          <span className="icon-tile-soft h-10 w-10 shrink-0 rounded-xl">
            {conversation.type === "bank" ? <Users className="h-5 w-5" /> : <MessagesSquare className="h-5 w-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold">{conversationTitle(conversation, t)}</h2>
            {conversation.type === "direct" && conversation.postTitle ? (
              <p className="truncate text-xs text-muted-foreground">
                {t("chat.about")}{" "}
                <Link href="/posts" className="hover:text-primary hover:underline">
                  {conversation.postTitle}
                </Link>
              </p>
            ) : conversation.type === "bank" && conversation.bloodBankId ? (
              <Link
                href={`/blood-banks/${conversation.bloodBankId}`}
                className="text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                {t("chat.viewBank")}
              </Link>
            ) : null}
          </div>
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs",
              chat.socketStatus === "open" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                chat.socketStatus === "open" ? "bg-emerald-500" : "bg-muted-foreground/50 animate-pulse",
              )}
            />
            {chat.socketStatus === "open" ? t("chat.live") : t("chat.reconnecting")}
          </span>
        </header>
      )}

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        {chat.isLoadingOlder && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {chat.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className={cn("h-10 w-2/3 rounded-2xl", i % 2 && "ml-auto")} />
            ))}
          </div>
        ) : chat.isError ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("chat.loadError")}</p>
        ) : chat.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <MessagesSquare className="mb-3 h-10 w-10 opacity-40" />
            <p>{t("chat.empty")}</p>
          </div>
        ) : (
          chat.messages.map((m, i) => {
            const prev = chat.messages[i - 1];
            const mine = m.senderId === chat.myId;
            const newDay = !prev || !sameDay(prev.createdAt, m.createdAt);
            const showName = !mine && conversation.type === "bank" && (newDay || prev?.senderId !== m.senderId);
            return (
              <div key={m.clientId ?? m.id}>
                {newDay && (
                  <p className="my-3 text-center text-xs text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString(i18n.language, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                )}
                <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                  {showName && <span className="mb-0.5 ml-3 text-xs font-medium text-primary">{m.senderName}</span>}
                  <div
                    className={cn(
                      "max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                      mine ? "rounded-br-md blood-gradient text-blood-foreground" : "rounded-bl-md bg-muted",
                      m.pending && "opacity-60",
                      m.failed && "ring-2 ring-destructive",
                    )}
                  >
                    {m.body}
                  </div>
                  <span className="mx-2 mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    {m.failed ? (
                      <>
                        <AlertCircle className="h-3 w-3 text-destructive" />
                        {t("chat.failed")}
                      </>
                    ) : m.pending ? (
                      t("chat.sending")
                    ) : (
                      time(m)
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="h-5 px-4 text-xs italic text-muted-foreground" aria-live="polite">
        {typingNames.length > 0
          ? t("chat.typing", { names: typingNames.join(", ") })
          : chat.typingUserIds.length > 0
            ? t("chat.someoneTyping")
            : ""}
      </div>

      <form
        className="flex items-end gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            chat.notifyTyping();
          }}
          onKeyDown={onKeyDown}
          placeholder={t("chat.placeholder")}
          aria-label={t("chat.placeholder")}
          rows={1}
          maxLength={MAX_LENGTH}
          className="max-h-32 min-h-[44px] resize-none"
        />
        <Button
          type="submit"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full blood-gradient text-blood-foreground"
          disabled={!draft.trim()}
          aria-label={t("chat.send")}
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </form>
    </section>
  );
}
