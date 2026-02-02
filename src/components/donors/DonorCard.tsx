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
        "cursor-pointer transition-all duration-300 hover:blood-shadow hover:-translate-y-1",
        "bg-card border-border overflow-hidden group",
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Header with blood group */}
        <div className="relative p-4 pb-8 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="absolute -bottom-6 right-4">
            <BloodBadge
              bloodGroup={donor.bloodGroup}
              size="lg"
              className="shadow-lg group-hover:animate-pulse-blood"
            />
          </div>

          {donor.hidePersonalInfo ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <EyeOff className="h-4 w-4" />
              <span className="text-sm">{t("donors.card.hiddenInfo")}</span>
            </div>
          ) : (
            <h3 className="font-semibold text-lg truncate pr-16">
              {donor.name}
            </h3>
          )}
        </div>

        {/* Body */}
        <div className="p-4 pt-8 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserIcon className="h-4 w-4 text-primary" />
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
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">
              {donor.hidePersonalInfo
                ? t(`location.district.${donor.district}`)
                : `${donor.address}, ${t(`location.district.${donor.district}`)}`}
            </span>
          </div>

          {!donor.hidePersonalInfo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="truncate">{donor.occupation}</span>
            </div>
          )}

          {donor.lastDonationDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span
                className={cn(
                  canDonate() ? "text-green-600" : "text-amber-600",
                )}
              >
                {canDonate()
                  ? t("donors.status.available")
                  : t("donors.status.unavailable")}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-muted/50 border-t text-center">
          <span className="text-sm text-primary font-medium">
            {t("donors.card.viewDetails")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
