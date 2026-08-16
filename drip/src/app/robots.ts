import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/stripe";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Espaces personnels et tunnel d'achat : aucun intérêt à être indexés, et
      // ils ne doivent pas apparaître dans les résultats de recherche.
      disallow: ["/compte", "/admin", "/panier", "/commande", "/api"],
    },
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
