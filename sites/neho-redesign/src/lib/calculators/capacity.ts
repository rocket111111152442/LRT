/**
 * Calcul simplifié à but pédagogique, basé sur deux règles usuelles du
 * marché suisse : charges théoriques ≤ 33% du revenu, fonds propres ≥ 20%
 * de la valeur du bien. Voir le disclaimer affiché sous le résultat côté
 * UI (src/components/home/BuyCapacityCalculator.tsx) — volontairement
 * simplifié, ne remplace pas l'analyse d'un conseiller en financement.
 */
export function computeBuyingCapacity(income: number, downPayment: number, theoreticalRatePercent: number): number {
  const maxAnnualHousingCost = income * 0.33;
  const rate = theoreticalRatePercent / 100;
  const maxFinancedByIncome = rate > 0 ? maxAnnualHousingCost / rate : 0;
  const maxPriceByIncome = maxFinancedByIncome + downPayment;
  const maxPriceByEquity = downPayment / 0.2;
  return Math.max(0, Math.min(maxPriceByIncome, maxPriceByEquity));
}
