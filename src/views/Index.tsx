"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import {
  Users,
  Heart,
  Clock,
  Search,
  AlertCircle,
  Shield,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { HeroSection } from "@/components/home/HeroSection";
import { BloodRequestSection } from "@/components/home/BloodRequestSection";
import { RecentDonorsSection } from "@/components/home/RecentDonorsSection";

export default function Index() {
  const { t } = useTranslation();

  return (
    <Layout>
      <HeroSection />

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
              className="blood-gradient text-blood-foreground gap-2"
            >
              <Link href="/emergency-request">
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
                <Users className="h-6 w-6 text-blood-foreground" />
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
                <Search className="h-6 w-6 text-blood-foreground" />
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
                <Clock className="h-6 w-6 text-blood-foreground" />
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
                <Shield className="h-6 w-6 text-blood-foreground" />
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
