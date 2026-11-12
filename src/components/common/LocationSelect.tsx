"use client";

import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DISTRICTS, DIVISIONS, UPAZILAS, type District } from "@/data/locations";
import type { Division } from "@/types";

export type LocationValue = {
  division: string;
  district: string;
  upazila: string;
};

export const EMPTY_LOCATION: LocationValue = { division: "", district: "", upazila: "" };

/**
 * Value used for the "all" option of filter selects (Radix Select items need
 * a non-empty value). An empty string value (never undefined, which would
 * make the Select uncontrolled and keep showing the old choice) shows the
 * placeholder.
 */
const ALL = "__all__";

interface LocationSelectProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  /** Show the upazila / thana select (default true). */
  showUpazila?: boolean;
  /** Filter mode: each level gets an "All" option and nothing is required. */
  allowAll?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  /** Grid columns on wide screens. */
  columns?: 1 | 2 | 3;
  idPrefix?: string;
}

export function upazilasOf(district: string): string[] {
  return UPAZILAS[district as District] ?? [];
}

/** Division → district → upazila cascade. Changing a level clears the levels below it. */
export function LocationSelect({
  value,
  onChange,
  showUpazila = true,
  allowAll = false,
  required = false,
  disabled = false,
  className,
  columns = 3,
  idPrefix = "location",
}: LocationSelectProps) {
  const { t } = useTranslation();
  const districts = value.division ? DISTRICTS[value.division as Division] ?? [] : [];
  const upazilas = upazilasOf(value.district);
  const fromSelect = (v: string) => (v === ALL ? "" : v);
  const placeholder = allowAll ? t("common.all") : t("common.select");

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-3",
        className,
      )}
    >
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-division`}>
          {t("location.labels.division")}
          {required && <span className="text-primary"> *</span>}
        </Label>
        <Select
          value={value.division || (allowAll ? ALL : "")}
          onValueChange={(v) => onChange({ division: fromSelect(v), district: "", upazila: "" })}
          disabled={disabled}
        >
          <SelectTrigger id={`${idPrefix}-division`} aria-required={required}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {allowAll && <SelectItem value={ALL}>{t("common.all")}</SelectItem>}
            {DIVISIONS.map((d) => (
              <SelectItem key={d} value={d}>
                {t(`location.division.${d}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-district`}>
          {t("location.labels.district")}
          {required && <span className="text-primary"> *</span>}
        </Label>
        <Select
          value={value.district || (allowAll && value.division ? ALL : "")}
          onValueChange={(v) => onChange({ ...value, district: fromSelect(v), upazila: "" })}
          disabled={disabled || !value.division}
        >
          <SelectTrigger id={`${idPrefix}-district`} aria-required={required}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {allowAll && <SelectItem value={ALL}>{t("common.all")}</SelectItem>}
            {districts.map((d) => (
              <SelectItem key={d} value={d}>
                {t(`location.district.${d}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showUpazila && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-upazila`}>
            {t("location.labels.upazila")}
            {required && <span className="text-primary"> *</span>}
          </Label>
          <Select
            value={value.upazila || (allowAll && value.district ? ALL : "")}
            onValueChange={(v) => onChange({ ...value, upazila: fromSelect(v) })}
            disabled={disabled || !value.district}
          >
            <SelectTrigger id={`${idPrefix}-upazila`} aria-required={required}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {allowAll && <SelectItem value={ALL}>{t("common.all")}</SelectItem>}
              {upazilas.map((u) => (
                <SelectItem key={u} value={u}>
                  {t(`location.upazila.${u}`, { defaultValue: u })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

/** "Savar, Dhaka" in the current language. */
export function useLocationLabel() {
  const { t } = useTranslation();
  return (loc: { upazila?: string; district?: string; division?: string }) =>
    [
      loc.upazila ? t(`location.upazila.${loc.upazila}`, { defaultValue: loc.upazila }) : "",
      loc.district ? t(`location.district.${loc.district}`, { defaultValue: loc.district }) : "",
    ]
      .filter(Boolean)
      .join(", ");
}
