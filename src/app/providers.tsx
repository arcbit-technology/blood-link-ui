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
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  readLanguageCookie,
  writeLanguageCookie,
  type Language,
} from "@/lib/language";

export function Providers({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [queryClient] = useState(() => new QueryClient());
  // The server already rendered in `initialLanguage`, so start the client there too.
  const [i18n] = useState(() => createI18n(initialLanguage));

  useEffect(() => {
    const persistLanguage = (value: string) => {
      const language = normalizeLanguage(value) ?? DEFAULT_LANGUAGE;
      document.documentElement.lang = language;
      writeLanguageCookie(language);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      } catch {
        // Language switching still works when storage is unavailable.
      }
    };

    i18n.on("languageChanged", persistLanguage);

    if (!readLanguageCookie(document.cookie)) {
      // One-time migration for visitors whose choice was only kept in localStorage.
      let saved: Language | undefined;
      try {
        saved = normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
      } catch {
        // Browser storage can be disabled; keep the server-detected language.
      }
      if (saved && saved !== i18n.language) {
        void i18n.changeLanguage(saved);
      } else {
        persistLanguage(i18n.language);
      }
    }

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
