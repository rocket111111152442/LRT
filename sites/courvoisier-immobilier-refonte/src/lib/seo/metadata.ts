import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}

export function pageMetadata({ title, description, path, noIndex }: PageMetadataInput): Metadata {
  const url = `${siteConfig.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: `${title} — ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      locale: "fr_CH",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${siteConfig.name}`,
      description,
    },
  };
}
