"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Droplet, Sparkles, Trophy } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EMPTY_LOCATION, LocationSelect, type LocationValue } from "@/components/common/LocationSelect";
import { LeaderboardTable } from "@/components/gamification/LeaderboardTable";
import { useAuth } from "@/contexts/AuthContext";
import { getLeaderboard, type LeaderboardPeriod, type LeaderboardQuery } from "@/api/gamification";

/** The most specific location picked decides the scope. */
function scopeOf(loc: LocationValue): Pick<LeaderboardQuery, "scope" | "value"> {
  if (loc.upazila) return { scope: "upazila", value: loc.upazila };
  if (loc.district) return { scope: "district", value: loc.district };
  if (loc.division) return { scope: "division", value: loc.division };
  return { scope: "global" };
}

export default function Leaderboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const scope = scopeOf(location);

  const query = useQuery({
    queryKey: ["leaderboard", scope, period],
    queryFn: () => getLeaderboard({ ...scope, period, size: 50 }),
    staleTime: 30_000,
  });

  return (
    <Layout>
      <div className="container py-8">
        <PageHeader icon={Trophy} title={t("leaderboard.title")} subtitle={t("leaderboard.subtitle")} />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>
                  {scope.scope === "global"
                    ? t("leaderboard.national")
                    : t("leaderboard.in", {
                        place: t(`location.${scope.scope}.${scope.value}`, { defaultValue: scope.value }),
                      })}
                </CardTitle>
                <ToggleGroup
                  type="single"
                  value={period}
                  onValueChange={(v) => v && setPeriod(v as LeaderboardPeriod)}
                  aria-label={t("leaderboard.period")}
                >
                  <ToggleGroupItem value="all">{t("leaderboard.allTime")}</ToggleGroupItem>
                  <ToggleGroupItem value="month">{t("leaderboard.thisMonth")}</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <LocationSelect value={location} onChange={setLocation} allowAll idPrefix="leaderboard" />
            </CardHeader>
            <CardContent>
              <LeaderboardTable
                entries={query.data ?? []}
                isLoading={query.isLoading}
                currentUserId={user ? Number(user.id) : undefined}
              />
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t("leaderboard.howPoints.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                {(["donation", "first", "emergency", "founder"] as const).map((k) => (
                  <li key={k} className="flex items-start justify-between gap-3">
                    <span className="flex items-start gap-2">
                      <Droplet className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {t(`leaderboard.howPoints.${k}.label`)}
                    </span>
                    <span className="shrink-0 font-bold text-primary">{t(`leaderboard.howPoints.${k}.points`)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">{t("leaderboard.howPoints.note")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
