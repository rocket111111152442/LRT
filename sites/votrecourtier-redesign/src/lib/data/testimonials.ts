/**
 * Témoignages reformulés à partir d'avis publics authentiques laissés par des
 * clients de votrecourtier.ch (annuaires professionnels). Les noms complets
 * n'ayant pas pu être vérifiés indépendamment dans cet environnement, les
 * auteurs sont identifiés par le type de transaction plutôt que par un nom
 * inventé. Voir docs/votrecourtier-audit.md §5.
 */

export type Testimonial = {
  quote: string;
  attribution: string;
  context: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Accompagnement compétent, efficace et sympathique du premier rendez-vous jusqu'à la signature chez le notaire. Nous étions pleinement satisfaits du suivi de M. Mirfassihi.",
    attribution: "Vente d'une maison",
    context: "Région lausannoise",
  },
  {
    quote:
      "Professionnalisme, réactivité et rapidité d'exécution : nous recommandons ses services sans réserve. Une personne de confiance sur qui s'appuyer pour un projet de cette importance.",
    attribution: "Vente d'un appartement",
    context: "Canton de Fribourg",
  },
  {
    quote:
      "En tant qu'investisseur, il faut pouvoir compter sur un courtier expérimenté et reconnu sur le marché. Les conseils reçus ont fait la différence sur la structuration du projet.",
    attribution: "Acquisition d'un bien de rendement",
    context: "Vaud",
  },
  {
    quote:
      "Le premier contact a suffi à nous rassurer : une écoute réelle de notre projet d'achat, sans pression, avec des explications claires à chaque étape.",
    attribution: "Achat d'un appartement",
    context: "Marly",
  },
];
