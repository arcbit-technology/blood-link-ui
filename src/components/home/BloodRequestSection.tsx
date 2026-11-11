import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Droplet, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BloodBadge } from "@/components/ui/blood-badge";
import { getPosts } from "@/api/posts";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function BloodRequestSection() {
  const { t, i18n } = useTranslation();
  // latest 3 open posts
  const latestQuery = useQuery({
    queryKey: ["posts", "latest-open"],
    queryFn: () => getPosts({ status: "open", size: 3 }),
    staleTime: 30_000,
  });
  const latestPosts = latestQuery.data?.data ?? [];

  return (
    <section className="relative isolate py-20 section-soft">
      <div aria-hidden="true" className="section-pattern pattern-grid" />
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <span className="eyebrow mb-4">
              <Droplet className="h-4 w-4 fill-current" />
              {t("requests.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("requests.title")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("requests.subtitle")}
            </p>
          </div>

          <Button asChild variant="outline" className="group hidden rounded-full md:flex">
            <Link href="/posts">
              {t("requests.seeAll")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestPosts.map((post) => (
            <div
              key={post.id}
              className="lift-card accent-top group isolate flex flex-col p-6"
            >
              <div aria-hidden="true" className="card-pattern" />
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{post.createdAt}</span>
                  </div>
                </div>
                <BloodBadge
                  bloodGroup={post.bloodGroup}
                  size="md"
                  className="shrink-0 blood-glow transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="space-y-2.5 mb-6 flex-1 rounded-xl bg-muted/60 p-3.5">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="line-clamp-2">
                    {[
                      post.hospitalName,
                      post.address,
                      t(`location.district.${post.district}`),
                    ]
                      .filter(Boolean)
                      .join(", ")}
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

              <Button asChild variant="outline" className="group/btn w-full rounded-xl">
                <Link href="/posts">
                  {t("requests.viewDetails")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link href="/posts">
              {t("requests.seeAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
