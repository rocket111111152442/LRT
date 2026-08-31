export const siteConfig = {
  name: "Ného Concept",
  shortName: "Ného",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://neho-redesign-demo.vercel.app",
  description:
    "Concept de refonte non officiel d'une agence immobilière suisse au forfait fixe — présentation privée, sans affiliation avec Neho SA.",
  legalDisclaimer:
    "Concept de refonte non officiel réalisé à titre de démonstration privée. Aucune affiliation avec Neho SA n'est ni revendiquée ni sous-entendue.",
  twitterHandle: "@neho_concept_demo",
  defaultOgImage: "/og-default.svg",
} as const;

/** Cantons couverts par le réseau de démonstration (voir docs/neho-audit.md §5). */
export const coveredCantons = [
  { slug: "geneve", name: "Genève" },
  { slug: "vaud", name: "Vaud" },
  { slug: "fribourg", name: "Fribourg" },
  { slug: "valais", name: "Valais" },
  { slug: "neuchatel", name: "Neuchâtel" },
  { slug: "jura", name: "Jura" },
] as const;

export type CantonSlug = (typeof coveredCantons)[number]["slug"];
