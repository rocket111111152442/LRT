export type GradeLike = {
  value: number;
  maxValue: number;
  coefficient: number;
};

/** Moyenne pondérée par coefficient, ramenée sur 20. Retourne null si aucune note. */
export function computeAverage(grades: GradeLike[]): number | null {
  if (grades.length === 0) return null;

  let weightedSum = 0;
  let totalCoefficient = 0;

  for (const grade of grades) {
    if (grade.maxValue <= 0) continue;
    const scaledOn20 = (grade.value / grade.maxValue) * 20;
    weightedSum += scaledOn20 * grade.coefficient;
    totalCoefficient += grade.coefficient;
  }

  if (totalCoefficient === 0) return null;
  return weightedSum / totalCoefficient;
}
