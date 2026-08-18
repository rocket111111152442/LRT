export type OrderStatusKey =
  | "PENDING"
  | "PAID"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED"
  | "REFUNDED";

export const ORDER_STATUS: Record<
  OrderStatusKey,
  { label: string; description: string; step: number }
> = {
  PENDING: {
    label: "En attente de paiement",
    description: "Le paiement n'a pas encore été confirmé.",
    step: 0,
  },
  PAID: {
    label: "Paiement confirmé",
    description: "Nous avons reçu votre règlement, la fabrication va démarrer.",
    step: 1,
  },
  IN_PRODUCTION: {
    label: "En fabrication",
    description: "Votre pièce est en cours de confection à l'atelier.",
    step: 2,
  },
  SHIPPED: {
    label: "Expédiée",
    description: "Le colis est parti. Le suivi est disponible ci-dessous.",
    step: 3,
  },
  DELIVERED: {
    label: "Livrée",
    description: "Colis remis. Vous pouvez maintenant laisser un avis.",
    step: 4,
  },
  CANCELED: {
    label: "Annulée",
    description: "Cette commande a été annulée.",
    step: 0,
  },
  REFUNDED: {
    label: "Remboursée",
    description: "Le remboursement a été émis sur votre moyen de paiement.",
    step: 0,
  },
};

/** Étapes affichées dans le suivi de commande. */
export const ORDER_STEPS = [
  "Paiement",
  "Fabrication",
  "Expédition",
  "Livraison",
] as const;
