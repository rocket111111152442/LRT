import type { Metadata } from "next";
import { archivo, newsreader } from "./fonts";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_CH",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CH" className={`${archivo.variable} ${newsreader.variable}`}>
      <body>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[var(--color-ink)] focus:px-4 focus:py-2 focus:text-[var(--color-ivory)]"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="contenu">{children}</main>
        <Footer />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
