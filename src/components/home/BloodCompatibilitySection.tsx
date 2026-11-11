import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, HeartPulse, Info, Sparkles } from "lucide-react";
import { BLOOD_GROUPS } from "@/data/mockData";
import type { BloodGroup } from "@/types";
import { BloodBadge } from "@/components/ui/blood-badge";
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

function GroupList({
  title,
  icon: Icon,
  groups,
}: {
  title: string;
  icon: typeof HeartPulse;
  groups: BloodGroup[];
}) {
  return (
    <div className="p-6 md:p-8">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <li
            key={group}
            className="flex h-10 min-w-[3.5rem] items-center justify-center rounded-xl bg-primary/10 px-3 text-sm font-bold text-primary ring-1 ring-inset ring-primary/20"
          >
            {group}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BloodCompatibilitySection() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<BloodGroup>("O-");

  const donateTo = CAN_DONATE_TO[selected];
  const receiveFrom = canReceiveFrom(selected);
  const universal =
    donateTo.length === BLOOD_GROUPS.length
      ? t("home.compatibility.universalDonor")
      : receiveFrom.length === BLOOD_GROUPS.length
        ? t("home.compatibility.universalRecipient")
        : null;

  return (
    <section className="relative isolate py-20 section-soft">
      <div aria-hidden="true" className="section-pattern pattern-grid" />

      <div className="container max-w-5xl">
        <div className="text-center mb-10">
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

        {/* Picker */}
        <div
          role="group"
          aria-label={t("home.compatibility.select")}
          className="mx-auto mb-8 grid max-w-md grid-cols-4 gap-1.5 rounded-3xl border bg-card p-1.5 shadow-sm sm:flex sm:w-fit sm:max-w-none sm:rounded-full"
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
                  "h-10 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-w-[3.5rem]",
                  active
                    ? "blood-gradient text-white shadow-md"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                )}
              >
                {group}
              </button>
            );
          })}
        </div>

        {/* Result */}
        <div
          className="grid overflow-hidden rounded-3xl border bg-card card-shadow divide-y md:grid-cols-[auto_1fr_1fr] md:divide-x md:divide-y-0"
          aria-live="polite"
        >
          <div className="flex flex-col items-center justify-center gap-3 p-6 md:px-10">
            <BloodBadge bloodGroup={selected} size="lg" />
            <span
              className={cn(
                "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-semibold",
                universal ? "bg-primary/10 text-primary" : "invisible",
              )}
            >
              <Sparkles className="h-3 w-3" />
              {universal}
            </span>
          </div>

          <GroupList
            title={t("home.compatibility.canDonateTo", { group: selected })}
            icon={ArrowUpFromLine}
            groups={donateTo}
          />
          <GroupList
            title={t("home.compatibility.canReceiveFrom", { group: selected })}
            icon={ArrowDownToLine}
            groups={receiveFrom}
          />
        </div>

        <p className="mt-5 flex items-start justify-center gap-2 text-center text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("home.compatibility.note")}
        </p>
      </div>
    </section>
  );
}
