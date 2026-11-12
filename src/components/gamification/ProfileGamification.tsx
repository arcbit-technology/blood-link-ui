"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Building2, Clock, Medal, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { PointsCard } from "@/components/gamification/PointsCard";
import { BankRoleBadge, BankStatusBadge } from "@/components/bloodbank/BloodBankCard";
import { useMyBloodBank } from "@/hooks/useMyBloodBank";
import { getGamificationProfile } from "@/api/gamification";

/** Points, level, badges and recent points of a user (their profile page). */
export function ProfileGamification({ userId }: { userId: string }) {
  const { t, i18n } = useTranslation();
  const query = useQuery({
    queryKey: ["gamification", userId],
    queryFn: () => getGamificationProfile(userId),
    staleTime: 30_000,
  });
  const p = query.data;

  if (query.isLoading) return <Skeleton className="h-72 rounded-2xl" />;
  if (!p) return null;

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("gamification.heroScore")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PointsCard profile={p} />
          {p.recent.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">{t("gamification.recentPoints")}</h3>
              <ul className="space-y-1.5 text-sm">
                {p.recent.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">
                      {t(`gamification.reasons.${r.reason}`)}
                      <span className="ml-2 text-xs">
                        {new Date(r.createdAt).toLocaleDateString(i18n.language)}
                      </span>
                    </span>
                    <span className="font-semibold text-primary">+{r.points}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/leaderboard">
              <Trophy className="mr-2 h-4 w-4" />
              {t("gamification.seeLeaderboard")}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-primary" />
            {t("gamification.badgesTitle", { earned: new Set(p.badges.map((b) => b.code)).size, total: p.allBadges.length })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeGrid allBadges={p.allBadges} earned={p.badges} />
        </CardContent>
      </Card>
    </div>
  );
}

/** The user's blood bank (or join / create prompts). */
export function MyBloodBankCard() {
  const { t } = useTranslation();
  const { data, isLoading } = useMyBloodBank();
  if (isLoading) return <Skeleton className="h-28 rounded-2xl" />;

  const bank = data?.bank;
  const pending = data?.pendingRequest;
  const membership = data?.membership;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {t("profile.bloodBank.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bank && membership ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link href={`/blood-banks/${bank.id}`} className="text-lg font-semibold hover:text-primary">
                {bank.name}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                {membership.status === "pending" ? (
                  <span className="inline-flex items-center gap-1 text-sm text-amber-700 dark:text-amber-300">
                    <Clock className="h-4 w-4" />
                    {t("bloodBanks.detail.pending")}
                  </span>
                ) : (
                  <BankRoleBadge role={membership.role} position={membership.position} />
                )}
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href={`/blood-banks/${bank.id}`}>{t("profile.bloodBank.open")}</Link>
            </Button>
          </div>
        ) : pending ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{pending.name}</p>
              <BankStatusBadge status={pending.status} />
            </div>
            <Button asChild variant="outline">
              <Link href={`/blood-banks/${pending.id}`}>{t("bloodBanks.viewMyRequest")}</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{t("profile.bloodBank.none")}</p>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/blood-banks">{t("profile.bloodBank.find")}</Link>
              </Button>
              <Button asChild className="blood-gradient text-blood-foreground">
                <Link href="/blood-banks/new">{t("bloodBanks.createButton")}</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
