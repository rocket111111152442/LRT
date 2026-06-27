// Tarification de l'offre entreprise « sur mesure ».
//
// Ce module est partagé entre le questionnaire (affichage en direct) et le
// serveur (calcul du prix réellement facturé via Stripe). Garder une seule
// source de vérité évite que le prix affiché et le prix facturé divergent, et
// empêche de faire confiance à un montant envoyé par le navigateur.

export type Billing = "monthly" | "annual";

export type EnterpriseSelection = {
  shops: number;
  seats: number;
  storageGb: number;
  volume: string;
  billing: Billing;
  monthlyOptions: string[];
  oneTimeOptions: string[];
};

export const MONTHLY_OPTIONS: { id: string; label: string; price: number; help: string }[] = [
  { id: "priority_support", label: "Support prioritaire 24/7", price: 39, help: "Réponse garantie en priorité, jour et nuit." },
  { id: "custom_branding", label: "Personnalisation (logo, couleurs)", price: 15, help: "Vos couleurs et logo sur l'espace client." },
  { id: "api_access", label: "Accès API / intégrations", price: 49, help: "Connectez Qoravo à vos autres outils." },
  { id: "advanced_backups", label: "Sauvegardes renforcées", price: 19, help: "Sauvegardes quotidiennes et restauration rapide." },
  { id: "sla", label: "SLA garanti", price: 59, help: "Engagement contractuel de disponibilité." },
  { id: "roles", label: "Multi-utilisateurs avancé (rôles)", price: 25, help: "Comptes employés avec permissions fines." },
  { id: "advanced_stats", label: "Statistiques avancées", price: 19, help: "Tableaux de bord et exports détaillés." },
  { id: "advanced_payments", label: "Paiements en ligne avancés", price: 15, help: "Acomptes, échéanciers, relances automatiques." },
];

export const ONE_TIME_OPTIONS: { id: string; label: string; price: number }[] = [
  { id: "data_migration", label: "Migration de vos données existantes", price: 199 },
  { id: "training", label: "Formation initiale de votre équipe", price: 149 },
  { id: "onboarding", label: "Accompagnement personnalisé au démarrage", price: 99 },
];

export const VOLUME_TIERS: { id: string; label: string; price: number }[] = [
  { id: "v0", label: "Moins de 50 réparations / mois", price: 0 },
  { id: "v1", label: "50 à 150 / mois", price: 29 },
  { id: "v2", label: "150 à 400 / mois", price: 59 },
  { id: "v3", label: "400 à 1000 / mois", price: 99 },
  { id: "v4", label: "Plus de 1000 / mois", price: 179 },
];

const BASE_PRICE = 29;
const PER_EXTRA_SHOP = 19;
const PER_EXTRA_SEAT = 9;
const PER_STORAGE_BLOCK = 5; // par tranche de 10 Go au-delà des 10 Go inclus
const ANNUAL_DISCOUNT = 0.15;

export type QuoteLine = { label: string; amount: number };

export type EnterpriseQuote = {
  lines: QuoteLine[];
  monthlyBeforeDiscount: number;
  annualDiscount: number;
  monthlyAfter: number;
  annualTotal: number;
  oneTimeLines: QuoteLine[];
  oneTimeTotal: number;
  // Montant récurrent réellement facturé sur une période (mois ou an).
  recurringAmount: number;
  recurringInterval: "month" | "year";
};

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function normalizeSelection(input: Partial<EnterpriseSelection>): EnterpriseSelection {
  const monthlyIds = new Set(MONTHLY_OPTIONS.map((o) => o.id));
  const oneTimeIds = new Set(ONE_TIME_OPTIONS.map((o) => o.id));
  return {
    shops: clampInt(input.shops, 1, 50, 1),
    seats: clampInt(input.seats, 1, 200, 2),
    storageGb: clampInt(input.storageGb, 10, 1000, 10),
    volume: VOLUME_TIERS.some((t) => t.id === input.volume) ? String(input.volume) : "v0",
    billing: input.billing === "monthly" ? "monthly" : "annual",
    monthlyOptions: Array.isArray(input.monthlyOptions)
      ? input.monthlyOptions.filter((id) => monthlyIds.has(id))
      : [],
    oneTimeOptions: Array.isArray(input.oneTimeOptions)
      ? input.oneTimeOptions.filter((id) => oneTimeIds.has(id))
      : [],
  };
}

export function computeEnterpriseQuote(input: Partial<EnterpriseSelection>): EnterpriseQuote {
  const sel = normalizeSelection(input);
  const lines: QuoteLine[] = [{ label: "Plateforme Qoravo (base)", amount: BASE_PRICE }];

  const extraShops = Math.max(0, sel.shops - 1);
  if (extraShops > 0) lines.push({ label: `Boutiques supplémentaires (${extraShops} × ${PER_EXTRA_SHOP} €)`, amount: extraShops * PER_EXTRA_SHOP });

  const extraSeats = Math.max(0, sel.seats - 2);
  if (extraSeats > 0) lines.push({ label: `Postes employés en plus (${extraSeats} × ${PER_EXTRA_SEAT} €)`, amount: extraSeats * PER_EXTRA_SEAT });

  const extraStorage = Math.max(0, Math.ceil((sel.storageGb - 10) / 10));
  if (extraStorage > 0) lines.push({ label: `Stockage +${extraStorage * 10} Go (${extraStorage} × ${PER_STORAGE_BLOCK} €)`, amount: extraStorage * PER_STORAGE_BLOCK });

  const tier = VOLUME_TIERS.find((t) => t.id === sel.volume);
  if (tier && tier.price > 0) lines.push({ label: `Volume : ${tier.label}`, amount: tier.price });

  for (const opt of MONTHLY_OPTIONS) {
    if (sel.monthlyOptions.includes(opt.id)) lines.push({ label: opt.label, amount: opt.price });
  }

  const monthlyBeforeDiscount = lines.reduce((sum, l) => sum + l.amount, 0);
  const annualDiscount = sel.billing === "annual" ? monthlyBeforeDiscount * ANNUAL_DISCOUNT : 0;
  const monthlyAfter = monthlyBeforeDiscount - annualDiscount;
  const annualTotal = monthlyAfter * 12;

  const oneTimeLines = ONE_TIME_OPTIONS.filter((o) => sel.oneTimeOptions.includes(o.id)).map((o) => ({
    label: o.label,
    amount: o.price,
  }));
  const oneTimeTotal = oneTimeLines.reduce((sum, l) => sum + l.amount, 0);

  return {
    lines,
    monthlyBeforeDiscount,
    annualDiscount,
    monthlyAfter,
    annualTotal,
    oneTimeLines,
    oneTimeTotal,
    recurringAmount: sel.billing === "annual" ? annualTotal : monthlyAfter,
    recurringInterval: sel.billing === "annual" ? "year" : "month",
  };
}

export function summarizeSelection(sel: EnterpriseSelection): string {
  const tier = VOLUME_TIERS.find((t) => t.id === sel.volume);
  const monthly = MONTHLY_OPTIONS.filter((o) => sel.monthlyOptions.includes(o.id)).map((o) => o.label);
  const oneTime = ONE_TIME_OPTIONS.filter((o) => sel.oneTimeOptions.includes(o.id)).map((o) => o.label);
  return [
    `Boutiques : ${sel.shops}`,
    `Postes employés : ${sel.seats}`,
    `Stockage : ${sel.storageGb} Go`,
    `Volume : ${tier?.label ?? sel.volume}`,
    `Facturation : ${sel.billing === "annual" ? "Annuelle (-15%)" : "Mensuelle"}`,
    `Options : ${monthly.length ? monthly.join(", ") : "aucune"}`,
    `Services ponctuels : ${oneTime.length ? oneTime.join(", ") : "aucun"}`,
  ].join("\n");
}
