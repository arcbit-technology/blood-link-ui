import Link from "next/link";
import { ArrowRight, HeartHandshake, Route, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const STEPS = [
  { key: "register", icon: UserPlus },
  { key: "search", icon: Search },
  { key: "donate", icon: HeartHandshake },
] as const;

export function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section className="relative isolate py-20 section-soft">
      <div aria-hidden="true" className="section-pattern pattern-grid" />

      <div className="container">
        <div className="text-center mb-14">
          <span className="eyebrow mb-4">
            <Route className="h-4 w-4" />
            {t("home.howItWorks.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("home.howItWorks.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("home.howItWorks.subtitle")}
          </p>
        </div>

        <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {/* Dashed connector running behind the cards (visible in the gaps) */}
          <div
            aria-hidden="true"
            className="absolute left-[16%] right-[16%] top-14 hidden border-t-2 border-dashed border-primary/30 md:block"
          />

          {STEPS.map(({ key, icon: Icon }, index) => (
            <li
              key={key}
              className="lift-card group relative isolate flex flex-col overflow-hidden p-6 md:p-7 animate-fade-in"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div aria-hidden="true" className="card-pattern" />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-3 select-none text-6xl font-bold leading-none text-primary/10 transition-colors duration-300 group-hover:text-primary/20"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="icon-tile relative mb-5 h-14 w-14 rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Icon className="h-6 w-6" />
              </div>

              <p className="relative mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                {t("home.howItWorks.step", { n: index + 1 })}
              </p>
              <h3 className="relative mb-2 text-lg font-semibold">
                {t(`home.howItWorks.steps.${key}.title`)}
              </h3>
              <p className="relative text-sm leading-relaxed text-muted-foreground">
                {t(`home.howItWorks.steps.${key}.desc`)}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <Button asChild size="lg" className="btn-blood group rounded-full px-8">
            <Link href="/register">
              {t("home.howItWorks.cta")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
