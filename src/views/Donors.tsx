"use client";

import { useState, useMemo, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { DonorCard } from "@/components/donors/DonorCard";
import { DonorCardSkeleton } from "@/components/donors/DonorCardSkeleton";
import { DonorDialog } from "@/components/donors/DonorDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BloodBadge } from "@/components/ui/blood-badge";
import { Search, Filter, X } from "lucide-react";
import { BLOOD_GROUPS, DIVISIONS, DISTRICTS } from "@/data/mockData";
import { BloodGroup, Division, Gender } from "@/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { extractDonersList, getDoners } from "@/api/donors";
import { mapApiUserToUser } from "@/api/mappers";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Donors() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const setSearchParams = (values: Record<string, string>) => {
    const query = new URLSearchParams(values).toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const size = 20;

  // Filters
  const bloodGroupParam = searchParams.get("bloodGroup");
  const bloodGroupFilter: BloodGroup | "all" = BLOOD_GROUPS.includes(bloodGroupParam as BloodGroup)
    ? bloodGroupParam as BloodGroup
    : "all";
  const divisionParam = searchParams.get("division");
  const divisionFilter: Division | "all" = DIVISIONS.includes(divisionParam as Division)
    ? divisionParam as Division
    : "all";
  const districtParam = searchParams.get("district");
  const districtFilter = divisionFilter !== "all" && DISTRICTS[divisionFilter].includes(districtParam)
    ? districtParam
    : "all";

  const updateFilters = (values: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(values)) {
      if (value === "all") params.delete(key);
      else params.set(key, value);
    }
    setSearchParams(Object.fromEntries(params));
    setPage(1);
  };
  const [genderFilter, setGenderFilter] = useState<Gender | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const donorsQuery = useQuery({
    queryKey: [
      "doners",
      {
        bloodGroupFilter,
        divisionFilter,
        districtFilter,
        genderFilter,
        searchQuery,
        page,
        size,
      },
    ],
    queryFn: async () => {
      const genderParam =
        genderFilter === "all"
          ? undefined
          : genderFilter === "male"
            ? "male"
            : genderFilter === "female"
              ? "female"
              : "others";

      const res = await getDoners({
        blood_group: bloodGroupFilter === "all" ? undefined : bloodGroupFilter,
        division: divisionFilter === "all" ? undefined : divisionFilter,
        district: districtFilter === "all" ? undefined : districtFilter,
        gender: genderParam,
        search: searchQuery ? searchQuery : undefined,
        page,
        size,
      });

      return extractDonersList(res);
    },
    retry: false,
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });

  const donors = useMemo(() => {
    return (donorsQuery.data?.data ?? []).map(mapApiUserToUser);
  }, [donorsQuery.data?.data]);

  const totalCount = donorsQuery.data?.totalCount ?? donors.length;
  const canPrev = page > 1;
  const canNext =
    typeof totalCount === "number" && totalCount > 0
      ? page * size < totalCount
      : donors.length === size;

  const handleDonorClick = (donorId: string) => {
    setSelectedDonorId(donorId);
    setDialogOpen(true);
  };

  const clearFilters = () => {
    setGenderFilter("all");
    setSearchQuery("");
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    bloodGroupFilter !== "all" ||
    divisionFilter !== "all" ||
    districtFilter !== "all" ||
    genderFilter !== "all" ||
    searchQuery !== "";

  const isInitialLoading = donorsQuery.isLoading && donors.length === 0;

  const handlePrev = (e: MouseEvent) => {
    e.preventDefault();
    if (!canPrev) return;
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNext = (e: MouseEvent) => {
    e.preventDefault();
    if (!canNext) return;
    setPage((p) => p + 1);
  };

  const handleSetSearchQuery = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSetBloodGroupFilter = (value: BloodGroup | "all") => {
    updateFilters({ bloodGroup: value });
  };

  const handleSetDivisionFilter = (value: Division | "all") => {
    updateFilters({ division: value, district: "all" });
  };

  const handleSetDistrictFilter = (value: string) => {
    updateFilters({ district: value });
  };

  const handleSetGenderFilter = (value: Gender | "all") => {
    setGenderFilter(value);
    setPage(1);
  };

  const handleSetBloodGroupQuick = (value: BloodGroup | "all") => {
    handleSetBloodGroupFilter(value);
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("donors.title")}</h1>
          <p className="text-muted-foreground">{t("donors.subtitle")}</p>
        </div>

        {/* Blood Group Quick Filter */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">
            {t("donors.filter.bloodGroup")}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleSetBloodGroupQuick("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                bloodGroupFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {t("common.all")}
            </button>
            {BLOOD_GROUPS.map((group) => (
              <button
                key={group}
                onClick={() => handleSetBloodGroupQuick(group)}
                className="transition-transform hover:scale-110"
              >
                <BloodBadge
                  bloodGroup={group}
                  size="sm"
                  className={
                    bloodGroupFilter === group
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "opacity-70"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter Toggle */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("donors.filter.searchPlaceholder")}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSetSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {t("common.filter")}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="gap-2 text-destructive"
            >
              <X className="h-4 w-4" />
              {t("common.reset")}
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg mb-6 animate-fade-in">
            <div className="space-y-2">
              <Label>{t("findDonor.division")}</Label>
              <Select
                value={divisionFilter}
                onValueChange={(value) =>
                  handleSetDivisionFilter(value as Division | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("findDonor.allDivisions")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("findDonor.allDivisions")}
                  </SelectItem>
                  {DIVISIONS.map((division) => (
                    <SelectItem key={division} value={division}>
                      {t(`location.division.${division}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("findDonor.district")}</Label>
              <Select
                value={districtFilter}
                onValueChange={handleSetDistrictFilter}
                disabled={divisionFilter === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("findDonor.allDistricts")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("findDonor.allDistricts")}
                  </SelectItem>
                  {divisionFilter !== "all" &&
                    DISTRICTS[divisionFilter].map((district) => (
                      <SelectItem key={district} value={district}>
                        {t(`location.district.${district}`)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("common.gender.label")}</Label>
              <Select
                value={genderFilter}
                onValueChange={(value) =>
                  handleSetGenderFilter(value as Gender | "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("common.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="male">
                    {t("common.gender.male")}
                  </SelectItem>
                  <SelectItem value="female">
                    {t("common.gender.female")}
                  </SelectItem>
                  <SelectItem value="other">
                    {t("common.gender.other")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {t("donors.results.count", { count: totalCount })}
        </p>

        {/* Donor Cards Grid */}
        {isInitialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <DonorCardSkeleton />
              </div>
            ))}
          </div>
        ) : donors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {donors.map((donor, index) => (
              <div
                key={donor.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <DonorCard
                  donor={donor}
                  onClick={() => handleDonorClick(donor.id)}
                />
              </div>
            ))}
          </div>
        ) : donorsQuery.isError ? (
          <div className="text-center py-16 text-muted-foreground">
            {t("common.somethingWentWrong")}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t("donors.results.empty.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("donors.results.empty.subtitle")}
            </p>
          </div>
        )}

        {(canPrev || canNext) && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePrev}
                  className={
                    !canPrev ? "pointer-events-none opacity-50" : undefined
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-3 text-sm text-muted-foreground">
                  {page}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={handleNext}
                  className={
                    !canNext ? "pointer-events-none opacity-50" : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Donor Dialog */}
        <DonorDialog
          donorId={selectedDonorId}
          open={dialogOpen}
          onOpenChange={(nextOpen) => {
            setDialogOpen(nextOpen);
            if (!nextOpen) setSelectedDonorId(null);
          }}
        />
      </div>
    </Layout>
  );
}
