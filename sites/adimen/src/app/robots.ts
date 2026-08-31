import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/content/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // La route d'API ne contient aucune page : l'exclure évite des requêtes inutiles.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
