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
  Sparkles,
  ArrowRight,
  MapPin,
  HeartHandshake,
  Headset,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { HeroSection } from "@/components/home/HeroSection";
import { BloodRequestSection } from "@/components/home/BloodRequestSection";
import { RecentDonorsSection } from "@/components/home/RecentDonorsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { BloodCompatibilitySection } from "@/components/home/BloodCompatibilitySection";

const FEATURES = [
  { icon: Users, title: "home.features.network", desc: "home.features.networkDesc" },
  { icon: Search, title: "home.features.search", desc: "home.features.searchDesc" },
  { icon: Clock, title: "home.features.response", desc: "home.features.responseDesc" },
  { icon: Shield, title: "home.features.privacy", desc: "home.features.privacyDesc" },
] as const;

const STATS = [
  { icon: Users, value: "home.stats.count.donors", label: "home.stats.donors" },
  { icon: MapPin, value: "home.stats.count.districts", label: "home.stats.districts" },
  { icon: HeartHandshake, value: "home.stats.count.donations", label: "home.stats.donations" },
  { icon: Headset, value: "home.stats.count.service", label: "home.stats.service" },
] as const;

export default function Index() {
  const { t } = useTranslation();

  return (
    <Layout>
      <HeroSection />

      {/* Blood Request Section */}
      <BloodRequestSection />

      {/* Recent Donors Section */}
      <RecentDonorsSection />

      {/* How it works */}
      <HowItWorksSection />

      {/* Features */}
      <section className="relative isolate py-20">
        <div aria-hidden="true" className="section-pattern pattern-dots pattern-fade-center" />
        <div className="container">
          <div className="text-center mb-12">
            <span className="eyebrow mb-4">
              <Sparkles className="h-4 w-4" />
              {t("header.appName")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("home.features.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, index) => (
              <div
                key={title}
                className="lift-card accent-top group isolate p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div aria-hidden="true" className="card-pattern" />
                <div className="icon-tile mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(title)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(desc)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blood compatibility checker */}
      <BloodCompatibilitySection />

      {/* Stats */}
      <section className="py-12">
        <div className="container">
          <div className="relative isolate overflow-hidden rounded-3xl border border-primary/15 bg-card card-shadow">
            <div aria-hidden="true" className="section-pattern pattern-grid pattern-fade-center" />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,hsl(var(--primary)/0.10),transparent_70%)]"
            />
            <div className="relative grid grid-cols-2 md:grid-cols-4 divide-primary/10 md:divide-x">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="group flex flex-col items-center px-4 py-8 md:py-10 text-center">
                  <span className="icon-tile-soft mb-4 h-11 w-11 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-4xl md:text-5xl font-bold text-gradient-blood mb-2">
                    {t(value)}
                  </p>
                  <p className="text-muted-foreground font-medium">{t(label)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="relative isolate overflow-hidden rounded-3xl blood-gradient px-6 py-14 text-center text-white blood-shadow md:px-16">
            {/* Decorative rings + glow */}
            <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full border-[40px] border-white/10" />
            <div aria-hidden="true" className="absolute -bottom-32 -left-20 -z-10 h-80 w-80 rounded-full border-[50px] border-white/[0.07]" />
            <div aria-hidden="true" className="absolute left-1/2 top-0 -z-10 h-40 w-[70%] -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(rgb(255_255_255/0.35)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]"
            />

            <div className="mx-auto max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 mb-6 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  {t("home.emergency.badge")}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("home.emergency.title")}
              </h2>
              <p className="text-white/85 mb-8 text-lg">
                {t("home.emergency.description")}
              </p>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group rounded-full border-transparent bg-white px-8 text-primary shadow-xl shadow-black/10 hover:-translate-y-0.5 hover:border-transparent hover:bg-white hover:text-primary dark:text-[#be123c]"
              >
                <Link href="/emergency-request">
                  <Heart className="h-5 w-5 fill-current" />
                  {t("home.emergency.button")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
