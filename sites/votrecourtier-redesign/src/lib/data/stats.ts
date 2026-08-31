/**
 * Chiffres d'entreprise — uniquement ceux confirmés par l'audit
 * (docs/votrecourtier-audit.md §5). Aucune statistique inventée.
 */
export const companyStats = [
  { value: 2006, suffix: "", label: "Présence en Suisse romande", isYear: true },
  { value: 750, suffix: "+", label: "Biens vendus", isYear: false },
  { value: 2, suffix: "", label: "Cantons couverts — Vaud & Fribourg", isYear: false },
  { value: 2, suffix: "", label: "Antennes locales", isYear: false },
] as const;
