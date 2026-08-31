import type { CantonSlug } from "@/config/site";

/**
 * Coordonnées (dans un viewBox 320×300) utilisées par la carte stylisée de
 * la Suisse romande — géométrie volontairement abstraite, voir
 * components/illustrations/SwissRegionsMap.tsx.
 */
export const cantonMapPositions: Record<CantonSlug, { x: number; y: number }> = {
  geneve: { x: 62, y: 210 },
  vaud: { x: 130, y: 170 },
  neuchatel: { x: 150, y: 108 },
  fribourg: { x: 210, y: 150 },
  jura: { x: 120, y: 55 },
  valais: { x: 230, y: 235 },
};
