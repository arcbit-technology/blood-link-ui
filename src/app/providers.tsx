"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createI18n } from "@/i18n";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [i18n] = useState(createI18n);

  useEffect(() => {
    let savedLanguage: string | null = null;
    try {
      savedLanguage = localStorage.getItem("i18nextLng");
    } catch {
      // Browser storage can be disabled; use the browser language instead.
    }

    const languages = savedLanguage ? [savedLanguage] : navigator.languages;
    const preferredLanguage = languages
      .map((language) => language.toLowerCase().split("-")[0])
      .find((language) => language === "bn" || language === "en") ?? "bn";

    const persistLanguage = (language: string) => {
      document.documentElement.lang = language;
      try {
        localStorage.setItem("i18nextLng", language);
      } catch {
        // Language switching still works when storage is unavailable.
      }
    };

    i18n.on("languageChanged", persistLanguage);
    void i18n.changeLanguage(preferredLanguage);

    return () => {
      i18n.off("languageChanged", persistLanguage);
    };
  }, [i18n]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SocketProvider>
              <TooltipProvider>
                {children}
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </SocketProvider>
          </AuthProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}
