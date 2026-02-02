import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonorCard } from "@/components/donors/DonorCard";
import { DonorDialog } from "@/components/donors/DonorDialog";
import { mockUsers } from "@/data/mockData";
import { User } from "@/types";
import { useTranslation } from "react-i18next";

export function RecentDonorsSection() {
  const [selectedDonor, setSelectedDonor] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation();

  // Get latest 4 donors (excluding admins)
  const recentDonors = mockUsers
    .filter((user) => user.role === "user")
    // Sort by createdAt desc if needed, but mock data is small
    .slice(0, 4);

  const handleDonorClick = (donor: User) => {
    setSelectedDonor(donor);
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
          {recentDonors.map((donor, index) => (
            <div
              key={donor.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <DonorCard
                donor={donor}
                onClick={() => handleDonorClick(donor)}
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
          donor={selectedDonor}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </section>
  );
}
