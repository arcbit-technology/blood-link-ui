import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BloodBadge } from "@/components/ui/blood-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone,
  MapPin,
  User as UserIcon,
  Briefcase,
  Calendar,
  Mail,
  EyeOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { extractDoner, getDonerById } from "@/api/donors";
import { mapApiUserToUser } from "@/api/mappers";

interface DonorDialogProps {
  donorId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonorDialog({ donorId, open, onOpenChange }: DonorDialogProps) {
  const { t } = useTranslation();
  const donorQuery = useQuery({
    queryKey: ["doner", donorId],
    enabled: open && !!donorId,
    queryFn: async () => {
      const res = await getDonerById(donorId as string);
      const apiUser = extractDoner(res);
      if (!apiUser) throw new Error("Donor not found.");
      return mapApiUserToUser(apiUser);
    },
    retry: false,
  });

  const donor = donorQuery.data ?? null;
  const isLoading = donorQuery.isLoading;
  const isError = donorQuery.isError;
  const canCall = !!donor?.phone && !donor?.hidePersonalInfo;

  const handleCall = () => {
    if (!donor?.phone) return;
    window.location.href = `tel:${donor.phone}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {t("donors.dialog.title")}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <>
            <div className="flex flex-col items-center py-4">
              <Skeleton className="h-20 w-20 rounded-full mb-4" />
              <Skeleton className="h-6 w-40 mb-4" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UserIcon className="h-5 w-5 text-primary" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
              <div className="pt-4">
                <Skeleton className="h-11 w-full rounded-md" />
              </div>
            </div>
          </>
        ) : isError || !donor ? (
          <div className="py-8 text-center text-muted-foreground">
            {t("common.somethingWentWrong")}
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center py-4">
              <BloodBadge
                bloodGroup={donor.bloodGroup}
                size="xl"
                animated
                className="mb-4"
              />

              {donor.hidePersonalInfo ? (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <EyeOff className="h-5 w-5" />
                  <span>{t("donors.dialog.hiddenInfo")}</span>
                </div>
              ) : (
                <h2 className="text-xl font-bold mb-4">{donor.name}</h2>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <UserIcon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("donors.dialog.genderAge")}
                  </p>
                  <p className="font-medium">
                    {t(`common.gender.${donor.gender}`)}
                    {!donor.hidePersonalInfo &&
                      `, ${donor.age} ${t("common.years")}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("common.address")}
                  </p>
                  <p className="font-medium">
                    {donor.hidePersonalInfo
                      ? `${t(`location.district.${donor.district}`)}, ${t(`location.division.${donor.division}`)}`
                      : `${donor.address}, ${t(`location.district.${donor.district}`)}, ${t(`location.division.${donor.division}`)}`}
                  </p>
                </div>
              </div>

              {!donor.hidePersonalInfo && (
                <>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("common.occupation")}
                      </p>
                      <p className="font-medium">{donor.occupation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("common.email")}
                      </p>
                      <p className="font-medium">{donor.email}</p>
                    </div>
                  </div>
                </>
              )}

              {donor.lastDonationDate && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("donors.dialog.lastDonation")}
                    </p>
                    <p className="font-medium">{donor.lastDonationDate}</p>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={handleCall}
                  disabled={!canCall}
                  className="w-full blood-gradient text-blood-foreground gap-2"
                  size="lg"
                >
                  <Phone className="h-5 w-5" />
                  {t("common.call")}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
