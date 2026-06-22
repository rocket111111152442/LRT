// Forfaits et options de volume pour les boutiques qui consomment beaucoup.
//
// Objectif : transformer les limites en opportunités de vente. Au lieu de juste
// dire « limite atteinte », Qoravo propose l'option la plus logique selon
// l'usage réel (stockage, volume de réparations, multi-boutiques).

export const GB = 1024 * 1024 * 1024;
const MB = 1024 * 1024;

export type PlanLimits = {
  storageBytes: number;
  repairLimitPerMonth: number;
  prioritySupport: boolean;
  multiShop: boolean;
  customLimits: boolean;
};

// Forfait de base inclus dans l'abonnement.
export const BASE_PLAN: PlanLimits = {
  storageBytes: 5 * GB,
  repairLimitPerMonth: 300,
  prioritySupport: false,
  multiShop: false,
  customLimits: false,
};

export type PlanOptionId =
  | "extra_storage_10gb"
  | "extra_storage_25gb"
  | "active_shop_pack"
  | "big_workshop_pack"
  | "multi_shop_pack"
  | "enterprise";

export type PlanOptionKind = "addon" | "pack" | "custom";

export type PlanOption = {
  id: PlanOptionId;
  name: string;
  tagline: string;
  features: string[];
  priceMonthly: number | null; // en euros, null = sur devis
  priceYearly: number | null;
  kind: PlanOptionKind;
  // Add-on : ajoute du stockage au forfait courant.
  addStorageBytes?: number;
  // Pack : fixe des limites absolues.
  storageBytes?: number;
  repairLimitPerMonth?: number;
  prioritySupport?: boolean;
  multiShop?: boolean;
  customLimits?: boolean;
};

export const PLAN_OPTIONS: PlanOption[] = [
  {
    id: "extra_storage_10gb",
    name: "Option Stockage Plus",
    tagline: "Pour les petites boutiques qui ajoutent beaucoup de photos.",
    features: ["+10 Go de stockage supplémentaire"],
    priceMonthly: 4.99,
    priceYearly: 19.99,
    kind: "addon",
    addStorageBytes: 10 * GB,
  },
  {
    id: "extra_storage_25gb",
    name: "Option Stockage Pro",
    tagline: "Pour les boutiques actives.",
    features: ["+25 Go de stockage supplémentaire"],
    priceMonthly: 9.99,
    priceYearly: 39.99,
    kind: "addon",
    addStorageBytes: 25 * GB,
  },
  {
    id: "active_shop_pack",
    name: "Pack Boutique Active",
    tagline: "Pour les boutiques qui utilisent Qoravo tous les jours.",
    features: [
      "50 Go de stockage total",
      "Jusqu'à 1 000 réparations / mois",
    ],
    priceMonthly: 14.99,
    priceYearly: 49.99,
    kind: "pack",
    storageBytes: 50 * GB,
    repairLimitPerMonth: 1000,
  },
  {
    id: "big_workshop_pack",
    name: "Pack Gros Atelier",
    tagline: "Pour les magasins avec plusieurs techniciens.",
    features: [
      "100 Go de stockage total",
      "Jusqu'à 3 000 réparations / mois",
      "Plus de photos par réparation",
      "Priorité sur les demandes de support",
    ],
    priceMonthly: 29.99,
    priceYearly: 149.99,
    kind: "pack",
    storageBytes: 100 * GB,
    repairLimitPerMonth: 3000,
    prioritySupport: true,
  },
  {
    id: "multi_shop_pack",
    name: "Pack Multi-Boutiques",
    tagline: "Pour les enseignes avec plusieurs points de vente.",
    features: [
      "Gestion de plusieurs boutiques",
      "250 Go de stockage total",
      "Jusqu'à 10 000 réparations / mois",
      "Tableau de bord global et statistiques par boutique",
    ],
    priceMonthly: 49.99,
    priceYearly: 299.99,
    kind: "pack",
    storageBytes: 250 * GB,
    repairLimitPerMonth: 10000,
    prioritySupport: true,
    multiShop: true,
  },
  {
    id: "enterprise",
    name: "Offre Entreprise / Sur mesure",
    tagline: "Pour les très gros clients.",
    features: [
      "Stockage personnalisé",
      "Volume de réparations personnalisé",
      "Accompagnement et support renforcés",
      "Configuration spéciale",
    ],
    priceMonthly: null,
    priceYearly: null,
    kind: "custom",
    customLimits: true,
  },
];

export function getPlanOption(id: string): PlanOption | undefined {
  return PLAN_OPTIONS.find((option) => option.id === id);
}

export type AccountPlanInput = {
  plan?: string | null;
  storageAddonGb?: number | null;
};

/**
 * Limites effectives d'un compte = forfait de base, éventuellement remplacé par
 * un pack, puis augmenté par les add-ons de stockage achetés.
 */
export function resolveAccountLimits(account: AccountPlanInput): PlanLimits {
  const limits: PlanLimits = { ...BASE_PLAN };
  const pack = account.plan ? getPlanOption(account.plan) : undefined;

  if (pack && pack.kind === "pack") {
    if (typeof pack.storageBytes === "number") {
      limits.storageBytes = pack.storageBytes;
    }
    if (typeof pack.repairLimitPerMonth === "number") {
      limits.repairLimitPerMonth = pack.repairLimitPerMonth;
    }
    limits.prioritySupport = pack.prioritySupport ?? limits.prioritySupport;
    limits.multiShop = pack.multiShop ?? limits.multiShop;
  }

  if (pack && pack.kind === "custom") {
    limits.customLimits = true;
    limits.prioritySupport = true;
  }

  const addonGb = Math.max(0, account.storageAddonGb ?? 0);
  limits.storageBytes += addonGb * GB;

  return limits;
}

export type UsageEvaluation = {
  storageUsedBytes: number;
  storageLimitBytes: number;
  storagePercent: number;
  storageState: "ok" | "warning" | "full";
  repairsThisMonth: number;
  repairLimitPerMonth: number;
  repairsOverLimit: boolean;
  blockUploads: boolean;
  messages: string[];
  recommendedOptionId: PlanOptionId | null;
};

const STORAGE_WARNING_RATIO = 0.8;

export function evaluateUsage(input: {
  limits: PlanLimits;
  storageUsedBytes: number;
  repairsThisMonth: number;
}): UsageEvaluation {
  const { limits } = input;
  const storageUsedBytes = Math.max(0, input.storageUsedBytes);
  const repairsThisMonth = Math.max(0, input.repairsThisMonth);
  const storageLimitBytes = limits.storageBytes;
  const storagePercent =
    storageLimitBytes > 0
      ? Math.min(100, Math.round((storageUsedBytes / storageLimitBytes) * 100))
      : 0;

  const storageFull = storageUsedBytes >= storageLimitBytes;
  const storageWarning =
    !storageFull && storageUsedBytes >= storageLimitBytes * STORAGE_WARNING_RATIO;
  const repairsOverLimit = repairsThisMonth >= limits.repairLimitPerMonth;

  const messages: string[] = [];

  if (storageFull) {
    messages.push(
      "Votre stockage est plein. Ajoutez du stockage ou passez à une offre supérieure pour continuer.",
    );
  } else if (storageWarning) {
    messages.push(
      "Vous approchez de votre limite de stockage. Vous pouvez ajouter du stockage supplémentaire pour continuer sans interruption.",
    );
  }

  if (repairsOverLimit) {
    messages.push(
      "Votre boutique utilise beaucoup Qoravo. Le Pack Boutique Active ou le Pack Gros Atelier est plus adapté à votre volume.",
    );
  }

  return {
    storageUsedBytes,
    storageLimitBytes,
    storagePercent,
    storageState: storageFull ? "full" : storageWarning ? "warning" : "ok",
    repairsThisMonth,
    repairLimitPerMonth: limits.repairLimitPerMonth,
    repairsOverLimit,
    blockUploads: storageFull,
    messages,
    recommendedOptionId: recommendOption({
      limits,
      storageUsedBytes,
      storageLimitBytes,
      repairsThisMonth,
      storageHigh: storageFull || storageWarning,
      repairsOverLimit,
    }),
  };
}

/**
 * Recommandation automatique de l'option la plus logique selon l'usage réel.
 */
function recommendOption(input: {
  limits: PlanLimits;
  storageUsedBytes: number;
  storageLimitBytes: number;
  repairsThisMonth: number;
  storageHigh: boolean;
  repairsOverLimit: boolean;
}): PlanOptionId | null {
  const { storageHigh, repairsOverLimit, repairsThisMonth } = input;

  // Usage très élevé : au-delà du plus gros pack standard → sur devis.
  if (repairsThisMonth > 3000 || input.limits.multiShop) {
    if (repairsThisMonth > 10000) {
      return "enterprise";
    }
    if (input.limits.multiShop) {
      return repairsThisMonth > 3000 ? "enterprise" : null;
    }
  }

  // Beaucoup de réparations + beaucoup de stockage → Gros Atelier.
  if (repairsOverLimit && storageHigh) {
    return repairsThisMonth > 3000 ? "enterprise" : "big_workshop_pack";
  }

  // Beaucoup de réparations, stockage normal → Boutique Active.
  if (repairsOverLimit) {
    return repairsThisMonth > 1000 ? "big_workshop_pack" : "active_shop_pack";
  }

  // Stockage plein/haut, réparations normales → ajout de stockage.
  if (storageHigh) {
    const ratio =
      input.storageLimitBytes > 0
        ? input.storageUsedBytes / input.storageLimitBytes
        : 0;
    return ratio >= 1 ? "extra_storage_25gb" : "extra_storage_10gb";
  }

  return null;
}

export function formatStorage(bytes: number): string {
  if (bytes >= GB) {
    return `${(bytes / GB).toFixed(bytes % GB === 0 ? 0 : 1)} Go`;
  }
  return `${Math.round(bytes / MB)} Mo`;
}

export function formatOptionPrice(option: PlanOption): string {
  if (option.priceMonthly === null || option.priceYearly === null) {
    return "Sur devis";
  }

  const monthly = option.priceMonthly.toFixed(2).replace(".", ",");
  const yearly = option.priceYearly.toFixed(2).replace(".", ",");
  return `+${monthly} €/mois ou +${yearly} €/an`;
}
