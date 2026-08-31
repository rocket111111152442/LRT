/**
 * Calcul indicatif du calculateur d'économies de la page d'accueil.
 * Extrait dans un module pur (sans React) pour rester testable
 * indépendamment de l'UI — voir tests/calculators.test.ts.
 */
export function computeTraditionalFee(price: number, commissionPercent: number): number {
  return Math.round((price * commissionPercent) / 100);
}

export function computeSavings(traditionalFee: number, nehoFee: number): number {
  return Math.max(traditionalFee - nehoFee, 0);
}
