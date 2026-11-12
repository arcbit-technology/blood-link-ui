"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCheck,
  Droplet,
  HeartHandshake,
  History,
  Search,
  Users,
  X,
} from "lucide-react";
import { AdminShell, type AdminSection } from "@/components/admin/AdminShell";
import { AdminTable } from "@/components/admin/AdminTable";
import { BloodBankRequestsPanel } from "@/components/admin/BloodBankRequestsPanel";
import { UserAvatar } from "@/components/images/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { BloodBadge } from "@/components/ui/blood-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getBloodBanks } from "@/api/bloodBanks";
import {
  BLOOD_GROUPS,
  mockDonationHistory,
  mockDonationPosts,
  mockDonationRequests,
  mockUsers,
} from "@/data/mockData";

const statusColors = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
  accepted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  rejected:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
  completed:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
  open: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  fulfilled:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
  closed: "border-border bg-muted text-muted-foreground",
};
const urgencyColors = {
  normal: statusColors.completed,
  urgent: statusColors.pending,
  emergency: statusColors.rejected,
};

export default function Admin() {
  const { t, i18n } = useTranslation();
  const { user, token, isAuthenticated, isAuthLoading } = useAuth();
  const isPlatformAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
  const router = useRouter();
  const { toast } = useToast();
  const [section, setSection] = useState<AdminSection>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [users] = useState(
    mockUsers.filter((u) => u.role !== "ADMIN" && u.role !== "SUPERADMIN"),
  );
  const [requests, setRequests] = useState(mockDonationRequests);
  const [posts, setPosts] = useState(mockDonationPosts);
  const [history] = useState(mockDonationHistory);

  const pendingBanksQuery = useQuery({
    queryKey: ["bloodBanks", "admin", "pending"],
    enabled: isPlatformAdmin && !!token,
    queryFn: () => getBloodBanks({ status: "pending", size: 100 }, token),
  });

  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || !isPlatformAdmin))
      router.replace("/");
  }, [isAuthLoading, isAuthenticated, isPlatformAdmin, router]);

  if (isAuthLoading || !isAuthenticated || !isPlatformAdmin) return null;

  const number = (value: number) => value.toLocaleString(i18n.language);
  const date = (value: string) =>
    new Date(value).toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const pendingBanks = pendingBanksQuery.data?.totalCount ?? 0;
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const emergencyRequests = pendingRequests.filter(
    (r) => r.urgency === "emergency" || r.isAdminRequest,
  );
  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.district].some((value) =>
      value.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    ),
  );
  const recentDonations = [...history]
    .sort(
      (a, b) =>
        new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime(),
    )
    .slice(0, 4);
  const bloodGroups = BLOOD_GROUPS.map((group) => ({
    group,
    count: users.filter((u) => u.bloodGroup === group).length,
  }));
  const maxGroupCount = Math.max(...bloodGroups.map(({ count }) => count), 1);
  const emptyMessage = t("admin.workspace.noResults");
  const columns = (group: string, keys: string[]) =>
    keys.map((key) => t(`admin.${group}.table.${key}`));
  const statusBadge = (status: keyof typeof statusColors) => (
    <Badge
      variant="outline"
      className={`gap-1.5 whitespace-nowrap font-medium ${statusColors[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {t(`admin.status.${status}`)}
    </Badge>
  );

  const handleReviewRequest = (id: string, status: "accepted" | "rejected") => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status } : request,
      ),
    );
    toast({
      title: t(
        `admin.requests.toasts.${status === "accepted" ? "approved" : "rejected"}`,
      ),
    });
  };
  const handleClosePost = (id: string) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === id ? { ...post, status: "closed" } : post,
      ),
    );
    toast({ title: t("admin.posts.toasts.closed") });
  };
  const requestActions = (id: string) => (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-9 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/25 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
        onClick={() => handleReviewRequest(id, "accepted")}
      >
        <Check className="h-3.5 w-3.5" />
        {t("admin.bloodBanks.approve")}
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="h-9 w-9 text-muted-foreground hover:text-destructive"
        aria-label={t("admin.bloodBanks.reject")}
        onClick={() => handleReviewRequest(id, "rejected")}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
  const viewAll = (target: AdminSection) => (
    <Button
      variant="ghost"
      size="sm"
      className="shrink-0 gap-1.5 text-xs text-muted-foreground"
      onClick={() => setSection(target)}
    >
      {t("admin.workspace.viewAll")}
      <ArrowRight className="h-3.5 w-3.5" />
    </Button>
  );

  const stats = [
    {
      label: t("admin.stats.totalUsers"),
      value: users.length,
      icon: Users,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      description: t("admin.workspace.registeredDonors"),
      target: "users",
    },
    {
      label: t("admin.stats.successfulDonations"),
      value: history.length,
      icon: Droplet,
      color:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
      description: t("admin.workspace.donationsCompleted"),
      target: "history",
    },
    {
      label: t("admin.stats.pendingRequests"),
      value: pendingRequests.length,
      icon: HeartHandshake,
      color:
        "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      description: t("admin.workspace.awaitingReview"),
      target: "requests",
    },
    {
      label: t("admin.stats.emergencyRequests"),
      value: emergencyRequests.length,
      icon: AlertCircle,
      color: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
      description: t("admin.workspace.priorityRequests"),
      target: "requests",
    },
  ] as const;

  return (
    <AdminShell
      section={section}
      onSectionChange={setSection}
      counts={{ bloodBanks: pendingBanks, requests: pendingRequests.length }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.15em] text-primary">
            {t("admin.workspace.workspace")}
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t(
              section === "overview"
                ? "admin.workspace.overviewTitle"
                : `admin.${section}.title`,
            )}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t(`admin.workspace.descriptions.${section}`)}
          </p>
        </div>
        {section === "overview" && (
          <Button
            className="h-10 gap-2 rounded-lg shadow-sm"
            onClick={() => setSection("requests")}
          >
            <HeartHandshake className="h-4 w-4" />
            {t("admin.workspace.reviewRequests")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {section === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
            {stats.map(
              ({ label, value, icon: Icon, color, description, target }) => (
                <button
                  key={label}
                  onClick={() => setSection(target)}
                  className="group min-w-0 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                    {label}
                  </p>
                  <p className="mb-1 mt-1 text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
                    {number(value)}
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                    {description}
                  </p>
                </button>
              ),
            )}
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Card className="min-w-0 rounded-xl shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-5">
                <div>
                  <CardTitle className="text-base">
                    {t("admin.workspace.reviewQueue")}
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {t("admin.workspace.reviewQueueDescription")}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="shrink-0 rounded-md font-medium"
                >
                  {number(pendingRequests.length)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-1 pt-0">
                {pendingRequests.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <CheckCheck className="h-8 w-8 text-emerald-500" />
                    <p className="text-sm text-muted-foreground">
                      {t("admin.workspace.allCaughtUp")}
                    </p>
                  </div>
                )}
                {[...pendingRequests]
                  .sort(
                    (a, b) =>
                      Number(b.urgency === "emergency" || b.isAdminRequest) -
                      Number(a.urgency === "emergency" || a.isAdminRequest),
                  )
                  .slice(0, 3)
                  .map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-wrap items-center gap-3 border-b py-4 first:pt-1 last:border-0"
                    >
                      <BloodBadge bloodGroup={request.bloodGroup} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {request.patientName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {request.hospitalName}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${urgencyColors[request.urgency]}`}
                      >
                        {t(`admin.urgency.${request.urgency}`)}
                      </Badge>
                      <div className="flex w-full justify-end sm:w-auto">
                        {requestActions(request.id)}
                      </div>
                    </div>
                  ))}
                <div className="flex justify-end pt-2">
                  {viewAll("requests")}
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0 rounded-xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">
                  {t("admin.workspace.bloodGroupDistribution")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("admin.workspace.bloodGroupDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3.5">
                  {bloodGroups.map(({ group, count }) => (
                    <div
                      key={group}
                      className="flex items-center gap-3 text-xs"
                    >
                      <span className="w-7 shrink-0 font-semibold">
                        {group}
                      </span>
                      <div
                        role="meter"
                        aria-label={group}
                        aria-valuemin={0}
                        aria-valuemax={maxGroupCount}
                        aria-valuenow={count}
                        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                      >
                        <div
                          className={`h-full rounded-full ${group.startsWith("O") ? "bg-primary" : "bg-primary/45"}`}
                          style={{ width: `${(count / maxGroupCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-5 text-right tabular-nums text-muted-foreground">
                        {number(count)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                  <span>{t("admin.stats.totalUsers")}</span>
                  <span className="font-semibold text-foreground">
                    {number(users.length)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Card className="min-w-0 rounded-xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-base">
                    {t("admin.workspace.recentDonations")}
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {t("admin.workspace.recentDonationsDescription")}
                  </CardDescription>
                </div>
                {viewAll("history")}
              </CardHeader>
              <CardContent className="pt-0">
                {recentDonations.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </p>
                )}
                {recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center gap-3 border-b py-3.5 last:border-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <ArrowDownLeft className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {donation.donorName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {donation.hospitalName}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {donation.bloodGroup}
                        <span className="ml-2 font-normal text-muted-foreground">
                          {number(donation.units)} {t("admin.history.units")}
                        </span>
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {date(donation.donationDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="min-w-0 rounded-xl border-primary/20 bg-primary/[0.035] shadow-sm">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-card text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">
                  {t("admin.workspace.bankApprovals")}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {t("admin.workspace.bankApprovalsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold tabular-nums tracking-tight">
                  {pendingBanksQuery.isLoading || pendingBanksQuery.isError
                    ? "—"
                    : number(pendingBanks)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(
                    pendingBanksQuery.isError
                      ? "admin.workspace.bankLoadError"
                      : "admin.workspace.awaitingReview",
                  )}
                </p>
                <Button
                  variant="outline"
                  className="mt-6 w-full justify-between gap-2 bg-card"
                  onClick={() => setSection("bloodBanks")}
                >
                  {t("admin.workspace.manageBanks")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {section === "bloodBanks" && <BloodBankRequestsPanel />}

      {section === "users" && (
        <Card className="min-w-0 rounded-xl shadow-sm">
          <CardHeader className="flex flex-col justify-between gap-4 space-y-0 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">
                {t("admin.users.title")}
              </CardTitle>
              <Badge variant="secondary" className="rounded-md">
                {number(filteredUsers.length)}
              </Badge>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label={t("admin.users.searchPlaceholder")}
                placeholder={t("admin.users.searchPlaceholder")}
                className="h-10 bg-background pl-9"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <AdminTable
              columns={columns("users", [
                "name",
                "bloodGroup",
                "gender",
                "district",
                "phone",
                "privacy",
              ])}
              emptyMessage={emptyMessage}
              rows={filteredUsers.map((u) => ({
                id: u.id,
                cells: [
                  <div className="flex min-w-0 items-center gap-3" key="name">
                    <UserAvatar name={u.name} src={u.photo} size={34} />
                    <div className="min-w-0">
                      <p className="font-medium">{u.name}</p>
                      <p className="mt-0.5 break-all text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    </div>
                  </div>,
                  <BloodBadge
                    key="blood"
                    bloodGroup={u.bloodGroup}
                    size="sm"
                  />,
                  t(`common.gender.${u.gender}`),
                  t(`location.district.${u.district}`, {
                    defaultValue: u.district,
                  }),
                  <span
                    key="phone"
                    className="whitespace-nowrap text-xs tabular-nums"
                  >
                    {u.phone}
                  </span>,
                  <Badge
                    key="privacy"
                    variant="outline"
                    className="font-normal text-muted-foreground"
                  >
                    {t(
                      `admin.users.privacy.${u.hidePersonalInfo ? "hidden" : "public"}`,
                    )}
                  </Badge>,
                ],
              }))}
            />
          </CardContent>
        </Card>
      )}

      {section === "requests" && (
        <Card className="min-w-0 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <CardTitle className="text-base">
              {t("admin.requests.title")}
            </CardTitle>
            <Badge variant="secondary" className="rounded-md">
              {number(requests.length)}
            </Badge>
          </CardHeader>
          <CardContent>
            <AdminTable
              columns={columns("requests", [
                "requester",
                "patient",
                "bloodGroup",
                "urgency",
                "hospital",
                "status",
                "action",
              ])}
              emptyMessage={emptyMessage}
              rows={requests.map((request) => ({
                id: request.id,
                cells: [
                  <div key="requester">
                    <p className="font-medium">{request.requesterName}</p>
                    {request.isAdminRequest && (
                      <p className="mt-1 text-[10px] font-medium text-primary">
                        {t("admin.requests.adminRequest")}
                      </p>
                    )}
                  </div>,
                  request.patientName,
                  <BloodBadge
                    key="blood"
                    bloodGroup={request.bloodGroup}
                    size="sm"
                  />,
                  <Badge
                    key="urgency"
                    variant="outline"
                    className={`whitespace-nowrap font-medium ${urgencyColors[request.urgency]}`}
                  >
                    {t(`admin.urgency.${request.urgency}`)}
                  </Badge>,
                  <div key="hospital">
                    <p>{request.hospitalName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t(`location.district.${request.district}`, {
                        defaultValue: request.district,
                      })}
                    </p>
                  </div>,
                  statusBadge(request.status),
                  request.status === "pending" ? (
                    requestActions(request.id)
                  ) : (
                    <span
                      key="reviewed"
                      className="text-xs text-muted-foreground"
                    >
                      {t("admin.workspace.reviewed")}
                    </span>
                  ),
                ],
              }))}
            />
          </CardContent>
        </Card>
      )}

      {section === "posts" && (
        <Card className="min-w-0 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <CardTitle className="text-base">
              {t("admin.posts.title")}
            </CardTitle>
            <Badge variant="secondary" className="rounded-md">
              {number(posts.length)}
            </Badge>
          </CardHeader>
          <CardContent>
            <AdminTable
              columns={columns("posts", [
                "title",
                "author",
                "bloodGroup",
                "hospital",
                "interested",
                "status",
                "action",
              ])}
              emptyMessage={emptyMessage}
              rows={posts.map((post) => ({
                id: post.id,
                cells: [
                  <p key="title" className="min-w-40 max-w-xs font-medium">
                    {post.title}
                  </p>,
                  post.authorName,
                  <BloodBadge
                    key="blood"
                    bloodGroup={post.bloodGroup}
                    size="sm"
                  />,
                  <div key="hospital">
                    <p>{post.hospitalName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t(`location.district.${post.district}`, {
                        defaultValue: post.district,
                      })}
                    </p>
                  </div>,
                  `${number(post.interestedUsers.length)} ${t("admin.posts.interestedCount")}`,
                  statusBadge(post.status),
                  post.status === "open" ? (
                    <Button
                      key="close"
                      size="sm"
                      variant="outline"
                      onClick={() => handleClosePost(post.id)}
                    >
                      {t("admin.posts.close")}
                    </Button>
                  ) : (
                    <span
                      key="reviewed"
                      className="text-xs text-muted-foreground"
                    >
                      {t("admin.workspace.reviewed")}
                    </span>
                  ),
                ],
              }))}
            />
          </CardContent>
        </Card>
      )}

      {section === "history" && (
        <Card className="min-w-0 rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" />
              {t("admin.history.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminTable
              columns={columns("history", [
                "donor",
                "recipient",
                "bloodGroup",
                "hospital",
                "units",
                "date",
              ])}
              emptyMessage={emptyMessage}
              rows={[...history]
                .sort(
                  (a, b) =>
                    new Date(b.donationDate).getTime() -
                    new Date(a.donationDate).getTime(),
                )
                .map((donation) => ({
                  id: donation.id,
                  cells: [
                    <span key="donor" className="font-medium">
                      {donation.donorName}
                    </span>,
                    donation.recipientName,
                    <BloodBadge
                      key="blood"
                      bloodGroup={donation.bloodGroup}
                      size="sm"
                    />,
                    donation.hospitalName,
                    `${number(donation.units)} ${t("admin.history.units")}`,
                    <span
                      key="date"
                      className="whitespace-nowrap text-xs text-muted-foreground"
                    >
                      {date(donation.donationDate)}
                    </span>,
                  ],
                }))}
            />
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}
