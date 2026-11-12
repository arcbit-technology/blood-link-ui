"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Building2, Plus, Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EMPTY_LOCATION, LocationSelect, type LocationValue } from "@/components/common/LocationSelect";
import { BloodBankCard } from "@/components/bloodbank/BloodBankCard";
import { useAuth } from "@/contexts/AuthContext";
import { useMyBloodBank } from "@/hooks/useMyBloodBank";
import { getBloodBanks } from "@/api/bloodBanks";

export default function BloodBanks() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [search, setSearch] = useState("");
  const my = useMyBloodBank();

  const query = useQuery({
    queryKey: ["bloodBanks", location, search.trim()],
    queryFn: () => getBloodBanks({ ...location, search: search.trim(), size: 60 }),
    staleTime: 30_000,
  });
  const banks = query.data?.data ?? [];
  const myBank = my.data?.bank;
  const myPending = my.data?.pendingRequest;

  const action = !isAuthenticated ? (
    <Button asChild size="lg" className="rounded-full">
      <Link href="/login">{t("bloodBanks.loginToCreate")}</Link>
    </Button>
  ) : myBank ? (
    <Button asChild size="lg" variant="outline" className="rounded-full">
      <Link href={`/blood-banks/${myBank.id}`}>{t("bloodBanks.myBank")}</Link>
    </Button>
  ) : myPending ? (
    <Button asChild size="lg" variant="outline" className="rounded-full">
      <Link href={`/blood-banks/${myPending.id}`}>{t("bloodBanks.viewMyRequest")}</Link>
    </Button>
  ) : (
    <Button asChild size="lg" className="gap-2 rounded-full">
      <Link href="/blood-banks/new">
        <Plus className="h-5 w-5" />
        {t("bloodBanks.createButton")}
      </Link>
    </Button>
  );

  return (
    <Layout>
      <div className="container py-8">
        <PageHeader
          icon={Building2}
          title={t("bloodBanks.header.title")}
          subtitle={t("bloodBanks.header.subtitle")}
          actions={action}
        />

        <Card className="mb-8">
          <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_2fr] lg:items-end">
            <div className="space-y-2">
              <label htmlFor="bank-search" className="text-sm font-medium">
                {t("bloodBanks.search")}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="bank-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("bloodBanks.searchPlaceholder")}
                  className="pl-10"
                />
              </div>
            </div>
            <LocationSelect value={location} onChange={setLocation} allowAll idPrefix="bank-filter" />
          </CardContent>
        </Card>

        {query.isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="py-16 text-center">
            <p className="mb-4 text-muted-foreground">{t("bloodBanks.loadError")}</p>
            <Button variant="outline" onClick={() => query.refetch()}>
              {t("posts.loadError.retry")}
            </Button>
          </div>
        ) : banks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="icon-tile-soft mx-auto mb-4 h-16 w-16 rounded-2xl">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-medium">{t("bloodBanks.empty.title")}</h3>
            <p className="text-muted-foreground">{t("bloodBanks.empty.subtitle")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {banks.map((bank) => (
              <BloodBankCard key={bank.id} bank={bank} className="animate-fade-in" />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
