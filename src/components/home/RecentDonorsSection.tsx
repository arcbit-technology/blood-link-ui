import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonorCard } from "@/components/donors/DonorCard";
import { DonorCardSkeleton } from "@/components/donors/DonorCardSkeleton";
import { DonorDialog } from "@/components/donors/DonorDialog";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { extractDonersList, getDoners } from "@/api/donors";
import { mapApiUserToUser } from "@/api/mappers";

export function RecentDonorsSection() {
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation();

  const recentDonorsQuery = useQuery({
    queryKey: ["doners", "recent", 4],
    queryFn: async () => {
      const res = await getDoners({ page: 1, size: 4 });
      return extractDonersList(res);
    },
    retry: false,
    staleTime: 10_000,
  });

  const recentDonors = (recentDonorsQuery.data?.data ?? []).map(mapApiUserToUser);

  const handleDonorClick = (donorId: string) => {
    setSelectedDonorId(donorId);
    setDialogOpen(true);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="text-center md:text-left w-full md:w-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-4">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{t('recentDonors.badge')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              {t('recentDonors.title')}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t('recentDonors.subtitle')}
            </p>
          </div>

          <Button asChild variant="outline" className="hidden md:flex">
            <Link to="/donors">
              {t('recentDonors.seeAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentDonorsQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <DonorCardSkeleton />
                </div>
              ))
            : recentDonors.map((donor, index) => (
                <div
                  key={donor.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <DonorCard
                    donor={donor}
                    onClick={() => handleDonorClick(donor.id)}
                  />
                </div>
              ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link to="/donors">
              {t('recentDonors.seeAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <DonorDialog
          donorId={selectedDonorId}
          open={dialogOpen}
          onOpenChange={(nextOpen) => {
            setDialogOpen(nextOpen);
            if (!nextOpen) setSelectedDonorId(null);
          }}
        />
      </div>
    </section>
  );
}
