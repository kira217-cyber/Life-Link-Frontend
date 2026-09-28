import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist_Mono, Instrument_Sans } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

/**
 * Two faces doing different jobs: Bricolage carries headings with enough
 * character to be recognisable, Instrument Sans stays quiet under dense
 * dashboard content. Geist Mono is kept for ids, codes and figures.
 */
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LifeLink — Blood Donation & Emergency Assistance",
    template: "%s · LifeLink",
  },
  description:
    "LifeLink connects verified blood requests with compatible, eligible donors nearby — and keeps an emergency assistance fund running behind them.",
  keywords: [
    "blood donation",
    "blood bank",
    "donor matching",
    "emergency assistance",
    "Bangladesh",
  ],
  openGraph: {
    type: "website",
    siteName: "LifeLink",
    title: "LifeLink — Blood Donation & Emergency Assistance",
    description:
      "Post a verified blood request and reach the donors who can actually answer it: compatible group, eligible to donate, close enough to come.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeLink — Blood Donation & Emergency Assistance",
    description:
      "Post a verified blood request and reach the donors who can actually answer it.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1416" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
