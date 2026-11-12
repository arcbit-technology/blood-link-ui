"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Building2,
  Camera,
  Calendar,
  Clock,
  Droplet,
  LogOut,
  MapPin,
  MessagesSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLocationLabel } from "@/components/common/LocationSelect";
import { BankRoleBadge, BankStatusBadge } from "@/components/bloodbank/BloodBankCard";
import { BankMembersList } from "@/components/bloodbank/BankMembersList";
import { BankManagePanel } from "@/components/bloodbank/BankManagePanel";
import { LeaderboardTable } from "@/components/gamification/LeaderboardTable";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { BankCover, BankLogo } from "@/components/bloodbank/BankImages";
import { ImageSlotMenu } from "@/components/images/ImageSlotMenu";
import { IMAGE_PRESETS } from "@/components/images/ImageUploadDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MY_BLOOD_BANK_KEY, useMyBloodBank } from "@/hooks/useMyBloodBank";
import {
  getBankConversation,
  getBankMembers,
  getBloodBank,
  joinBloodBank,
  leaveBloodBank,
} from "@/api/bloodBanks";
import { getBankLeaderboard, type LeaderboardPeriod } from "@/api/gamification";
import { apiErrorMessage } from "@/lib/apiErrors";
import type { BankRole } from "@/types";

export default function BloodBankDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated } = useAuth();
  const locationLabel = useLocationLabel();
  const my = useMyBloodBank();
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const fmt = (n: number) => n.toLocaleString(i18n.language);

  const bankQuery = useQuery({
    queryKey: ["bloodBank", id, !!token],
    enabled: Number.isFinite(id) && id > 0,
    queryFn: () => getBloodBank(id, token),
    retry: false,
  });
  const bank = bankQuery.data;

  const membership = my.data?.membership ?? null;
  const isMemberHere = membership?.bloodBankId === id;
  const viewerRole: BankRole | "" = isMemberHere && membership?.status === "active" ? membership.role : "";
  const isPlatformAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const canManage = viewerRole === "admin" || viewerRole === "officer" || isPlatformAdmin;
  const canEditImages = viewerRole === "admin" || isPlatformAdmin;
  const approved = bank?.status === "approved";

  const membersQuery = useQuery({
    queryKey: ["bankMembers", id, "active", !!token],
    enabled: !!bank && approved,
    queryFn: () => getBankMembers(id, "active", token),
  });

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard", "bank", id, period],
    enabled: !!bank && approved,
    queryFn: () => getBankLeaderboard(id, period),
  });

  const conversationQuery = useQuery({
    queryKey: ["bankConversation", id],
    enabled: !!viewerRole && !!token && approved,
    queryFn: () => getBankConversation(id, token as string),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: MY_BLOOD_BANK_KEY });
    void queryClient.invalidateQueries({ queryKey: ["bloodBank", id] });
    void queryClient.invalidateQueries({ queryKey: ["bankMembers", id] });
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };
  const onError = (e: unknown) => toast({ title: apiErrorMessage(e, t), variant: "destructive" });

  // logo / cover changed: update this page at once, refresh lists in the background
  const onImageChange = (field: "logo" | "cover") => (url: string) => {
    queryClient.setQueriesData<typeof bankQuery.data>({ queryKey: ["bloodBank", id] }, (b) => (b ? { ...b, [field]: url } : b));
    void queryClient.invalidateQueries({ queryKey: ["bloodBanks"] });
    void queryClient.invalidateQueries({ queryKey: MY_BLOOD_BANK_KEY });
  };

  const join = useMutation({
    mutationFn: () => joinBloodBank(id, token as string),
    onSuccess: () => {
      toast({ title: t("bloodBanks.detail.joinRequested.title"), description: t("bloodBanks.detail.joinRequested.description") });
      refresh();
    },
    onError,
  });
  const leave = useMutation({
    mutationFn: () => leaveBloodBank(id, token as string),
    onSuccess: () => {
      toast({ title: membership?.status === "pending" ? t("bloodBanks.detail.requestCancelled") : t("bloodBanks.detail.left") });
      refresh();
    },
    onError,
  });

  if (bankQuery.isLoading) {
    return (
      <Layout>
        <div className="container space-y-6 py-8">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!bank) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Building2 className="mx-auto mb-4 h-14 w-14 text-muted-foreground/50" />
          <h1 className="mb-2 text-2xl font-bold">{t("bloodBanks.detail.notFound")}</h1>
          <Button asChild variant="outline">
            <Link href="/blood-banks">{t("bloodBanks.detail.backToList")}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const membershipAction = (() => {
    if (!approved) return null;
    if (!isAuthenticated) {
      return (
        <Button asChild className="rounded-full">
          <Link href="/login">{t("bloodBanks.detail.loginToJoin")}</Link>
        </Button>
      );
    }
    if (isMemberHere && membership?.status === "pending") {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm text-amber-700 dark:text-amber-300">
            <Clock className="h-4 w-4" />
            {t("bloodBanks.detail.pending")}
          </span>
          <Button variant="outline" size="sm" onClick={() => leave.mutate()} disabled={leave.isPending}>
            {t("bloodBanks.detail.cancelRequest")}
          </Button>
        </div>
      );
    }
    if (isMemberHere && viewerRole) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <BankRoleBadge role={viewerRole} position={membership?.position} />
          {viewerRole !== "admin" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <LogOut className="mr-1 h-4 w-4" />
                  {t("bloodBanks.detail.leave")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("bloodBanks.detail.leaveConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("bloodBanks.detail.leaveConfirmBody", { name: bank.name })}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("bloodBanks.manage.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => leave.mutate()}>{t("bloodBanks.detail.leave")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      );
    }
    if (membership || my.data?.pendingRequest) {
      return <p className="max-w-xs text-sm text-muted-foreground">{t("bloodBanks.detail.inAnotherBank")}</p>;
    }
    return (
      <Button
        className="gap-2 rounded-full blood-gradient text-blood-foreground"
        onClick={() => join.mutate()}
        disabled={join.isPending}
      >
        <UserPlus className="h-4 w-4" />
        {t("bloodBanks.detail.join")}
      </Button>
    );
  })();

  const members = membersQuery.data ?? [];
  const admin = members.find((m) => m.role === "admin");

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <Card className="mb-6 overflow-hidden border-primary/15">
          <div className="relative">
            <BankCover cover={bank.cover} className={bank.cover ? "aspect-[16/5] max-h-64 w-full" : "h-24"} />
            {canEditImages && (
              <div className="absolute right-3 top-3">
                <ImageSlotMenu
                  slot={{ target: "bank_cover", bloodBankId: bank.id }}
                  preset={IMAGE_PRESETS.cover}
                  hasImage={!!bank.cover}
                  label={t("images.bankCover")}
                  description={t("images.bankCoverHint")}
                  onChange={onImageChange("cover")}
                >
                  <Button type="button" size="sm" variant="secondary" className="gap-1.5 rounded-full shadow-md">
                    <Camera className="h-4 w-4" />
                    {bank.cover ? t("images.changeCover") : t("images.addCover")}
                  </Button>
                </ImageSlotMenu>
              </div>
            )}
          </div>
          <CardContent className="relative pt-0">
            <div className="-mt-10 flex flex-col gap-4 md:flex-row md:items-end">
              <div className="relative w-fit">
                <BankLogo logo={bank.logo} name={bank.name} size={80} className="rounded-3xl border-4 border-card shadow-md" />
                {canEditImages && (
                  <ImageSlotMenu
                    slot={{ target: "bank_logo", bloodBankId: bank.id }}
                    preset={IMAGE_PRESETS.logo}
                    hasImage={!!bank.logo}
                    label={t("images.bankLogo")}
                    description={t("images.bankLogoHint")}
                    onChange={onImageChange("logo")}
                    className="absolute -bottom-2 -right-2"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 md:pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold md:text-3xl">{bank.name}</h1>
                  {!approved && <BankStatusBadge status={bank.status} />}
                </div>
                <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {locationLabel(bank)}, {t(`location.division.${bank.division}`, { defaultValue: bank.division })}
                </p>
              </div>
              <div className="md:pb-1">{membershipAction}</div>
            </div>

            {approved && (
              <dl className="mt-6 grid grid-cols-3 gap-3 border-t pt-4 text-center">
                {[
                  { icon: Users, label: t("bloodBanks.stats.members"), value: bank.memberCount },
                  { icon: Droplet, label: t("bloodBanks.stats.donations"), value: bank.donationCount },
                  { icon: Sparkles, label: t("bloodBanks.stats.points"), value: bank.totalPoints },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label}>
                    <dd className="flex items-center justify-center gap-1.5 text-2xl font-extrabold tabular-nums">
                      <Icon className="h-5 w-5 text-primary" />
                      {fmt(value)}
                    </dd>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Status banners for the creator / platform admins */}
        {bank.status === "pending" && (
          <Alert className="mb-6">
            <Clock className="h-4 w-4" />
            <AlertTitle>{t("bloodBanks.detail.pendingReview.title")}</AlertTitle>
            <AlertDescription>{t("bloodBanks.detail.pendingReview.description")}</AlertDescription>
          </Alert>
        )}
        {(bank.status === "rejected" || bank.status === "suspended") && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t(`bloodBanks.detail.${bank.status}.title`)}</AlertTitle>
            <AlertDescription>
              {bank.rejectionReason ? t("bloodBanks.detail.reason", { reason: bank.rejectionReason }) : null}
            </AlertDescription>
          </Alert>
        )}

        {approved && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              <TabsTrigger value="overview">{t("bloodBanks.tabs.overview")}</TabsTrigger>
              <TabsTrigger value="members">{t("bloodBanks.tabs.members")}</TabsTrigger>
              <TabsTrigger value="leaderboard">{t("bloodBanks.tabs.leaderboard")}</TabsTrigger>
              {viewerRole && (
                <TabsTrigger value="chat">
                  <MessagesSquare className="mr-1.5 h-4 w-4" />
                  {t("bloodBanks.tabs.chat")}
                </TabsTrigger>
              )}
              {canManage && (
                <TabsTrigger value="manage">
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                  {t("bloodBanks.tabs.manage")}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("bloodBanks.detail.about")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <p className="whitespace-pre-line text-muted-foreground">
                      {bank.description || t("bloodBanks.detail.noDescription")}
                    </p>
                    <ul className="space-y-2">
                      {admin && (
                        <li className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          {t("bloodBanks.detail.admin")}: <span className="font-medium">{bank.adminName}</span>
                        </li>
                      )}
                      {bank.address && (
                        <li className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          {bank.address}
                        </li>
                      )}
                      {bank.contactPhone && (
                        <li className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <a href={`tel:${bank.contactPhone}`} className="hover:text-primary">
                            {bank.contactPhone}
                          </a>
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {t("bloodBanks.detail.since", {
                          date: new Date(bank.reviewedAt ?? bank.createdAt).toLocaleDateString(i18n.language),
                        })}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("bloodBanks.detail.topHeroes")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LeaderboardTable
                      entries={(leaderboardQuery.data ?? []).slice(0, 5)}
                      isLoading={leaderboardQuery.isLoading}
                      currentUserId={user ? Number(user.id) : undefined}
                      hideBank
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="members">
              <Card>
                <CardContent className="pt-6">
                  <BankMembersList
                    members={members}
                    isLoading={membersQuery.isLoading}
                    currentUserId={user ? Number(user.id) : undefined}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard">
              <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
                  <CardTitle>{t("bloodBanks.tabs.leaderboard")}</CardTitle>
                  <ToggleGroup
                    type="single"
                    value={period}
                    onValueChange={(v) => v && setPeriod(v as LeaderboardPeriod)}
                    aria-label={t("leaderboard.period")}
                  >
                    <ToggleGroupItem value="all">{t("leaderboard.allTime")}</ToggleGroupItem>
                    <ToggleGroupItem value="month">{t("leaderboard.thisMonth")}</ToggleGroupItem>
                  </ToggleGroup>
                </CardHeader>
                <CardContent>
                  <LeaderboardTable
                    entries={leaderboardQuery.data ?? []}
                    isLoading={leaderboardQuery.isLoading}
                    currentUserId={user ? Number(user.id) : undefined}
                    hideBank
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {viewerRole && (
              <TabsContent value="chat">
                {conversationQuery.data ? (
                  <ChatWindow conversation={conversationQuery.data} className="h-[70vh] min-h-[420px]" />
                ) : (
                  <Skeleton className="h-[70vh] rounded-2xl" />
                )}
              </TabsContent>
            )}

            {canManage && (
              <TabsContent value="manage">
                <BankManagePanel
                  bank={bank}
                  members={members}
                  viewerRole={viewerRole}
                  isPlatformAdmin={isPlatformAdmin}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
