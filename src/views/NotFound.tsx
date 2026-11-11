"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="page-decor page-decor-full" aria-hidden="true">
        <div className="page-decor-grid" />
      </div>
      <div className="text-center animate-fade-in">
        <h1 className="mb-2 text-8xl font-bold text-gradient-blood md:text-9xl">404</h1>
        <p className="mb-8 text-xl text-muted-foreground">{t("notFound.title")}</p>
        <Link
          href="/"
          className="btn-blood inline-flex h-12 items-center justify-center rounded-full px-8 font-semibold"
        >
          {t("notFound.homeLink")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
