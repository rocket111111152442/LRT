import type { SceneVariant } from "@/components/illustrations/ArchitecturalScene";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  category: string;
  scene: SceneVariant;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "choisir-une-agence-immobiliere-en-suisse",
    title: "Comment choisir une agence immobilière en Suisse romande",
    excerpt:
      "Mandat exclusif ou ouvert, forfait ou commission, courtier généraliste ou spécialisé : les critères qui font vraiment la différence sur le résultat final.",
    date: "2026-06-12",
    readingTime: "6 min",
    category: "Vendre",
    scene: "bureau",
    content: [
      "Le choix d'une agence se joue rarement sur la brochure. Trois éléments comptent davantage que la taille du réseau : la connaissance fine du marché local, la disponibilité réelle de l'interlocuteur et la rigueur de l'estimation de départ.",
      "Un bien surestimé de 10% ne se vend pas 10% plus cher : il reste plus longtemps sur le marché, perd en attractivité et se négocie finalement plus bas qu'un bien juste évalué dès le départ. C'est pourquoi nous refusons les estimations gonflées pour décrocher un mandat.",
      "La question du mandat exclusif revient souvent. Un mandat exclusif bien mené — avec un plan de diffusion clair et des points d'étape réguliers — donne généralement de meilleurs résultats qu'une diffusion éclatée sur plusieurs agences, qui dilue la visibilité du bien et peut inquiéter les acheteurs sérieux.",
      "Enfin, vérifiez les qualifications du courtier : brevet fédéral, affiliation USPI, expérience démontrée sur des transactions comparables à la vôtre. Ce ne sont pas des détails administratifs, mais des garanties sur la qualité du conseil que vous recevrez.",
    ],
  },
  {
    slug: "cecb-obligatoire-vendre-bien-immobilier",
    title: "Le CECB est-il obligatoire pour vendre dans le canton de Vaud ou Fribourg ?",
    excerpt:
      "Certificat énergétique cantonal des bâtiments : ce qu'il faut savoir avant de mettre un bien sur le marché à Vaud comme à Fribourg.",
    date: "2026-04-03",
    readingTime: "4 min",
    category: "Réglementation",
    scene: "villa",
    content: [
      "Le Certificat énergétique cantonal des bâtiments (CECB) évalue la performance énergétique d'un bien sur une échelle de A à G, à la manière d'une étiquette électroménager.",
      "Dans le canton de Vaud, le CECB est obligatoire pour toute vente de bâtiment de plus de 10 ans. Le canton de Fribourg applique des règles proches, avec des nuances selon l'affectation du bâtiment — nous vous orientons au cas par cas dès le premier échange.",
      "Au-delà de l'obligation légale, un CECB à jour rassure l'acheteur et permet d'anticiper les objections sur les charges futures, notamment pour les bâtiments construits avant les normes actuelles d'isolation.",
      "Nous intégrons systématiquement cette vérification dans notre analyse de mise en vente, avant même la diffusion de l'annonce.",
    ],
  },
  {
    slug: "prix-immobilier-cadre-vie-corminboeuf",
    title: "Corminboeuf : cadre de vie et prix au m²",
    excerpt:
      "À dix minutes de Fribourg, Corminboeuf reste l'une des communes les plus recherchées pour un projet familial. Repères de prix et disponibilité foncière.",
    date: "2026-02-18",
    readingTime: "5 min",
    category: "Marché local",
    scene: "terrain",
    content: [
      "Commune résidentielle à la lisière de l'agglomération fribourgeoise, Corminboeuf combine un cadre de vie calme, de bonnes connexions vers Fribourg et Payerne, et une offre scolaire complète — trois critères qui expliquent la stabilité de la demande sur ce secteur.",
      "Le foncier constructible s'y raréfie : les nouvelles parcelles disponibles se négocient rapidement, en particulier lorsqu'elles bénéficient d'une orientation sud ou d'un dégagement sur la campagne environnante.",
      "Pour un propriétaire qui envisage de vendre, la fenêtre actuelle reste favorable pour les biens bien entretenus et correctement positionnés dès la mise en vente — c'est précisément l'objet de notre estimation gratuite.",
    ],
  },
];

export function getPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
