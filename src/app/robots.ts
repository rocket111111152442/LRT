import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@/lib/appUrl";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicAppUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/moderateur", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
