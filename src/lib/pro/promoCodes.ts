export const FREE_ACCESS_CODE = "REP2026";
export const PREMIUM_DISCOUNT_CODE = "LRT10";
export const PREMIUM_DISCOUNT_PERCENT = 10;

export function normalizePromoCode(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

export function isFreeAccessCode(value?: string | null) {
  return normalizePromoCode(value) === FREE_ACCESS_CODE;
}

export function isPremiumDiscountCode(value?: string | null) {
  return normalizePromoCode(value) === PREMIUM_DISCOUNT_CODE;
}

export function applyPremiumDiscountCents(amountCents: number) {
  return Math.round(amountCents * (100 - PREMIUM_DISCOUNT_PERCENT) / 100);
}
