import type { MetadataRoute } from "next";
import { prisma, safeQuery } from "@/lib/prisma";
import { appUrl } from "@/lib/stripe";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/boutique`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/avis`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/histoire`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/livraison-retours`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/cgv`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookies`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const products = await safeQuery(
    () =>
      prisma.product.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
      }),
    [],
    "sitemap produits",
  );

  const categories = await safeQuery(
    () => prisma.category.findMany({ select: { slug: true } }),
    [],
    "sitemap rayons",
  );

  return [
    ...staticRoutes,
    ...products.map((product) => ({
      url: `${base}/produit/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: `${base}/boutique?rayon=${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
