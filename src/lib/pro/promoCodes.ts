export const PREMIUM_DISCOUNT_CODE = "QORAVO10";
const PREMIUM_DISCOUNT_ALIASES = new Set(["QORAVO10", "QOR10", "LRT10"]);
export const PREMIUM_DISCOUNT_PERCENT = 10;

export function normalizePromoCode(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

export function isFreeAccessCode(value?: string | null) {
  const configuredCode = normalizePromoCode(process.env.FREE_ACCESS_CODE);

  return Boolean(
    configuredCode && normalizePromoCode(value) === configuredCode,
  );
}

export function isPremiumDiscountCode(value?: string | null) {
  return PREMIUM_DISCOUNT_ALIASES.has(normalizePromoCode(value));
}

export function applyPremiumDiscountCents(amountCents: number) {
  return Math.round(amountCents * (100 - PREMIUM_DISCOUNT_PERCENT) / 100);
}
