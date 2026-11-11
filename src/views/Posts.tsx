"use client";

import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Calendar, Users, Heart, Clock } from "lucide-react";
import {
  mockDonationPosts,
  BLOOD_GROUPS,
  DIVISIONS,
  DISTRICTS,
} from "@/data/mockData";
import { BloodGroup, Division, DonationPost } from "@/types";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Posts() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<DonationPost[]>(mockDonationPosts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(
    null,
  );

  const handleInterest = (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: t("posts.loginRequired.title"),
        description: t("posts.loginRequired.description"),
        variant: "destructive",
      });
      return;
    }

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const isInterested = post.interestedUsers.includes(user!.id);
          return {
            ...post,
            interestedUsers: isInterested
              ? post.interestedUsers.filter((id) => id !== user!.id)
              : [...post.interestedUsers, user!.id],
          };
        }
        return post;
      }),
    );

    toast({
      title: t("posts.interestShown.title"),
      description: t("posts.interestShown.description"),
    });
  };

  const handleCreatePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    const formData = new FormData(e.currentTarget);
    const newPost: DonationPost = {
      id: `post_${Date.now()}`,
      authorId: user!.id,
      authorName: user!.name,
      bloodGroup: formData.get("bloodGroup") as BloodGroup,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      hospitalName: formData.get("hospitalName") as string,
      address: formData.get("address") as string,
      district: formData.get("district") as string,
      division: formData.get("division") as Division,
      requiredDate: formData.get("requiredDate") as string,
      interestedUsers: [],
      status: "open",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setPosts([newPost, ...posts]);
    setDialogOpen(false);
    toast({
      title: t("posts.createSuccess.title"),
      description: t("posts.createSuccess.description"),
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t("posts.header.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("posts.header.subtitle")}
            </p>
          </div>

          {isAuthenticated ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="blood-gradient text-blood-foreground gap-2">
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
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full blood-gradient text-blood-foreground"
                  >
                    {t("posts.form.submit")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button asChild className="blood-gradient text-blood-foreground">
              <Link href="/login">{t("posts.loginToPost")}</Link>
            </Button>
          )}
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <Card
                key={post.id}
                className="overflow-hidden hover:blood-shadow transition-shadow animate-fade-in"
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
                    <BloodBadge bloodGroup={post.bloodGroup} size="md" />
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
                      disabled={post.status !== "open"}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${user && post.interestedUsers.includes(user.id) ? "fill-current" : ""}`}
                      />
                      {user && post.interestedUsers.includes(user.id)
                        ? t("posts.card.interested")
                        : t("posts.card.expressInterest")}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {t("posts.card.postedBy")}
                        {post.authorName}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
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
