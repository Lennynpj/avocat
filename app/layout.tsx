import type { Metadata, Viewport } from "next";
import { Newsreader, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Maître Jean Vivien NGANGA — Avocat au Barreau de Bobigny",
    template: "%s · Cabinet NGANGA",
  },
  description:
    "Cabinet de Maître Jean Vivien NGANGA, avocat à Clichy-sous-bois (93). Droit pénal, droit des étrangers, droit de la famille et droit du travail. Prise de rendez-vous en ligne.",
  keywords: [
    "avocat Bobigny",
    "avocat Clichy-sous-bois",
    "avocat droit pénal 93",
    "avocat droit des étrangers Seine-Saint-Denis",
    "avocat droit de la famille",
    "avocat droit du travail",
    "prendre rendez-vous avocat",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "Maître Jean Vivien NGANGA — Avocat au Barreau de Bobigny",
    description:
      "Droit pénal, droit des étrangers, droit de la famille et droit du travail à Clichy-sous-bois (93). Rendez-vous en ligne.",
    siteName: "Cabinet NGANGA",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1B2A4A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
