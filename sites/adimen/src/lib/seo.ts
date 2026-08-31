import type { Metadata } from 'next';
import { SITE_URL, agence } from '@/content/site';

type OptionsMeta = {
  titre: string;
  description: string;
  /** Chemin absolu commençant et finissant par « / ». */
  chemin: string;
  /** Empêche l'indexation (pages utilitaires uniquement). */
  noIndex?: boolean;
};

/**
 * Construit les métadonnées d'une page : titre, description, canonique,
 * Open Graph et Twitter Card. Chaque page appelle cette fonction, ce qui
 * garantit l'unicité et la cohérence des balises sur l'ensemble du site.
 */
export function construireMeta({ titre, description, chemin, noIndex }: OptionsMeta): Metadata {
  const url = `${SITE_URL}${chemin}`;

  /* La mise en page racine déclare `title.template` : « %s — Agence ADIMEN ».
     Next applique ce gabarit aux segments ENFANTS, jamais au segment qui le
     déclare. On renvoie donc le titre nu — y ajouter le suffixe ici le
     dupliquerait sur toutes les pages intérieures. L'accueil, qui partage le
     segment racine, ne reçoit pas le gabarit : son titre porte déjà la marque.

     `titreComplet` reconstitue le rendu final pour Open Graph et Twitter, qui
     n'utilisent pas de gabarit. */
  const titreComplet = chemin === '/' ? titre : `${titre} — ${agence.nom}`;

  return {
    title: titre,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      locale: 'fr_CH',
      siteName: agence.nom,
      url,
      title: titreComplet,
      description,
      // L'image de partage vient de src/app/opengraph-image.tsx : Next l'injecte
      // sur toutes les pages. La déclarer ici la remplacerait par une URL figée.
    },
    twitter: {
      card: 'summary_large_image',
      title: titreComplet,
      description,
    },
  };
}
