import type { Commune } from "./types";

/**
 * Petit jeu de communes de démonstration (3 par canton), suffisant pour
 * illustrer le gabarit de page locale sans générer des milliers de pages
 * quasi identiques (voir docs/neho-audit.md §8 et §12).
 */
export const communes: Commune[] = [
  // Genève
  { slug: "geneve-ville", name: "Genève", canton: "geneve", postalCode: "1200", population: 205000, averagePricePerSqm: 14200, priceTrendPercent: 3.1, averageDaysOnMarket: 52, description: "Cœur urbain international, marché tendu porté par la demande des organisations basées à Genève." },
  { slug: "carouge", name: "Carouge", canton: "geneve", postalCode: "1227", population: 22500, averagePricePerSqm: 12600, priceTrendPercent: 2.4, averageDaysOnMarket: 57, description: "Ville d'art et d'artisanat prisée pour son architecture piémontaise et sa vie de quartier." },
  { slug: "meyrin", name: "Meyrin", canton: "geneve", postalCode: "1217", population: 27000, averagePricePerSqm: 11400, priceTrendPercent: 2.0, averageDaysOnMarket: 61, description: "Commune résidentielle proche du CERN et de l'aéroport, appréciée des familles." },

  // Vaud
  { slug: "lausanne", name: "Lausanne", canton: "vaud", postalCode: "1000", population: 140000, averagePricePerSqm: 11800, priceTrendPercent: 2.8, averageDaysOnMarket: 55, description: "Capitale olympique en pente vers le lac, marché soutenu par les hautes écoles et l'emploi tertiaire." },
  { slug: "nyon", name: "Nyon", canton: "vaud", postalCode: "1260", population: 22000, averagePricePerSqm: 10900, priceTrendPercent: 2.6, averageDaysOnMarket: 60, description: "Entre Genève et Lausanne, une ville lacustre très recherchée par les familles internationales." },
  { slug: "montreux", name: "Montreux", canton: "vaud", postalCode: "1820", population: 26500, averagePricePerSqm: 10200, priceTrendPercent: 1.9, averageDaysOnMarket: 68, description: "Riviera vaudoise réputée pour ses vues sur le lac et les Alpes, marché porté par le tourisme et le lifestyle." },

  // Fribourg
  { slug: "fribourg-ville", name: "Fribourg", canton: "fribourg", postalCode: "1700", population: 40000, averagePricePerSqm: 8100, priceTrendPercent: 3.4, averageDaysOnMarket: 66, description: "Ville bilingue en forte croissance, portée par les hautes écoles et sa position centrale." },
  { slug: "bulle", name: "Bulle", canton: "fribourg", postalCode: "1630", population: 24500, averagePricePerSqm: 7300, priceTrendPercent: 2.9, averageDaysOnMarket: 70, description: "Capitale de la Gruyère, pôle économique régional en pleine expansion." },
  { slug: "estavayer-le-lac", name: "Estavayer-le-Lac", canton: "fribourg", postalCode: "1470", population: 9200, averagePricePerSqm: 6700, priceTrendPercent: 2.2, averageDaysOnMarket: 74, description: "Cité médiévale au bord du lac de Neuchâtel, marché calme et recherché pour les résidences familiales." },

  // Valais
  { slug: "sion", name: "Sion", canton: "valais", postalCode: "1950", population: 35000, averagePricePerSqm: 7800, priceTrendPercent: 2.3, averageDaysOnMarket: 73, description: "Capitale valaisanne au cœur de la plaine du Rhône, marché mixte résidentiel et commercial." },
  { slug: "martigny", name: "Martigny", canton: "valais", postalCode: "1920", population: 20500, averagePricePerSqm: 7200, priceTrendPercent: 2.1, averageDaysOnMarket: 75, description: "Carrefour historique entre Suisse, France et Italie, marché accessible en pleine mutation." },
  { slug: "crans-montana", name: "Crans-Montana", canton: "valais", postalCode: "3963", population: 6800, averagePricePerSqm: 11900, priceTrendPercent: 4.2, averageDaysOnMarket: 91, description: "Station alpine prisée pour les résidences secondaires haut de gamme, marché saisonnier et international." },

  // Neuchâtel
  { slug: "neuchatel-ville", name: "Neuchâtel", canton: "neuchatel", postalCode: "2000", population: 33500, averagePricePerSqm: 7400, priceTrendPercent: 2.5, averageDaysOnMarket: 65, description: "Ville lacustre à l'architecture homogène, portée par l'université et l'industrie de précision." },
  { slug: "la-chaux-de-fonds", name: "La Chaux-de-Fonds", canton: "neuchatel", postalCode: "2300", population: 37000, averagePricePerSqm: 5200, priceTrendPercent: 1.8, averageDaysOnMarket: 79, description: "Cité horlogère inscrite au patrimoine mondial de l'UNESCO, rapport qualité-prix attractif." },
  { slug: "boudry", name: "Boudry", canton: "neuchatel", postalCode: "2017", population: 6100, averagePricePerSqm: 7100, priceTrendPercent: 2.0, averageDaysOnMarket: 69, description: "Bourg viticole du littoral neuchâtelois, recherché pour son cadre de vie et ses vignes." },

  // Jura
  { slug: "delemont", name: "Delémont", canton: "jura", postalCode: "2800", population: 13000, averagePricePerSqm: 4600, priceTrendPercent: 1.6, averageDaysOnMarket: 80, description: "Chef-lieu jurassien, marché stable porté par l'administration cantonale et l'artisanat." },
  { slug: "porrentruy", name: "Porrentruy", canton: "jura", postalCode: "2900", population: 6900, averagePricePerSqm: 3900, priceTrendPercent: 1.2, averageDaysOnMarket: 85, description: "Cité historique de l'Ajoie, un des marchés les plus abordables de Suisse romande." },
  { slug: "saignelegier", name: "Saignelégier", canton: "jura", postalCode: "2350", population: 2600, averagePricePerSqm: 3600, priceTrendPercent: 1.0, averageDaysOnMarket: 88, description: "Cœur des Franches-Montagnes, marché rural recherché pour le calme et les grands terrains." },
];

export function getCommunesByCanton(canton: string): Commune[] {
  return communes.filter((c) => c.canton === canton);
}

export function getCommuneBySlug(slug: string): Commune | undefined {
  return communes.find((c) => c.slug === slug);
}
