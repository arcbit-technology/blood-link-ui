"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Droplet, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocationLabel } from "@/components/common/LocationSelect";
import { BankCover, BankLogo } from "@/components/bloodbank/BankImages";
import { cn } from "@/lib/utils";
import type { BankRole, BloodBank, BloodBankStatus } from "@/types";

const STATUS_STYLES: Record<BloodBankStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  suspended: "bg-muted text-muted-foreground",
};

export function BankStatusBadge({ status }: { status: BloodBankStatus }) {
  const { t } = useTranslation();
  return <Badge className={STATUS_STYLES[status]}>{t(`bloodBanks.status.${status}`)}</Badge>;
}

const ROLE_STYLES: Record<BankRole, string> = {
  admin: "bg-primary text-primary-foreground",
  officer: "bg-primary/15 text-primary",
  member: "bg-secondary text-secondary-foreground",
};

export function BankRoleBadge({ role, position }: { role: BankRole; position?: string }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <Badge className={ROLE_STYLES[role]}>
        {role === "admin" && <ShieldCheck className="mr-1 h-3 w-3" />}
        {t(`bloodBanks.roles.${role}`)}
      </Badge>
      {position && <Badge variant="outline">{position}</Badge>}
    </span>
  );
}

export function BloodBankCard({ bank, className }: { bank: BloodBank; className?: string }) {
  const { t, i18n } = useTranslation();
  const locationLabel = useLocationLabel();
  const fmt = (n: number) => n.toLocaleString(i18n.language);

  return (
    <Card className={cn("lift-card accent-top group overflow-hidden", className)}>
      <Link href={`/blood-banks/${bank.id}`} className="flex h-full flex-col focus-visible:outline-none">
        {bank.cover && <BankCover cover={bank.cover} width={640} className="h-24 w-full" />}
        <CardContent className={cn("flex flex-1 flex-col gap-4 p-5", bank.cover && "pt-0")}>
          <div className={cn("flex items-start gap-3", bank.cover && "-mt-6")}>
            <BankLogo
              logo={bank.logo}
              name={bank.name}
              size={48}
              className={cn(bank.cover && "border-2 border-card shadow-md")}
            />
            <div className={cn("min-w-0 flex-1", bank.cover && "pt-6")}>
              <h3 className="truncate text-lg font-semibold group-hover:text-primary">{bank.name}</h3>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">{locationLabel(bank)}</span>
              </p>
            </div>
            {bank.status !== "approved" && <BankStatusBadge status={bank.status} />}
          </div>

          {bank.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{bank.description}</p>
          )}

          <dl className="mt-auto grid grid-cols-3 gap-2 border-t pt-3 text-center">
            <div>
              <dt className="sr-only">{t("bloodBanks.stats.members")}</dt>
              <dd className="flex items-center justify-center gap-1 font-bold tabular-nums">
                <Users className="h-4 w-4 text-primary" />
                {fmt(bank.memberCount)}
              </dd>
              <span className="text-xs text-muted-foreground" aria-hidden="true">
                {t("bloodBanks.stats.members")}
              </span>
            </div>
            <div>
              <dt className="sr-only">{t("bloodBanks.stats.donations")}</dt>
              <dd className="flex items-center justify-center gap-1 font-bold tabular-nums">
                <Droplet className="h-4 w-4 text-primary" />
                {fmt(bank.donationCount)}
              </dd>
              <span className="text-xs text-muted-foreground" aria-hidden="true">
                {t("bloodBanks.stats.donations")}
              </span>
            </div>
            <div>
              <dt className="sr-only">{t("bloodBanks.stats.points")}</dt>
              <dd className="flex items-center justify-center gap-1 font-bold tabular-nums">
                <Sparkles className="h-4 w-4 text-primary" />
                {fmt(bank.totalPoints)}
              </dd>
              <span className="text-xs text-muted-foreground" aria-hidden="true">
                {t("bloodBanks.stats.points")}
              </span>
            </div>
          </dl>
        </CardContent>
      </Link>
    </Card>
  );
}
