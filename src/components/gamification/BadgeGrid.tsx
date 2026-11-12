"use client";

import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import {
  Crown,
  Droplet,
  Heart,
  Landmark,
  Lock,
  Medal,
  Shield,
  Siren,
  Trophy,
  Zap,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Badge, UserBadge } from "@/types";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  droplet: Droplet,
  heart: Heart,
  shield: Shield,
  zap: Zap,
  crown: Crown,
  siren: Siren,
  landmark: Landmark,
  trophy: Trophy,
};

export function BadgeIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] ?? Medal;
  return <Icon className={className} />;
}

export function useBadgeText() {
  const { t } = useTranslation();
  return (b: Pick<Badge, "code" | "name" | "description">) => ({
    name: t(`gamification.badges.${b.code}.name`, { defaultValue: b.name }),
    description: t(`gamification.badges.${b.code}.description`, { defaultValue: b.description }),
  });
}

interface BadgeGridProps {
  allBadges: Badge[];
  earned: UserBadge[];
  className?: string;
}

/** Every badge, earned ones in colour (with a count for repeatable ones), the rest locked. */
export function BadgeGrid({ allBadges, earned, className }: BadgeGridProps) {
  const { t, i18n } = useTranslation();
  const text = useBadgeText();

  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {allBadges.map((badge) => {
        const mine = earned.filter((e) => e.code === badge.code);
        const isEarned = mine.length > 0;
        const { name, description } = text(badge);
        const first = mine[mine.length - 1];
        return (
          <li key={badge.code}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  tabIndex={0}
                  className={cn(
                    "relative flex h-full flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all",
                    isEarned
                      ? "border-primary/25 bg-primary/[0.04] hover:-translate-y-0.5 hover:shadow-md"
                      : "border-dashed opacity-60 grayscale",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full",
                      isEarned ? "blood-gradient text-blood-foreground blood-glow" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isEarned ? <BadgeIcon icon={badge.icon} className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                  </span>
                  <span className="text-sm font-semibold leading-tight">{name}</span>
                  {mine.length > 1 && (
                    <span className="absolute right-2 top-2 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      ×{mine.length}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-56 text-center">
                <p>{description}</p>
                {first && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("gamification.earnedOn", {
                      date: new Date(first.awardedAt).toLocaleDateString(i18n.language),
                    })}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
