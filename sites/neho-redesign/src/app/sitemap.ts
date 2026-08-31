import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { locales } from "@/lib/i18n/config";
import { cantons } from "@/lib/data/cantons";
import { communes } from "@/lib/data/communes";
import { agents } from "@/lib/data/agents";
import { properties } from "@/lib/data/properties";
import { blogPosts } from "@/lib/data/blog";

const staticPaths = [
  "",
  "/offres",
  "/vendre",
  "/acheter",
  "/estimation",
  "/biens",
  "/a-propos",
  "/equipe",
  "/antennes",
  "/temoignages",
  "/blog",
  "/neho-pro",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
  "/cookies",
];

function alternates(path: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${siteConfig.url}/${l}${path}`;
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of locales) {
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
        alternates: { languages: alternates(path) },
      });
    }
  }

  for (const canton of cantons) {
    const path = `/antennes/${canton.slug}`;
    for (const locale of locales) {
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: alternates(path) },
      });
    }
  }

  for (const commune of communes) {
    const path = `/antennes/${commune.canton}/${commune.slug}`;
    for (const locale of locales) {
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: { languages: alternates(path) },
      });
    }
  }

  for (const agent of agents) {
    const path = `/equipe/${agent.slug}`;
    for (const locale of locales) {
      entries.push({ url: `${siteConfig.url}/${locale}${path}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4, alternates: { languages: alternates(path) } });
    }
  }

  for (const property of properties) {
    const path = `/biens/${property.slug}`;
    for (const locale of locales) {
      entries.push({ url: `${siteConfig.url}/${locale}${path}`, lastModified: property.publishedAt, changeFrequency: "weekly", priority: 0.6, alternates: { languages: alternates(path) } });
    }
  }

  for (const post of blogPosts) {
    const path = `/blog/${post.slug}`;
    for (const locale of locales) {
      entries.push({ url: `${siteConfig.url}/${locale}${path}`, lastModified: post.publishedAt, changeFrequency: "yearly", priority: 0.5, alternates: { languages: alternates(path) } });
    }
  }

  return entries;
}
