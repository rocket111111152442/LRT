import type { Testimonial } from "./types";

/**
 * Témoignages fictifs de démonstration — voir DemoBadge sur les pages qui
 * les affichent. À remplacer par de vrais avis vérifiés (ex. import depuis
 * Trustpilot ou un CRM) avant toute mise en production.
 */
export const testimonials: Testimonial[] = [
  {
    slug: "m-durand-nyon",
    authorName: "M. Durand",
    role: "Vendeur",
    commune: "nyon",
    canton: "vaud",
    rating: 5,
    quote:
      "Le forfait fixe a fait toute la différence : nous savions exactement combien nous allions garder après la vente. L'agent a été présent à chaque étape.",
    verified: true,
    date: "2026-06-12",
  },
  {
    slug: "famille-rossier-fribourg",
    authorName: "Famille Rossier",
    role: "Acheteur",
    commune: "fribourg-ville",
    canton: "fribourg",
    rating: 5,
    quote:
      "La visite virtuelle nous a permis de présélectionner les biens avant de nous déplacer. Un vrai gain de temps avec deux enfants en bas âge.",
    verified: true,
    date: "2026-05-03",
  },
  {
    slug: "mme-baechler-geneve",
    authorName: "Mme Baechler",
    role: "Vendeur",
    commune: "geneve-ville",
    canton: "geneve",
    rating: 4,
    quote:
      "Process clair du début à la fin. Seul bémol : les délais de visite ont été un peu plus longs que prévu, mais le résultat final était au rendez-vous.",
    verified: true,
    date: "2026-04-18",
  },
  {
    slug: "m-gay-sion",
    authorName: "M. Gay",
    role: "Vendeur",
    commune: "sion",
    canton: "valais",
    rating: 5,
    quote:
      "J'ai comparé avec deux agences traditionnelles avant de me décider. Le forfait fixe et la transparence des prestations ont fait la différence.",
    verified: true,
    date: "2026-07-02",
  },
  {
    slug: "mme-perret-neuchatel",
    authorName: "Mme Perret",
    role: "Acheteur",
    commune: "neuchatel-ville",
    canton: "neuchatel",
    rating: 5,
    quote:
      "L'agent connaissait le quartier dans le détail, jusqu'aux futurs projets d'urbanisme. C'est ce niveau de connaissance locale qui nous a convaincus.",
    verified: true,
    date: "2026-03-27",
  },
  {
    slug: "m-schaller-delemont",
    authorName: "M. Schaller",
    role: "Vendeur",
    commune: "delemont",
    canton: "jura",
    rating: 4,
    quote:
      "Bon accompagnement général. Nous aurions apprécié un peu plus de photos dans le rapport d'estimation initial, mais le suivi a été rassurant.",
    verified: true,
    date: "2026-02-14",
  },
  {
    slug: "mme-tornare-carouge",
    authorName: "Mme Tornare",
    role: "Vendeur",
    commune: "carouge",
    canton: "geneve",
    rating: 5,
    quote:
      "Le plan laser et la brochure de vente donnaient une image très professionnelle du bien. Nous avons reçu plusieurs offres en dix jours.",
    verified: true,
    date: "2026-08-02",
  },
  {
    slug: "m-currat-bulle",
    authorName: "M. Currat",
    role: "Acheteur",
    commune: "bulle",
    canton: "fribourg",
    rating: 5,
    quote:
      "L'alerte personnalisée nous a permis de voir le bien avant sa publication sur les autres portails. Nous avons pu nous positionner rapidement.",
    verified: true,
    date: "2026-07-21",
  },
];

export function getTestimonialsByCanton(canton: string): Testimonial[] {
  return testimonials.filter((t) => t.canton === canton);
}
