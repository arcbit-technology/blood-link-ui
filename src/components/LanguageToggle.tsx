"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// Inline SVG flags: emoji flags render as plain letters on Windows.
function BangladeshFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 12" className={className} aria-hidden="true">
      <rect width="20" height="12" fill="#006a4e" />
      <circle cx="9" cy="6" r="3.6" fill="#f42a41" />
    </svg>
  );
}

function UsFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 12" className={className} aria-hidden="true">
      <rect width="20" height="12" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 12) / 13} width="20" height={12 / 13} fill="#b22234" />
      ))}
      <rect width="8.5" height="6.5" fill="#3c3b6e" />
    </svg>
  );
}

/** One-tap language switch between Bangla and English, showing the current language. */
export function LanguageToggle({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language?.startsWith("en");
  const next = isEnglish ? "bn" : "en";
  const label = t("header.language.switchTo", { language: t(`header.language.${next}`) });

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:text-primary active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="flex h-3 w-[18px] overflow-hidden rounded-[2px]">
        {isEnglish ? <UsFlag className="h-full w-full" /> : <BangladeshFlag className="h-full w-full" />}
      </span>
      <span>{isEnglish ? "EN" : "BN"}</span>
    </button>
  );
}
