"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BadgeCheck, CheckCircle2, MessageCircle, Phone, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { BloodBadge } from "@/components/ui/blood-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocationLabel } from "@/components/common/LocationSelect";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOpenDirectChat } from "@/hooks/useConversations";
import { confirmDonation, getPostInterests } from "@/api/gamification";
import { apiErrorMessage } from "@/lib/apiErrors";
import type { BloodGroup, DonationPost, InterestedDonor } from "@/types";

interface InterestedDonorsSheetProps {
  post: DonationPost | null;
  onOpenChange: (open: boolean) => void;
}

/** Post author: who is interested, message them, and confirm who donated. */
export function InterestedDonorsSheet({ post, onOpenChange }: InterestedDonorsSheetProps) {
  const { t, i18n } = useTranslation();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const locationLabel = useLocationLabel();
  const openChat = useOpenDirectChat();
  const [confirming, setConfirming] = useState<InterestedDonor | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const query = useQuery({
    queryKey: ["postInterests", post?.id],
    enabled: !!post && !!token,
    queryFn: () => getPostInterests(post!.id, token as string),
  });

  const confirm = useMutation({
    mutationFn: (donor: InterestedDonor) =>
      confirmDonation(post!.id, { donor_id: donor.userId, units: 1, donation_date: date }, token as string),
    onSuccess: (res) => {
      toast({
        title: t("posts.donors.confirmed.title"),
        description: t("posts.donors.confirmed.description", { points: res.pointsAwarded }),
      });
      setConfirming(null);
      void queryClient.invalidateQueries({ queryKey: ["postInterests", post?.id] });
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      void queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (e) => toast({ title: apiErrorMessage(e, t), variant: "destructive" }),
  });

  const donors = query.data ?? [];
  const name = (d: InterestedDonor) => [d.firstName, d.lastName].filter(Boolean).join(" ") || t("leaderboard.anonymous");

  return (
    <>
      <Sheet open={!!post} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t("posts.donors.title")}
            </SheetTitle>
            <SheetDescription>{t("posts.donors.description")}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-3">
            {query.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : donors.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">{t("posts.donors.empty")}</p>
            ) : (
              donors.map((d) => (
                <div key={d.userId} className="space-y-3 rounded-xl border p-4">
                  <div className="flex items-start gap-3">
                    {d.bloodGroup && <BloodBadge bloodGroup={d.bloodGroup as BloodGroup} size="sm" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{name(d)}</p>
                      <p className="text-xs text-muted-foreground">
                        {[locationLabel(d), d.bloodBankName].filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("posts.donors.stats", { points: d.points, count: d.donationCount })}
                        {d.donatedAt &&
                          ` · ${t("posts.donors.lastDonated", {
                            date: new Date(d.donatedAt).toLocaleDateString(i18n.language),
                          })}`}
                      </p>
                    </div>
                    {d.confirmed ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300">
                        <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                        {t("posts.donors.donated")}
                      </Badge>
                    ) : !d.eligible ? (
                      <Badge variant="outline">{t("posts.donors.notEligible")}</Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {d.phone && (
                      <Button asChild size="sm" variant="outline">
                        <a href={`tel:${d.phone}`}>
                          <Phone className="mr-1 h-4 w-4" />
                          {t("common.call")}
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={openChat.isPending}
                      onClick={() => openChat.mutate({ postId: post!.id, userId: d.userId })}
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      {t("posts.donors.message")}
                    </Button>
                    {!d.confirmed && (
                      <Button
                        size="sm"
                        className="blood-gradient text-blood-foreground"
                        disabled={!d.eligible}
                        onClick={() => setConfirming(d)}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        {t("posts.donors.confirm")}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirming} onOpenChange={(open) => !open && setConfirming(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("posts.donors.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirming && t("posts.donors.confirmBody", { name: name(confirming) })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="donation-date">{t("posts.donors.date")}</Label>
            <Input
              id="donation-date"
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("bloodBanks.manage.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirm.isPending || !date}
              onClick={(e) => {
                e.preventDefault();
                if (confirming) confirm.mutate(confirming);
              }}
            >
              {t("posts.donors.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
