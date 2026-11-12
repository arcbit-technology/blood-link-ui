const UPLOAD_SEGMENT = "/image/upload/";

/**
 * Adds a Cloudinary delivery transformation to an image URL, e.g.
 * cld(url, { w: 96, h: 96 }) -> .../image/upload/c_fill,g_auto,w_96,h_96,q_auto,f_auto/v12/...
 * Non-Cloudinary URLs are returned unchanged.
 */
export function cld(
  url: string | undefined | null,
  opts: { w?: number; h?: number; crop?: "fill" | "limit" | "fit"; gravity?: "auto" | "face" | "center" } = {},
): string | undefined {
  if (!url) return undefined;
  const i = url.indexOf(UPLOAD_SEGMENT);
  if (!url.startsWith("https://res.cloudinary.com/") || i < 0) return url;

  const t = [
    `c_${opts.crop ?? "fill"}`,
    opts.crop === "limit" || opts.crop === "fit" ? "" : `g_${opts.gravity ?? "auto"}`,
    opts.w ? `w_${Math.round(opts.w)}` : "",
    opts.h ? `h_${Math.round(opts.h)}` : "",
    "q_auto",
    "f_auto",
  ]
    .filter(Boolean)
    .join(",");
  const head = url.slice(0, i + UPLOAD_SEGMENT.length);
  return `${head}${t}/${url.slice(i + UPLOAD_SEGMENT.length)}`;
}

/** Initials for an avatar fallback ("Rahim Uddin" -> "RU"). */
export function initials(name: string | undefined | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
