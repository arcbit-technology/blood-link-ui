import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BloodBadge } from "@/components/ui/blood-badge";
import { Layout } from "@/components/layout/Layout";
import {
  Droplet,
  Users,
  Heart,
  Clock,
  ArrowRight,
  Search,
  AlertCircle,
  Shield,
} from "lucide-react";
import { BLOOD_GROUPS } from "@/data/mockData";
import { useTranslation } from "react-i18next";

import { FindDonorSection } from "@/components/home/FindDonorSection";
import { BloodRequestSection } from "@/components/home/BloodRequestSection";
import { RecentDonorsSection } from "@/components/home/RecentDonorsSection";

export default function Index() {
  const { t } = useTranslation();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden blood-gradient py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Droplet className="h-4 w-4" />
              <span className="text-sm font-medium">{t("hero.saveLife")}</span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              {t("header.appName")}
            </h1>
            <p
              className="text-lg md:text-xl opacity-90 mb-8 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              {t("hero.description")}
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                asChild
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2"
              >
                <Link to="/donors">
                  <Search className="h-5 w-5" />
                  {t("hero.findDonor")}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 gap-2"
              >
                <Link to="/register">
                  {t("hero.registerNow")}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Floating blood drops */}
        <div className="absolute top-20 left-10 animate-float opacity-30">
          <Droplet className="h-16 w-16 text-primary-foreground fill-primary-foreground" />
        </div>
        <div
          className="absolute bottom-20 right-20 animate-float opacity-20"
          style={{ animationDelay: "1s" }}
        >
          <Droplet className="h-24 w-24 text-primary-foreground fill-primary-foreground" />
        </div>
      </section>

      {/* Blood Groups */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {t("home.allBloodGroups")}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {BLOOD_GROUPS.map((group, index) => (
              <Link
                key={group}
                to={`/donors?bloodGroup=${group}`}
                className="animate-scale-in transition-transform hover:scale-110"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <BloodBadge bloodGroup={group} size="lg" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Find Donor Section */}
      <FindDonorSection />

      {/* Blood Request Section */}
      <BloodRequestSection />

      {/* Recent Donors Section */}
      <RecentDonorsSection />

      {/* Emergency CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full mb-6">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t("home.emergency.badge")}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("home.emergency.title")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("home.emergency.description")}
            </p>
            <Button
              asChild
              size="lg"
              className="blood-gradient text-primary-foreground gap-2"
            >
              <Link to="/emergency-request">
                <Heart className="h-5 w-5" />
                {t("home.emergency.button")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("home.features.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-xl p-6 card-shadow hover:blood-shadow transition-shadow animate-fade-in">
              <div className="w-12 h-12 blood-gradient rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {t("home.features.network")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("home.features.networkDesc")}
              </p>
            </div>

            <div
              className="bg-card rounded-xl p-6 card-shadow hover:blood-shadow transition-shadow animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-12 h-12 blood-gradient rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {t("home.features.search")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("home.features.searchDesc")}
              </p>
            </div>

            <div
              className="bg-card rounded-xl p-6 card-shadow hover:blood-shadow transition-shadow animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-12 h-12 blood-gradient rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {t("home.features.response")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("home.features.responseDesc")}
              </p>
            </div>

            <div
              className="bg-card rounded-xl p-6 card-shadow hover:blood-shadow transition-shadow animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="w-12 h-12 blood-gradient rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {t("home.features.privacy")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("home.features.privacyDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Stats */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gradient-blood mb-2">
                {t("home.stats.count.donors")}
              </p>
              <p className="text-muted-foreground">{t("home.stats.donors")}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gradient-blood mb-2">
                {t("home.stats.count.districts")}
              </p>
              <p className="text-muted-foreground">
                {t("home.stats.districts")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gradient-blood mb-2">
                {t("home.stats.count.donations")}
              </p>
              <p className="text-muted-foreground">
                {t("home.stats.donations")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-gradient-blood mb-2">
                {t("home.stats.count.service")}
              </p>
              <p className="text-muted-foreground">{t("home.stats.service")}</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
