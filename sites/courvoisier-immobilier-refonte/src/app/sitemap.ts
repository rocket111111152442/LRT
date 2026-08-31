import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { properties } from "@/lib/data/properties";
import { promotions } from "@/lib/data/promotions";
import { articles } from "@/lib/data/articles";

const STATIC_PATHS = [
  "/",
  "/acheter",
  "/louer",
  "/vendre",
  "/estimer",
  "/services",
  "/promotion",
  "/conseil-developpement",
  "/gerance",
  "/a-propos",
  "/temoignages",
  "/agences",
  "/contact",
  "/actualites",
  "/mentions-legales",
  "/confidentialite",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
  }));

  const propertyEntries = properties.map((p) => ({
    url: `${siteConfig.url}/biens/${p.slug}`,
    lastModified: now,
  }));

  const promotionEntries = promotions.map((p) => ({
    url: `${siteConfig.url}/promotion/${p.slug}`,
    lastModified: now,
  }));

  const articleEntries = articles.map((a) => ({
    url: `${siteConfig.url}/actualites/${a.slug}`,
    lastModified: new Date(a.publishedAt),
  }));

  return [...staticEntries, ...propertyEntries, ...promotionEntries, ...articleEntries];
}
