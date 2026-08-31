/**
 * Gabarit de pages locales, data-driven — voir docs/votrecourtier-audit.md §7.
 * Un échantillon de localités réelles couvertes par votrecourtier.ch sert de
 * démonstration ; l'architecture est prête à être étendue à l'ensemble des
 * communes desservies sans dupliquer le contenu à la main.
 */

export type Locality = {
  slug: string;
  city: string;
  canton: "VD" | "FR";
  office: "lausanne" | "fribourg";
  intro: string;
  context: string;
};

export const localities: Locality[] = [
  {
    slug: "lausanne",
    city: "Lausanne",
    canton: "VD",
    office: "lausanne",
    intro:
      "Notre antenne de Crissier accompagne les propriétaires et acquéreurs de l'agglomération lausannoise depuis 2006.",
    context:
      "Marché tendu, forte demande locative et rendements attractifs pour l'investissement locatif dans les quartiers proches du centre et des axes de transport.",
  },
  {
    slug: "fribourg",
    city: "Fribourg",
    canton: "FR",
    office: "fribourg",
    intro:
      "Basée à Marly, notre équipe fribourgeoise connaît les spécificités de chaque quartier de l'agglomération, de la vieille ville aux communes périphériques.",
    context:
      "Un marché plus accessible qu'à Lausanne, porté par la proximité de l'autoroute A12 et une offre de terrains constructibles encore présente.",
  },
  {
    slug: "marly",
    city: "Marly",
    canton: "FR",
    office: "fribourg",
    intro: "Marly est notre port d'attache fribourgeois : nous y connaissons chaque périmètre et chaque projet en cours.",
    context: "Commune résidentielle prisée des familles, à quelques minutes du centre-ville de Fribourg.",
  },
  {
    slug: "nyon",
    city: "Nyon",
    canton: "VD",
    office: "lausanne",
    intro: "La Côte attire une clientèle internationale exigeante ; nous y suivons plusieurs projets neufs.",
    context: "Bassin d'emploi international, forte pression foncière, marché de la résidence secondaire actif.",
  },
  {
    slug: "morat",
    city: "Morat",
    canton: "FR",
    office: "fribourg",
    intro: "Ville bilingue au bord du lac, un marché de niche que nous suivons avec attention.",
    context: "Cadre de vie recherché entre lac et campagne, offre limitée qui valorise une estimation précise.",
  },
  {
    slug: "lutry",
    city: "Lutry",
    canton: "VD",
    office: "lausanne",
    intro: "Entre vignoble et lac, Lutry concentre une clientèle en quête de biens d'exception.",
    context: "Commune viticole classée, biens avec vue lac particulièrement recherchés et rares.",
  },
];

export function getLocalityBySlug(slug: string) {
  return localities.find((l) => l.slug === slug);
}
