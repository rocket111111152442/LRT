import type { Canton } from "./types";

/**
 * Jeu de démonstration : 6 cantons de Suisse romande, cohérent avec la
 * couverture identifiée lors de l'audit (docs/neho-audit.md §1, §5).
 * Les statistiques sont indicatives et clairement présentées comme telles
 * sur les pages qui les affichent (voir DemoBadge).
 */
export const cantons: Canton[] = [
  {
    slug: "geneve",
    name: "Genève",
    region: "Suisse romande",
    heroFact: "Marché tendu, forte demande internationale",
    description:
      "Le canton le plus dense de Suisse romande, entre lac et frontière, où la demande dépasse largement l'offre disponible.",
    communesCount: 45,
    stats: { averagePricePerSqm: 13200, medianSaleDays: 58, activeListings: 6 },
  },
  {
    slug: "vaud",
    name: "Vaud",
    region: "Suisse romande",
    heroFact: "Le plus grand canton romand, du lac aux Alpes",
    description:
      "De l'agglomération lausannoise à la Riviera, un marché varié qui va du studio urbain à la villa avec vue sur le lac.",
    communesCount: 300,
    stats: { averagePricePerSqm: 10800, medianSaleDays: 64, activeListings: 8 },
  },
  {
    slug: "fribourg",
    name: "Fribourg",
    region: "Suisse romande",
    heroFact: "Entre deux cultures, un marché accessible",
    description:
      "Un canton bilingue en forte croissance démographique, où les prix restent plus accessibles que sur l'arc lémanique.",
    communesCount: 126,
    stats: { averagePricePerSqm: 7600, medianSaleDays: 71, activeListings: 5 },
  },
  {
    slug: "valais",
    name: "Valais",
    region: "Suisse romande",
    heroFact: "Résidences principales et secondaires alpines",
    description:
      "De la plaine du Rhône aux stations de montagne, un marché à deux vitesses entre résidences principales et secondaires.",
    communesCount: 122,
    stats: { averagePricePerSqm: 7900, medianSaleDays: 76, activeListings: 5 },
  },
  {
    slug: "neuchatel",
    name: "Neuchâtel",
    region: "Suisse romande",
    heroFact: "Horlogerie, lac et prix encore raisonnables",
    description:
      "Un canton dynamique porté par l'industrie horlogère, avec un rapport qualité-prix parmi les plus intéressants de Suisse romande.",
    communesCount: 25,
    stats: { averagePricePerSqm: 6900, medianSaleDays: 68, activeListings: 4 },
  },
  {
    slug: "jura",
    name: "Jura",
    region: "Suisse romande",
    heroFact: "Le plus jeune canton suisse, à taille humaine",
    description:
      "Un marché plus rural et plus abordable, apprécié pour son calme et sa proximité avec les bassins d'emploi.",
    communesCount: 49,
    stats: { averagePricePerSqm: 4300, medianSaleDays: 82, activeListings: 3 },
  },
];

export function getCantonBySlug(slug: string): Canton | undefined {
  return cantons.find((c) => c.slug === slug);
}
