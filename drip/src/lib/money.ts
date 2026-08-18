// Tous les montants circulent en centimes dans l'application. On ne convertit
// en euros qu'au moment de l'affichage.

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPrice(cents: number) {
  return formatter.format(cents / 100);
}

/** Affiche « 39 € » quand le prix est rond, « 39,90 € » sinon. */
export function formatPriceSmart(cents: number) {
  return cents % 100 === 0 ? compactFormatter.format(cents / 100) : formatPrice(cents);
}

export function toStripeAmount(cents: number) {
  return Math.round(cents);
}

/**
 * Convertit un prix décimal (« 24.50 ») en centimes.
 *
 * Printify renvoie déjà des entiers en centimes ; ce convertisseur sert aux
 * saisies manuelles de l'administration et à tout fournisseur qui exprimerait
 * ses prix en unités décimales.
 */
export function parseDecimalToCents(value: string | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}
