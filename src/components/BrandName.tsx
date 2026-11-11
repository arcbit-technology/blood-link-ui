"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function BrandName({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [blood, ...link] = t("header.appName").split(" ");

  return (
    <span className={cn("whitespace-nowrap font-bold", className)}>
      <span className="text-primary">{blood}</span>{" "}
      <span className="text-foreground">
        {link.join(" ")}
      </span>
    </span>
  );
}
