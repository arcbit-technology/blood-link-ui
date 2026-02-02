import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Calendar, Droplet, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BloodBadge } from "@/components/ui/blood-badge";
import { mockDonationPosts } from "@/data/mockData";
import { useTranslation } from "react-i18next";

export function BloodRequestSection() {
  const { t, i18n } = useTranslation();
  // Get latest 3 active posts
  const latestPosts = mockDonationPosts
    .filter((post) => post.status === "open")
    .slice(0, 3);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-1.5 rounded-full mb-4">
              <Droplet className="h-4 w-4" />
              <span className="text-sm font-medium">{t("requests.badge")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("requests.title")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("requests.subtitle")}
            </p>
          </div>

          <Button asChild variant="outline" className="hidden md:flex">
            <Link to="/posts">
              {t("requests.seeAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestPosts.map((post) => (
            <div
              key={post.id}
              className="group bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.createdAt}</span>
                  </div>
                </div>
                <BloodBadge
                  bloodGroup={post.bloodGroup}
                  size="md"
                  className="shrink-0"
                />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="line-clamp-2">
                    {post.hospitalName}, {post.address},{" "}
                    {t(`location.district.${post.district}`)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {t("requests.required")}:{" "}
                    {new Date(post.requiredDate).toLocaleDateString(
                      i18n.language,
                    )}
                  </span>
                </div>
              </div>

              <Button
                asChild
                className="w-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Link to="/posts">{t("requests.viewDetails")}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link to="/posts">
              {t("requests.seeAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
