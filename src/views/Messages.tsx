"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MessagesSquare } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ConversationList } from "@/components/chat/ConversationList";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";

export default function Messages() {
  return (
    <Suspense fallback={null}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const { conversations, isLoading } = useConversations();

  const activeId = Number(searchParams.get("c")) || null;
  const active = conversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading || !isAuthenticated || !user) return null;

  const select = (id: number | null) => router.replace(id ? `/messages?c=${id}` : "/messages", { scroll: false });

  return (
    <Layout>
      <div className="container py-8">
        <PageHeader icon={MessagesSquare} title={t("chat.title")} subtitle={t("chat.subtitle")} />

        <div className="grid h-[calc(100vh-16rem)] min-h-[480px] grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
          <aside
            className={cn(
              "min-h-0 overflow-y-auto rounded-2xl border bg-card",
              active && "hidden md:block",
            )}
            aria-label={t("chat.conversations")}
          >
            <ConversationList
              conversations={conversations}
              isLoading={isLoading}
              activeId={activeId}
              onSelect={select}
              myId={Number(user.id)}
            />
          </aside>

          {active ? (
            <div className="flex min-h-0 flex-col gap-2">
              <Button variant="ghost" size="sm" className="self-start md:hidden" onClick={() => select(null)}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                {t("chat.back")}
              </Button>
              <ChatWindow conversation={active} className="flex-1" />
            </div>
          ) : (
            <div className="hidden items-center justify-center rounded-2xl border border-dashed text-muted-foreground md:flex">
              <div className="text-center">
                <MessagesSquare className="mx-auto mb-3 h-12 w-12 opacity-40" />
                <p>{activeId && !isLoading ? t("chat.notFound") : t("chat.pickConversation")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
