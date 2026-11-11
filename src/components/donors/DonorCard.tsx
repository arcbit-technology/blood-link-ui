import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { BloodBadge } from "@/components/ui/blood-badge";
import {
  MapPin,
  User as UserIcon,
  Briefcase,
  Calendar,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface DonorCardProps {
  donor: User;
  onClick: () => void;
}

export function DonorCard({ donor, onClick }: DonorCardProps) {
  const { t } = useTranslation();

  const canDonate = () => {
    if (!donor.lastDonationDate) return true;
    const lastDonation = new Date(donor.lastDonationDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastDonation < threeMonthsAgo;
  };

  return (
    <Card
      className={cn(
        "lift-card flex h-full w-full cursor-pointer flex-col overflow-hidden group",
      )}
      onClick={onClick}
    >
      <CardContent className="flex flex-1 flex-col p-0">
        {/* Header with blood group */}
        <div className="relative p-4 pb-8 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
          <div aria-hidden="true" className="absolute inset-0 opacity-60 [background-image:radial-gradient(hsl(var(--primary)/0.18)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom_left,#000,transparent_70%)]" />
          <div className="absolute -bottom-6 right-4">
            <BloodBadge
              bloodGroup={donor.bloodGroup}
              size="lg"
              className="ring-4 ring-card blood-glow group-hover:animate-pulse-blood"
            />
          </div>

          {donor.hidePersonalInfo ? (
            <div className="relative flex items-center gap-2 text-muted-foreground">
              <EyeOff className="h-4 w-4" />
              <span className="text-sm">{t("donors.card.hiddenInfo")}</span>
            </div>
          ) : (
            <h3 className="relative font-semibold text-lg truncate pr-16">
              {donor.name}
            </h3>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 p-4 pt-8 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserIcon className="h-4 w-4 shrink-0 text-primary" />
            <span>{t(`common.gender.${donor.gender}`)}</span>
            {!donor.hidePersonalInfo && (
              <>
                <span className="text-border">•</span>
                <span>
                  {donor.age} {t("common.years")}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">
              {donor.hidePersonalInfo
                ? t(`location.district.${donor.district}`)
                : `${donor.address}, ${t(`location.district.${donor.district}`)}`}
            </span>
          </div>

          {!donor.hidePersonalInfo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{donor.occupation}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                canDonate()
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  canDonate() ? "bg-green-500" : "bg-amber-500",
                )}
                aria-hidden="true"
              />
              {canDonate()
                ? t("donors.status.available")
                : t("donors.status.unavailable")}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto px-4 py-3 bg-muted/60 border-t text-center transition-all duration-300 group-hover:blood-gradient group-hover:border-transparent">
          <span className="text-sm text-primary font-semibold transition-colors group-hover:text-white">
            {t("donors.card.viewDetails")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
