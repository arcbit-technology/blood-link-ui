import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { getRequestLanguage } from "@/lib/serverLanguage";
import "@/index.css";

export const metadata: Metadata = {
  title: "Blood Link",
  description: "A blood donation tracking application",
  authors: [{ name: "Blood Link Team" }],
  icons: {
    // Keep tab icons theme-specific so a fixed ICO cannot override them.
    icon: [
      {
        url: "/favicon-light.png?v=3",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.png?v=3",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    title: "Blood Link",
    description: "A blood donation tracking application",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Let content extend under the iOS home indicator; the bottom nav pads itself.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffafb" },
    { media: "(prefers-color-scheme: dark)", color: "#140a0e" },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Render in the visitor's language on the server so hydration sees identical text.
  const language = await getRequestLanguage();

  return (
    <html lang={language} suppressHydrationWarning>
      <body>
        <Providers initialLanguage={language}>{children}</Providers>
      </body>
    </html>
  );
}
