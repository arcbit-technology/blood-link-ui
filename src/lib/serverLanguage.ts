import { cookies, headers } from "next/headers";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE,
  languageFromAcceptHeader,
  normalizeLanguage,
  type Language,
} from "@/lib/language";

/** The language to server-render: saved choice first, then the browser's preference. */
export async function getRequestLanguage(): Promise<Language> {
  const saved = normalizeLanguage((await cookies()).get(LANGUAGE_COOKIE)?.value);
  if (saved) return saved;
  return languageFromAcceptHeader((await headers()).get("accept-language")) ?? DEFAULT_LANGUAGE;
}
