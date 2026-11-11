"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function BrandName({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [blood, ...link] = t("header.appName").split(" ");

  return (
    <span className={cn("whitespace-nowrap font-bold", className)}>
      <span className="text-[#ed0000]">{blood}</span>{" "}
      <span className="text-[#1f2937] dark:text-[#f1f5f9]">
        {link.join(" ")}
      </span>
    </span>
  );
}
