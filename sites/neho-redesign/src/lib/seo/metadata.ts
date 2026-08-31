import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n/config";
import { locales } from "@/lib/i18n/config";

interface BuildMetadataOptions {
  locale: Locale;
  path: string; // ex: "/offres", sans le préfixe de langue
  title: string;
  description: string;
  noIndex?: boolean;
}

export function buildMetadata({ locale, path, title, description, noIndex }: BuildMetadataOptions): Metadata {
  const url = `${siteConfig.url}/${locale}${path}`;
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${siteConfig.url}/${l}${path}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_CH" : "en_CH",
      url,
      siteName: siteConfig.name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  };
}
