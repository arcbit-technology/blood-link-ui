import type { TFunction } from "i18next";
import { ApiError } from "@/api/http";

const CODE_PATTERN = /^api\.bloodlinkapi\.err\.(\d+)$/;

/** The numeric part of an API error key ("api.bloodlinkapi.err.199" -> "199"). */
export function apiErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const match = CODE_PATTERN.exec(error.message);
  return match ? match[1] : null;
}

/**
 * A user-facing message for a failed API call: the translated text of the
 * API error key when there is one (locales: apiErrors.<code>), otherwise
 * the fallback.
 */
export function apiErrorMessage(error: unknown, t: TFunction, fallback?: string): string {
  const code = apiErrorCode(error);
  const generic = fallback ?? t("common.somethingWentWrong");
  if (code) return t(`apiErrors.${code}`, { defaultValue: generic });
  if (error instanceof ApiError && error.status === 403) return t("apiErrors.forbidden");
  return generic;
}
