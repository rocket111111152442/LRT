import type { Testimonial } from "./types";

/**
 * Extraits représentatifs — PAS des citations verbatim. Les recherches
 * publiques confirment l’existence de nombreux avis positifs évoquant le
 * professionnalisme, l’écoute et la proactivité de l’équipe (voir
 * docs/courvoisier-audit.md §5), mais aucun texte exact ni nom de client
 * n’a pu être vérifié dans cet environnement. `isDemoContent` documente
 * cette réserve pour la maintenance du projet ; à remplacer par les avis
 * vérifiés fournis par l’agence avant toute mise en production — voir
 * docs/courvoisier-audit.md.
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "Un accompagnement à l’écoute, du premier échange jusqu’à la signature — sans jamais nous brusquer.",
    attribution: "Vendeurs accompagnés dans la région de Rolle",
    context: "Vente d’une maison familiale",
    isDemoContent: true,
  },
  {
    quote:
      "Des conseils sincères, y compris quand ils allaient à l’encontre de nos premières idées.",
    attribution: "Acheteurs accompagnés dans la région lausannoise",
    context: "Achat d’un premier appartement",
    isDemoContent: true,
  },
  {
    quote: "Tout s’est déroulé vite, et surtout, très proprement.",
    attribution: "Vente puis achat accompagnés par l’agence",
    context: "Transaction croisée vente / achat",
    isDemoContent: true,
  },
];
