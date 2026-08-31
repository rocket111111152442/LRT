import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/content/site';

/**
 * Plan du site.
 *
 * Les chemins sont listés explicitement plutôt que déduits du système de
 * fichiers : une page ajoutée sans être référencée ici ne doit pas apparaître
 * par accident, et les priorités restent lisibles.
 */
const pages: {
  chemin: string;
  priorite: number;
  frequence: MetadataRoute.Sitemap[number]['changeFrequency'];
}[] = [
  { chemin: '/', priorite: 1, frequence: 'monthly' },
  { chemin: '/agence/', priorite: 0.8, frequence: 'yearly' },
  { chemin: '/garanties/', priorite: 0.8, frequence: 'yearly' },
  { chemin: '/services/particuliers/', priorite: 0.9, frequence: 'yearly' },
  { chemin: '/services/entreprises/', priorite: 0.9, frequence: 'yearly' },
  { chemin: '/services/parents/', priorite: 0.8, frequence: 'yearly' },
  { chemin: '/services/contre-mesures/', priorite: 0.8, frequence: 'yearly' },
  { chemin: '/detective-geneve/', priorite: 0.9, frequence: 'monthly' },
  { chemin: '/detective-lausanne/', priorite: 0.9, frequence: 'monthly' },
  { chemin: '/reseau-international/', priorite: 0.7, frequence: 'yearly' },
  { chemin: '/tarifs/', priorite: 0.9, frequence: 'monthly' },
  { chemin: '/medias/', priorite: 0.5, frequence: 'yearly' },
  { chemin: '/emplois/', priorite: 0.5, frequence: 'monthly' },
  { chemin: '/contact/', priorite: 0.9, frequence: 'yearly' },
  { chemin: '/mentions-legales/', priorite: 0.2, frequence: 'yearly' },
  { chemin: '/politique-de-confidentialite/', priorite: 0.2, frequence: 'yearly' },
  { chemin: '/gestion-des-cookies/', priorite: 0.2, frequence: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const modifie = new Date();

  return pages.map((page) => ({
    url: `${SITE_URL}${page.chemin}`,
    lastModified: modifie,
    changeFrequency: page.frequence,
    priority: page.priorite,
  }));
}
