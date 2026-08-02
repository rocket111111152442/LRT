import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@/lib/appUrl";
import { isProAccountActive } from "@/lib/accountStatus";
import { prisma } from "@/lib/prisma";
import { seoResourceLinks } from "@/lib/seoResources";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicAppUrl();
  const now = new Date();

  const paths = [
    "",
    "/pro",
    "/client",
    "/suivi",
    "/client/magasins",
    "/service-client",
    "/demonstration",
    "/conditions-utilisation",
    ...seoResourceLinks.map((resource) => resource.href),
  ];

  const staticPages: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const accounts = await prisma.proAccount.findMany({
      take: 1000,
      select: {
        slug: true,
        paymentStatus: true,
        trialEndsAt: true,
        publicListed: true,
        updatedAt: true,
      },
    });
    const shopPages: MetadataRoute.Sitemap = accounts
      .filter((account) => account.publicListed !== false && isProAccountActive(account))
      .map((account) => ({
        url: `${base}/atelier/${account.slug}`,
        lastModified: account.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    return [...staticPages, ...shopPages];
  } catch {
    return staticPages;
  }
}
