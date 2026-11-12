"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Trophy } from "lucide-react";
import { BloodBadge } from "@/components/ui/blood-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocationLabel } from "@/components/common/LocationSelect";
import { cn } from "@/lib/utils";
import type { BloodGroup, LeaderboardEntry } from "@/types";

const MEDALS = ["🥇", "🥈", "🥉"];

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
  currentUserId?: number;
  /** Hide the blood bank column (on a bank's own page). */
  hideBank?: boolean;
}

export function LeaderboardTable({ entries, isLoading, currentUserId, hideBank }: LeaderboardTableProps) {
  const { t, i18n } = useTranslation();
  const locationLabel = useLocationLabel();
  const fmt = (n: number) => n.toLocaleString(i18n.language);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Trophy className="mx-auto mb-3 h-12 w-12 opacity-40" />
        <p>{t("leaderboard.empty")}</p>
      </div>
    );
  }

  return (
    <ol className="space-y-2" aria-label={t("leaderboard.title")}>
      {entries.map((e) => {
        const name = [e.firstName, e.lastName].filter(Boolean).join(" ") || t("leaderboard.anonymous");
        const isMe = currentUserId === e.userId;
        return (
          <li
            key={e.userId}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3 transition-colors",
              e.rank <= 3 ? "border-primary/25 bg-primary/[0.04]" : "hover:border-primary/20",
              isMe && "ring-2 ring-primary/40",
            )}
          >
            <span className="w-9 shrink-0 text-center text-lg font-bold tabular-nums">
              {e.rank <= 3 ? <span aria-label={`#${e.rank}`}>{MEDALS[e.rank - 1]}</span> : fmt(e.rank)}
            </span>
            {e.bloodGroup ? (
              <BloodBadge bloodGroup={e.bloodGroup as BloodGroup} size="sm" />
            ) : (
              <span className="h-8 w-8" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {name}
                {isMe && <span className="ml-2 text-xs font-normal text-primary">({t("leaderboard.you")})</span>}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {locationLabel(e)}
                {!hideBank && e.bloodBankName && e.bloodBankId ? (
                  <>
                    {" · "}
                    <Link href={`/blood-banks/${e.bloodBankId}`} className="hover:text-primary hover:underline">
                      {e.bloodBankName}
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium tabular-nums">{fmt(e.donations)}</p>
              <p className="text-xs text-muted-foreground">{t("gamification.donations")}</p>
            </div>
            <div className="w-20 text-right">
              <p className="text-lg font-extrabold tabular-nums text-primary">{fmt(e.points)}</p>
              <p className="text-xs text-muted-foreground">{t("gamification.pts")}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
