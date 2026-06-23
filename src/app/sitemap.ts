import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@/lib/appUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicAppUrl();
  const now = new Date();

  const paths = [
    "",
    "/suivi",
    "/pro/inscription",
    "/pro/premium",
    "/client/magasins",
    "/service-client",
    "/conditions-utilisation",
  ];

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
