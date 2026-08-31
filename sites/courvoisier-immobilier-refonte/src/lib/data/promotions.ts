import type { Promotion } from "./types";

/**
 * Promotions sourcées — voir docs/courvoisier-audit.md §4. Aucun prix, plan
 * ou taux de disponibilité exact n’a pu être vérifié dans cet environnement :
 * ces informations ne figurent donc pas ci-dessous et `sourceNote` renvoie
 * vers l’agence plutôt que d’inventer un chiffre. À compléter avant mise en
 * production.
 */
export const promotions: Promotion[] = [
  {
    slug: "residence-namaya",
    name: "Résidence NAMAYA",
    locality: "Rolle",
    status: "Livraison annoncée",
    delivery: "Été 2026",
    architect: "Gabriele Rossi",
    roomsRange: "3.5 – 4.5 pièces",
    surfaceRange: "105 – 147 m²",
    concept:
      "Entre Genève et Lausanne, dans un quartier résidentiel calme proche du Léman.",
    description: [
      "La Résidence NAMAYA prend place à Rolle, entre Genève et Lausanne, dans un environnement résidentiel calme à proximité du lac Léman.",
      "Les appartements de 3.5 à 4.5 pièces, de 105 à 147 m², offrent des intérieurs personnalisables — une conception signée par l’architecte Gabriele Rossi.",
    ],
    typologies: [
      { label: "3.5 pièces", surface: "105 m²", availability: "Sur demande" },
      { label: "4.5 pièces", surface: "147 m²", availability: "Sur demande" },
    ],
    sourceNote:
      "Disponibilités, prix et plans détaillés communiqués sur demande auprès de notre équipe promotion.",
  },
  {
    slug: "residence-terravista",
    name: "Résidence TerraVista",
    locality: "Région lausannoise",
    status: "En construction",
    units: "4 appartements, un par étage",
    concept:
      "Quatre appartements haut de gamme, un par étage, ascenseur privatif et vue dégagée.",
    description: [
      "À proximité de Lausanne, la Résidence TerraVista propose quatre appartements haut de gamme, à raison d’un logement par étage.",
      "Chaque unité dispose d’un ascenseur privatif et de vastes espaces extérieurs, pensés pour la lumière naturelle, la vue dégagée et la qualité des finitions.",
    ],
    sourceNote:
      "Localisation précise, prix et disponibilités communiqués sur demande auprès de notre équipe promotion.",
  },
];

export function getPromotion(slug: string): Promotion | undefined {
  return promotions.find((p) => p.slug === slug);
}
