import type { Metadata } from "next";
import { Archivo, Fraunces } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";
import { OrganizationJsonLd } from "@/lib/seo/OrganizationJsonLd";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.legalName} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "fr_CH",
    siteName: site.name,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr-CH" className={`${archivo.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col overflow-x-hidden">
        <OrganizationJsonLd />
        {children}
      </body>
    </html>
  );
}
