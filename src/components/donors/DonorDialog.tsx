import { User } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BloodBadge } from "@/components/ui/blood-badge";
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

interface DonorDialogProps {
  donor: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonorDialog({ donor, open, onOpenChange }: DonorDialogProps) {
  const { t } = useTranslation();

  if (!donor) return null;

  const handleCall = () => {
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
              className="w-full blood-gradient text-primary-foreground gap-2"
              size="lg"
            >
              <Phone className="h-5 w-5" />
              {t("common.call")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
