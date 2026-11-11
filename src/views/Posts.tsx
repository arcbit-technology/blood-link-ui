"use client";

import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BloodBadge } from "@/components/ui/blood-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Calendar, Users, Heart, Clock, Droplet } from "lucide-react";
import { BLOOD_GROUPS, DIVISIONS, DISTRICTS } from "@/data/mockData";
import { Division, DonationPost } from "@/types";
import { createPost, getPosts, togglePostInterest } from "@/api/posts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const POSTS_QUERY_KEY = ["posts"] as const;

export default function Posts() {
  const { t, i18n } = useTranslation();
  const { user, token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(
    null,
  );

  const postsQuery = useQuery({
    queryKey: POSTS_QUERY_KEY,
    queryFn: () => getPosts({ size: 100 }),
    staleTime: 10_000,
  });
  const posts = postsQuery.data?.data ?? [];

  const replacePost = (updated: DonationPost) => {
    queryClient.setQueryData(
      POSTS_QUERY_KEY,
      (prev: Awaited<ReturnType<typeof getPosts>> | undefined) =>
        prev && {
          ...prev,
          data: prev.data.map((p) => (p.id === updated.id ? updated : p)),
        },
    );
  };

  const interestMutation = useMutation({
    mutationFn: (postId: string) => togglePostInterest(postId, token as string),
    onSuccess: (updated) => {
      replacePost(updated);
      const nowInterested = !!user && updated.interestedUsers.includes(user.id);
      toast(
        nowInterested
          ? {
              title: t("posts.interestShown.title"),
              description: t("posts.interestShown.description"),
            }
          : { title: t("posts.interestWithdrawn.title") },
      );
    },
    onError: () => {
      toast({ title: t("posts.interestError.title"), variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createPost>[0]) =>
      createPost(payload, token as string),
    onSuccess: () => {
      setDialogOpen(false);
      setSelectedDivision(null);
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      toast({
        title: t("posts.createSuccess.title"),
        description: t("posts.createSuccess.description"),
      });
    },
    onError: () => {
      toast({ title: t("posts.createError.title"), variant: "destructive" });
    },
  });

  const handleInterest = (postId: string) => {
    if (!isAuthenticated || !token) {
      toast({
        title: t("posts.loginRequired.title"),
        description: t("posts.loginRequired.description"),
        variant: "destructive",
      });
      return;
    }
    interestMutation.mutate(postId);
  };

  const handleCreatePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated || !token) return;

    const formData = new FormData(e.currentTarget);
    const field = (name: string) => String(formData.get(name) ?? "").trim();
    createMutation.mutate({
      title: field("title"),
      blood_group: field("bloodGroup"),
      description: field("description"),
      hospital_name: field("hospitalName"),
      address: field("address"),
      division: field("division"),
      district: field("district"),
      required_date: field("requiredDate"),
    });
  };

  const statusColors = {
    open: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    fulfilled: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    closed: "bg-muted text-muted-foreground",
  };

  const statusLabels = {
    open: t("posts.status.open"),
    fulfilled: t("posts.status.fulfilled"),
    closed: t("posts.status.closed"),
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <PageHeader
          icon={Droplet}
          title={t("posts.header.title")}
          subtitle={t("posts.header.subtitle")}
          actions={isAuthenticated ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 rounded-full">
                  <Plus className="h-5 w-5" />
                  {t("posts.createButton")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("posts.form.title")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      {t("posts.form.fields.title")}
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder={t("posts.form.placeholders.title")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("posts.form.fields.bloodGroup")}</Label>
                    <Select name="bloodGroup" required>
                      <SelectTrigger>
                        <SelectValue placeholder={t("common.select")} />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_GROUPS.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {t("posts.form.fields.description")}
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder={t("posts.form.placeholders.description")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">
                      {t("posts.form.fields.hospitalName")}
                    </Label>
                    <Input
                      id="hospitalName"
                      name="hospitalName"
                      placeholder={t("posts.form.placeholders.hospitalName")}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("posts.form.fields.division")}</Label>
                      <Select
                        name="division"
                        onValueChange={(value) =>
                          setSelectedDivision(value as Division)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.select")} />
                        </SelectTrigger>
                        <SelectContent>
                          {DIVISIONS.map((division) => (
                            <SelectItem key={division} value={division}>
                              {t(`location.division.${division}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("posts.form.fields.district")}</Label>
                      <Select
                        name="district"
                        required
                        disabled={!selectedDivision}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("common.select")} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDivision &&
                            DISTRICTS[selectedDivision].map((district) => (
                              <SelectItem key={district} value={district}>
                                {t(`location.district.${district}`)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      {t("posts.form.fields.address")}
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder={t("posts.form.placeholders.address")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requiredDate">
                      {t("posts.form.fields.requiredDate")}
                    </Label>
                    <Input
                      id="requiredDate"
                      name="requiredDate"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full blood-gradient text-blood-foreground"
                  >
                    {t("posts.form.submit")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button asChild size="lg" className="rounded-full">
              <Link href="/login">{t("posts.loginToPost")}</Link>
            </Button>
          )}
        />

        {/* Posts Grid */}
        {postsQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2 space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : postsQuery.isError ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium mb-2">
              {t("posts.loadError.title")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("posts.loadError.description")}
            </p>
            <Button variant="outline" onClick={() => postsQuery.refetch()}>
              {t("posts.loadError.retry")}
            </Button>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <Card
                key={post.id}
                className="lift-card accent-top group overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className={statusColors[post.status]}>
                        {statusLabels[post.status]}
                      </Badge>
                      <CardTitle className="text-lg mt-2">
                        {post.title}
                      </CardTitle>
                    </div>
                    <BloodBadge bloodGroup={post.bloodGroup} size="md" className="blood-glow transition-transform duration-300 group-hover:scale-105" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>
                        {post.hospitalName},{" "}
                        {t(`location.district.${post.district}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>
                        {t("posts.card.requiredDate")}
                        {new Date(post.requiredDate).toLocaleDateString(
                          i18n.language,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>
                        {t("posts.card.interestedCount", {
                          count: post.interestedUsers.length,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {user && post.authorId === user.id ? (
                      <Badge variant="outline">{t("posts.card.yourPost")}</Badge>
                    ) : (
                      <Button
                        onClick={() => handleInterest(post.id)}
                        variant={
                          user && post.interestedUsers.includes(user.id)
                            ? "secondary"
                            : "default"
                        }
                        className={
                          user && post.interestedUsers.includes(user.id)
                            ? ""
                            : "blood-gradient text-blood-foreground"
                        }
                        disabled={
                          interestMutation.isPending ||
                          (post.status !== "open" &&
                            !(user && post.interestedUsers.includes(user.id)))
                        }
                      >
                        <Heart
                          className={`h-4 w-4 mr-2 ${user && post.interestedUsers.includes(user.id) ? "fill-current" : ""}`}
                        />
                        {user && post.interestedUsers.includes(user.id)
                          ? t("posts.card.interested")
                          : t("posts.card.expressInterest")}
                      </Button>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {t("posts.card.postedBy")}
                        {post.authorName || t("posts.card.anonymous")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="icon-tile-soft mx-auto mb-4 h-16 w-16 rounded-2xl">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t("posts.empty.title")}
            </h3>
            <p className="text-muted-foreground">{t("posts.empty.subtitle")}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
