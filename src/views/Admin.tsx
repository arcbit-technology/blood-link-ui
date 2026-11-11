"use client";

import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BloodBadge } from "@/components/ui/blood-badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Droplet,
  AlertCircle,
  History,
  Search,
  Check,
  X,
  Eye,
  Trash2,
} from "lucide-react";
import {
  mockUsers,
  mockDonationRequests,
  mockDonationPosts,
  mockDonationHistory,
} from "@/data/mockData";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function Admin() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [users] = useState(mockUsers.filter((u) => u.role !== "ADMIN"));
  const [requests, setRequests] = useState(mockDonationRequests);
  const [posts, setPosts] = useState(mockDonationPosts);
  const [history] = useState(mockDonationHistory);

  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [isAuthLoading, isAuthenticated, user?.role, router]);

  if (isAuthLoading || !isAuthenticated || user?.role !== "ADMIN") return null;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.district.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleApproveRequest = (requestId: string) => {
    setRequests(
      requests.map((req) =>
        req.id === requestId ? { ...req, status: "accepted" as const } : req,
      ),
    );
    toast({ title: t("admin.requests.toasts.approved") });
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(
      requests.map((req) =>
        req.id === requestId ? { ...req, status: "rejected" as const } : req,
      ),
    );
    toast({ title: t("admin.requests.toasts.rejected") });
  };

  const handleClosePost = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, status: "closed" as const } : post,
      ),
    );
    toast({ title: t("admin.posts.toasts.closed") });
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    open: "bg-green-100 text-green-800",
    fulfilled: "bg-blue-100 text-blue-800",
    closed: "bg-muted text-muted-foreground",
  };

  const statusLabels = {
    pending: t("admin.status.pending"),
    accepted: t("admin.status.accepted"),
    rejected: t("admin.status.rejected"),
    completed: t("admin.status.completed"),
    open: t("admin.status.open"),
    fulfilled: t("admin.status.fulfilled"),
    closed: t("admin.status.closed"),
  };

  const urgencyColors = {
    normal: "bg-blue-100 text-blue-800",
    urgent: "bg-amber-100 text-amber-800",
    emergency: "bg-red-100 text-red-800",
  };

  const urgencyLabels = {
    normal: t("admin.urgency.normal"),
    urgent: t("admin.urgency.urgent"),
    emergency: t("admin.urgency.emergency"),
  };

  // Stats
  const totalUsers = users.length;
  const totalDonations = history.length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const emergencyRequests = requests.filter(
    (r) => r.isAdminRequest && r.status === "pending",
  ).length;

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t("admin.dashboard.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.dashboard.subtitle")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 blood-gradient rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">
                  {t("admin.stats.totalUsers")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Droplet className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDonations}</p>
                <p className="text-sm text-muted-foreground">
                  {t("admin.stats.successfulDonations")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests}</p>
                <p className="text-sm text-muted-foreground">
                  {t("admin.stats.pendingRequests")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emergencyRequests}</p>
                <p className="text-sm text-muted-foreground">
                  {t("admin.stats.emergencyRequests")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">{t("admin.tabs.users")}</TabsTrigger>
            <TabsTrigger value="requests">
              {t("admin.tabs.requests")}
              {pendingRequests > 0 && (
                <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                  {pendingRequests}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="posts">{t("admin.tabs.posts")}</TabsTrigger>
            <TabsTrigger value="history">{t("admin.tabs.history")}</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>{t("admin.users.title")}</CardTitle>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("admin.users.searchPlaceholder")}
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.users.table.name")}</TableHead>
                        <TableHead>
                          {t("admin.users.table.bloodGroup")}
                        </TableHead>
                        <TableHead>{t("admin.users.table.gender")}</TableHead>
                        <TableHead>{t("admin.users.table.district")}</TableHead>
                        <TableHead>{t("admin.users.table.phone")}</TableHead>
                        <TableHead>{t("admin.users.table.privacy")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {u.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <BloodBadge bloodGroup={u.bloodGroup} size="sm" />
                          </TableCell>
                          <TableCell>
                            {t(`common.gender.${u.gender}`)}
                          </TableCell>
                          <TableCell>{u.district}</TableCell>
                          <TableCell>{u.phone}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.hidePersonalInfo ? "secondary" : "outline"
                              }
                            >
                              {u.hidePersonalInfo
                                ? t("admin.users.privacy.hidden")
                                : t("admin.users.privacy.public")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.requests.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t("admin.requests.table.requester")}
                        </TableHead>
                        <TableHead>
                          {t("admin.requests.table.patient")}
                        </TableHead>
                        <TableHead>
                          {t("admin.requests.table.bloodGroup")}
                        </TableHead>
                        <TableHead>
                          {t("admin.requests.table.urgency")}
                        </TableHead>
                        <TableHead>
                          {t("admin.requests.table.hospital")}
                        </TableHead>
                        <TableHead>
                          {t("admin.requests.table.status")}
                        </TableHead>
                        <TableHead>
                          {t("admin.requests.table.action")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{req.requesterName}</p>
                              {req.isAdminRequest && (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  {t("admin.requests.adminRequest")}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{req.patientName}</TableCell>
                          <TableCell>
                            <BloodBadge bloodGroup={req.bloodGroup} size="sm" />
                          </TableCell>
                          <TableCell>
                            <Badge className={urgencyColors[req.urgency]}>
                              {urgencyLabels[req.urgency]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{req.hospitalName}</p>
                              <p className="text-xs text-muted-foreground">
                                {req.district}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[req.status]}>
                              {statusLabels[req.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {req.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveRequest(req.id)}
                                  className="blood-gradient text-primary-foreground"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectRequest(req.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.posts.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.posts.table.title")}</TableHead>
                        <TableHead>{t("admin.posts.table.author")}</TableHead>
                        <TableHead>
                          {t("admin.posts.table.bloodGroup")}
                        </TableHead>
                        <TableHead>{t("admin.posts.table.hospital")}</TableHead>
                        <TableHead>
                          {t("admin.posts.table.interested")}
                        </TableHead>
                        <TableHead>{t("admin.posts.table.status")}</TableHead>
                        <TableHead>{t("admin.posts.table.action")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="max-w-[200px] truncate">
                            {post.title}
                          </TableCell>
                          <TableCell>{post.authorName}</TableCell>
                          <TableCell>
                            <BloodBadge
                              bloodGroup={post.bloodGroup}
                              size="sm"
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{post.hospitalName}</p>
                              <p className="text-xs text-muted-foreground">
                                {t(`location.district.${post.district}`)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {post.interestedUsers.length}{" "}
                            {t("admin.posts.interestedCount")}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[post.status]}>
                              {statusLabels[post.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {post.status === "open" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleClosePost(post.id)}
                              >
                                {t("admin.posts.close")}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  {t("admin.history.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.history.table.donor")}</TableHead>
                        <TableHead>
                          {t("admin.history.table.recipient")}
                        </TableHead>
                        <TableHead>
                          {t("admin.history.table.bloodGroup")}
                        </TableHead>
                        <TableHead>
                          {t("admin.history.table.hospital")}
                        </TableHead>
                        <TableHead>{t("admin.history.table.units")}</TableHead>
                        <TableHead>{t("admin.history.table.date")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell>{h.donorName}</TableCell>
                          <TableCell>{h.recipientName}</TableCell>
                          <TableCell>
                            <BloodBadge bloodGroup={h.bloodGroup} size="sm" />
                          </TableCell>
                          <TableCell>{h.hospitalName}</TableCell>
                          <TableCell>
                            {h.units} {t("admin.history.units")}
                          </TableCell>
                          <TableCell>
                            {new Date(h.donationDate).toLocaleDateString(
                              i18n.language,
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
