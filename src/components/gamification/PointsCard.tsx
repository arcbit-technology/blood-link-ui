"use client";

import { useTranslation } from "react-i18next";
import { Award, Droplet, Hash, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { GamificationProfile, Level } from "@/types";

const LEVEL_STYLES: Record<Level["name"], string> = {
  bronze: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  silver: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-400/15 dark:text-slate-200 dark:border-slate-400/30",
  gold: "bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-400/15 dark:text-yellow-200 dark:border-yellow-400/30",
  platinum: "bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-400/15 dark:text-cyan-200 dark:border-cyan-400/30",
};

export function LevelBadge({ level, className }: { level: Level["name"]; className?: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        LEVEL_STYLES[level] ?? LEVEL_STYLES.bronze,
        className,
      )}
    >
      <Award className="h-3.5 w-3.5" />
      {t(`gamification.levels.${level}`)}
    </span>
  );
}

/** Points, level progress, rank and donation count. */
export function PointsCard({ profile }: { profile: GamificationProfile }) {
  const { t, i18n } = useTranslation();
  const fmt = (n: number) => n.toLocaleString(i18n.language);
  const { level, nextLevel, points } = profile;
  const progress = nextLevel
    ? Math.round(((points - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100)
    : 100;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("gamification.points")}</p>
          <p className="flex items-center gap-2 text-4xl font-extrabold tabular-nums">
            <Sparkles className="h-7 w-7 text-primary" />
            {fmt(points)}
          </p>
        </div>
        <LevelBadge level={level.name} className="text-sm" />
      </div>

      <div className="space-y-2">
        <Progress value={progress} aria-label={t("gamification.levelProgress")} />
        <p className="text-sm text-muted-foreground">
          {nextLevel
            ? t("gamification.toNextLevel", {
                points: fmt(nextLevel.minPoints - points),
                level: t(`gamification.levels.${nextLevel.name}`),
              })
            : t("gamification.maxLevel")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-primary/10 bg-primary/[0.03] p-3">
          <Droplet className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xl font-bold tabular-nums">{fmt(profile.donationCount)}</p>
            <p className="text-xs text-muted-foreground">{t("gamification.donations")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-primary/10 bg-primary/[0.03] p-3">
          <Hash className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xl font-bold tabular-nums">{fmt(profile.rank)}</p>
            <p className="text-xs text-muted-foreground">{t("gamification.rank")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
