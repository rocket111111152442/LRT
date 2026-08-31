import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { properties } from "@/lib/data/properties";
import { blogPosts } from "@/lib/data/blog";
import { localities } from "@/lib/data/localities";

const staticRoutes = [
  "",
  "/a-propos",
  "/developpement-foncier",
  "/vendre-mon-terrain",
  "/vendre-mon-bien-residentiel",
  "/vendre-mon-projet-neuf",
  "/projets-neufs",
  "/biens-residentiels",
  "/biens-dinvestissements",
  "/tous-nos-biens",
  "/estimation-immobiliere",
  "/references",
  "/blog",
  "/contact",
  "/mentions-legales",
  "/conditions-generales",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  for (const property of properties) {
    entries.push({
      url: `${site.url}/tous-nos-biens/${property.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const post of blogPosts) {
    entries.push({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  for (const locality of localities) {
    entries.push({
      url: `${site.url}/agence-immobiliere-a-${locality.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
