export const LANGUAGES = ["bn", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "bn";
/** Cookie that carries the chosen language so the server renders the same text the client will. */
export const LANGUAGE_COOKIE = "lang";
/** Legacy client-only storage key, still written for backwards compatibility. */
export const LANGUAGE_STORAGE_KEY = "i18nextLng";

/** Maps values like "en", "en-US" or "BN" to a supported language. */
export function normalizeLanguage(value: string | null | undefined): Language | undefined {
  const primary = value?.trim().toLowerCase().split(/[-_]/)[0];
  return LANGUAGES.find((language) => language === primary);
}

/** Picks the highest-weighted supported language from an Accept-Language header. */
export function languageFromAcceptHeader(header: string | null | undefined): Language | undefined {
  if (!header) return undefined;
  return header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number.parseFloat(q.slice(2)) : 1;
      return { language: normalizeLanguage(tag), weight: Number.isNaN(weight) ? 0 : weight, index };
    })
    .filter((entry): entry is { language: Language; weight: number; index: number } => !!entry.language && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index)[0]?.language;
}

export function readLanguageCookie(cookieString: string): Language | undefined {
  const match = cookieString.match(new RegExp(`(?:^|;\\s*)${LANGUAGE_COOKIE}=([^;]*)`));
  return normalizeLanguage(match ? decodeURIComponent(match[1]) : undefined);
}

export function writeLanguageCookie(language: Language) {
  document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=31536000; samesite=lax`;
}
