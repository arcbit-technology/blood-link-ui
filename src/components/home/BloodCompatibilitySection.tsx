import { useState } from "react";
import { Check, Droplets, HeartPulse, Info } from "lucide-react";
import { BLOOD_GROUPS } from "@/data/mockData";
import type { BloodGroup } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

/** Red-cell transfusion compatibility: donor group -> recipient groups. */
const CAN_DONATE_TO: Record<BloodGroup, BloodGroup[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

const canReceiveFrom = (group: BloodGroup) =>
  BLOOD_GROUPS.filter((donor) => CAN_DONATE_TO[donor].includes(group));

function CompatibilityGrid({
  title,
  icon: Icon,
  compatible,
}: {
  title: string;
  icon: typeof Droplets;
  compatible: BloodGroup[];
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border bg-background/70 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-semibold">
          <span className="icon-tile-soft h-8 w-8 rounded-lg">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h3>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {t("home.compatibility.count", { count: compatible.length })}
        </span>
      </div>

      {/* Screen readers get a plain list; the grid is visual only. */}
      <p className="sr-only">{compatible.join(", ")}</p>
      <div aria-hidden="true" className="grid grid-cols-4 gap-2">
        {BLOOD_GROUPS.map((group) => {
          const ok = compatible.includes(group);
          return (
            <div
              key={group}
              className={cn(
                "relative flex h-12 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300",
                ok
                  ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/30"
                  : "bg-muted/50 text-muted-foreground/45",
              )}
            >
              {group}
              <span
                className={cn(
                  "absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-white transition-transform duration-300",
                  ok ? "scale-100 bg-primary" : "scale-0",
                )}
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BloodCompatibilitySection() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<BloodGroup>("O-");

  const donateTo = CAN_DONATE_TO[selected];
  const receiveFrom = canReceiveFrom(selected);
  const isUniversalDonor = donateTo.length === BLOOD_GROUPS.length;
  const isUniversalRecipient = receiveFrom.length === BLOOD_GROUPS.length;

  return (
    <section className="relative isolate py-20 section-soft">
      <div aria-hidden="true" className="section-pattern pattern-grid" />

      <div className="container">
        <div className="text-center mb-12">
          <span className="eyebrow mb-4">
            <HeartPulse className="h-4 w-4" />
            {t("home.compatibility.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("home.compatibility.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("home.compatibility.subtitle")}
          </p>
        </div>

        <div className="relative isolate overflow-hidden rounded-3xl border bg-card p-5 card-shadow md:p-8">
          <div
            aria-hidden="true"
            className="section-pattern pattern-dots pattern-fade-center opacity-80"
          />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
            {/* Picker */}
            <div>
              <p id="compat-picker-label" className="mb-4 text-sm font-medium text-muted-foreground">
                {t("home.compatibility.select")}
              </p>
              <div
                role="group"
                aria-labelledby="compat-picker-label"
                className="grid grid-cols-4 gap-3"
              >
                {BLOOD_GROUPS.map((group) => {
                  const active = group === selected;
                  return (
                    <button
                      key={group}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelected(group)}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-2xl border text-lg font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:text-xl",
                        active
                          ? "blood-badge-gradient scale-105 border-transparent text-white blood-glow"
                          : "bg-background/80 text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary",
                      )}
                    >
                      {group}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex min-h-8 flex-wrap gap-2" aria-live="polite">
                {isUniversalDonor && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                    <Droplets className="h-3.5 w-3.5" />
                    {t("home.compatibility.universalDonor")}
                  </span>
                )}
                {isUniversalRecipient && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <HeartPulse className="h-3.5 w-3.5" />
                    {t("home.compatibility.universalRecipient")}
                  </span>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="grid gap-4 sm:grid-cols-2" aria-live="polite">
              <CompatibilityGrid
                title={t("home.compatibility.canDonateTo", { group: selected })}
                icon={Droplets}
                compatible={donateTo}
              />
              <CompatibilityGrid
                title={t("home.compatibility.canReceiveFrom", { group: selected })}
                icon={HeartPulse}
                compatible={receiveFrom}
              />
            </div>
          </div>

          <p className="mt-6 flex items-start gap-2 border-t border-dashed pt-5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {t("home.compatibility.note")}
          </p>
        </div>
      </div>
    </section>
  );
}
