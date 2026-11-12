"use client";

import { useTranslation } from "react-i18next";
import { Phone, Users } from "lucide-react";
import { BloodBadge } from "@/components/ui/blood-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BankRoleBadge } from "@/components/bloodbank/BloodBankCard";
import type { BankMember, BloodGroup } from "@/types";

export function memberName(m: Pick<BankMember, "firstName" | "lastName">, anonymous: string) {
  return [m.firstName, m.lastName].filter(Boolean).join(" ") || anonymous;
}

interface BankMembersListProps {
  members: BankMember[];
  isLoading?: boolean;
  currentUserId?: number;
}

/** Active members: admin and officers first, with positions, points and donations. */
export function BankMembersList({ members, isLoading, currentUserId }: BankMembersListProps) {
  const { t, i18n } = useTranslation();
  const fmt = (n: number) => n.toLocaleString(i18n.language);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }
  if (members.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
        <p>{t("bloodBanks.members.empty")}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {members.map((m) => (
        <li key={m.id} className="flex flex-wrap items-center gap-3 py-3">
          {m.bloodGroup ? <BloodBadge bloodGroup={m.bloodGroup as BloodGroup} size="sm" /> : <span className="h-8 w-8" />}
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {memberName(m, t("leaderboard.anonymous"))}
              {currentUserId === m.userId && (
                <span className="ml-2 text-xs font-normal text-primary">({t("leaderboard.you")})</span>
              )}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <BankRoleBadge role={m.role} position={m.position} />
              {m.phone && (
                <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                  <Phone className="h-3 w-3" />
                  {m.phone}
                </a>
              )}
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold tabular-nums text-primary">
              {fmt(m.points)} {t("gamification.pts")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("bloodBanks.members.donations", { count: m.donationCount })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
