import type { Article } from "./types";

/**
 * Articles de démonstration du gabarit éditorial — contenu générique écrit
 * pour ce concept, pas des publications réelles de Courvoisier. Voir
 * docs/courvoisier-audit.md §6.
 */
export const articles: Article[] = [
  {
    slug: "quand-vendre-sur-la-cote",
    title: "Quand vendre son bien sur La Côte : lire le marché avant d’agir",
    excerpt:
      "Saisonnalité, taux hypothécaires, rareté des biens avec vue : les repères pour choisir le bon moment sans céder à la précipitation.",
    category: "Vendre",
    publishedAt: "2026-06-12",
    readingTime: 6,
    content: [
      "Il n’existe pas de « meilleur mois » universel pour vendre un bien sur l’arc lémanique. En revanche, quelques repères reviennent régulièrement dans les échanges que nos courtiers ont avec les vendeurs.",
      "Le premier est la rareté. Sur des communes comme Rolle ou Lonay, les biens avec vue dégagée ou accès direct au lac se raréfient plus vite qu’ils ne se remplacent : un bien de ce type peut se vendre dans de bonnes conditions presque indépendamment de la saison.",
      "Le second est le contexte de financement. Les conditions hypothécaires influencent directement le nombre d’acheteurs solvables sur le marché à un instant T — un point qu’il vaut mieux évoquer avec un courtier avant de fixer un prix plutôt qu’après.",
      "Enfin, le calendrier personnel compte autant que le calendrier du marché. Une vente précipitée pour respecter un délai artificiel se négocie rarement dans de bonnes conditions. La meilleure période reste celle où le bien est prêt, correctement positionné, et où le vendeur a le temps de mener une négociation sereine.",
    ],
    isDemoContent: true,
  },
  {
    slug: "estimation-en-ligne-ou-sur-place",
    title: "Estimation en ligne, en visio ou sur place : que choisir ?",
    excerpt:
      "Les trois formats répondent à des besoins différents — premier repère, décision rapide ou expertise fine. Comment s’y retrouver.",
    category: "Estimer",
    publishedAt: "2026-04-03",
    readingTime: 4,
    content: [
      "L’estimation en ligne convient pour une première idée, en quelques minutes : elle s’appuie sur les données du marché local et sur les caractéristiques générales du bien (localité, surface, année de construction).",
      "L’estimation en visio va plus loin sans nécessiter de déplacement : elle permet à un courtier d’observer les caractéristiques spécifiques du bien (agencement, luminosité, état des finitions) et d’affiner la fourchette de prix en direct.",
      "L’estimation en vrai reste la plus précise. Un courtier se déplace, évalue le bien dans son ensemble — y compris ce qu’une visioconférence ne montre pas toujours bien, comme l’état réel de la toiture ou l’isolation — et prépare une base solide pour une mise en vente.",
      "Notre recommandation est simple : utilisez l’estimation en ligne pour vous situer, la visio si vous voulez une réponse rapide et fiable, et l’estimation en vrai dès que vous envisagez sérieusement une mise en vente.",
    ],
    isDemoContent: true,
  },
  {
    slug: "immeuble-de-rendement-points-de-vigilance",
    title: "Acquérir un immeuble de rendement : les points de vigilance",
    excerpt:
      "État locatif, charges, potentiel de rénovation énergétique : ce qui distingue un bon dossier d’un mauvais calcul.",
    category: "Investir",
    publishedAt: "2026-02-18",
    readingTime: 7,
    content: [
      "Un immeuble de rendement s’évalue rarement sur le seul rendement affiché. L’état locatif — durée des baux en cours, niveau des loyers par rapport au marché, taux de vacance historique — donne une image bien plus fiable du potentiel réel.",
      "Les charges méritent une attention particulière : entretien courant, provisions pour travaux, et surtout l’état des équipements communs (chauffage, toiture, façades), qui peuvent représenter des investissements significatifs dans les années suivant l’achat.",
      "Le potentiel de rénovation énergétique est devenu un critère à part entière. Un immeuble mal isolé n’est pas nécessairement un mauvais achat, mais son prix doit intégrer le coût et le calendrier des travaux à prévoir.",
      "Notre équipe accompagne les investisseurs dans la lecture de ces éléments avant l’offre d’achat, pour que la décision repose sur des chiffres vérifiés plutôt que sur le seul rendement affiché à l’annonce.",
    ],
    isDemoContent: true,
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
