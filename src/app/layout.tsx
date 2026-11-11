import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
