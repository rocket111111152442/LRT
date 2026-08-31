import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

/**
 * Redirections permanentes (301) des anciennes URL.
 *
 * L'inventaire provient de docs/adimen-audit.md § 1. Chaque URL indexée du site
 * précédent trouve ici son équivalent, afin de ne perdre aucune valeur de
 * référencement. Les URL déjà propres — /detective-geneve/, /detective-lausanne/,
 * /services/contre-mesures/ et /emplois/ — sont conservées telles quelles et ne
 * figurent donc pas dans cette liste.
 */
const anciennesUrl: { source: string; destination: string }[] = [
  // Présentation de l'agence
  { source: '/agence-detective-prive', destination: '/agence/' },
  { source: '/en/lagence-adimen', destination: '/agence/' },

  // Garanties
  { source: '/garantie-agence-detective', destination: '/garanties/' },

  // Particuliers — deux anciennes pages fusionnées
  { source: '/agence-detective-prive-particuliers', destination: '/services/particuliers/' },
  { source: '/services-aux-particuliers', destination: '/services/particuliers/' },
  { source: '/infidelite-adultere', destination: '/services/particuliers/#infidelite' },

  // Entreprises — deux anciennes pages fusionnées
  { source: '/detective-prive-entreprises', destination: '/services/entreprises/' },
  { source: '/services-aux-entreprises', destination: '/services/entreprises/' },

  // Parents
  { source: '/services-aux-parents', destination: '/services/parents/' },
  { source: '/en/services-for-parents', destination: '/services/parents/' },
  { source: '/plus-de-details-sur-la-drogue', destination: '/services/parents/#stupefiants' },

  // Contre-mesures
  { source: '/en/service-de-contre-mesures', destination: '/services/contre-mesures/' },

  // Pages locales
  { source: '/en/en-detective-prive-geneve', destination: '/detective-geneve/' },
  { source: '/en/detective-prive-lausanne', destination: '/detective-lausanne/' },

  // Réseau international — l'ancienne URL comportait une faute de frappe
  { source: '/resau-international-detective', destination: '/reseau-international/' },
  { source: '/reseau-international-detective', destination: '/reseau-international/' },
  { source: '/en/reseau-international', destination: '/reseau-international/' },

  // Tarifs
  { source: '/detective-prive-tarifs-prix', destination: '/tarifs/' },
  { source: '/en/detective-prive-tarifs-prix', destination: '/tarifs/' },

  // Contact
  { source: '/contacter-agence-detective-prive', destination: '/contact/' },
  { source: '/en/contact-en', destination: '/contact/' },
];

const racine = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Ce site vit dans un dossier du dépôt qui contient d'autres projets Node.
  // Sans cette ancre, Turbopack remonte jusqu'au dépôt parent et tente d'y
  // résoudre les modules d'une autre application.
  turbopack: { root: racine },

  // Le site précédent servait des URL terminées par une barre oblique.
  // La conserver évite une redirection supplémentaire sur chaque page indexée.
  trailingSlash: true,

  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async redirects() {
    return [
      ...anciennesUrl.map((regle) => ({ ...regle, statusCode: 301 as const })),
      // La version anglaise n'est pas reconduite : tout /en/… restant revient
      // à l'accueil francophone plutôt que de renvoyer une 404.
      { source: '/en', destination: '/', statusCode: 301 as const },
      { source: '/en/:chemin*', destination: '/', statusCode: 301 as const },
    ];
  },

  async headers() {
    return [
      {
        source: '/:chemin*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()',
          },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
