/**
 * Chronologie du défilement (progression 0 → 1), partagée par la scène 3D et
 * les calques HTML. Calée sur la vidéo de référence :
 *  - 0.00 → 0.05  : ouverture (vue plongeante dans le cylindre, titre)
 *  - 0.05 → 0.37  : descente dans le puits, trois phrases successives
 *  - 0.37 → 0.88  : neuf projets « décrochés du mur »
 *  - 0.88 → 1.00  : remontée, vue d'ensemble et appel à l'action
 */

export const FEATURED_COUNT = 9;

export const T = {
  heroEnd: 0.05,
  descentEnd: 0.345,
  projectsStart: 0.37,
  projectsEnd: 0.88,
  outroTextStart: 0.95,
} as const;

/** Fenêtres d'apparition des trois phrases pendant la descente. */
export const STATEMENT_WINDOWS: [number, number][] = [
  [0.075, 0.165],
  [0.185, 0.27],
  [0.29, 0.365],
];

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => clamp((v - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Opacité d'un bloc visible entre a et b, avec fondu d'entrée/sortie. */
export function windowOpacity(p: number, a: number, b: number, fade = 0.018) {
  if (p <= a - fade || p >= b + fade) return 0;
  if (p < a) return smooth(invLerp(a - fade, a, p));
  if (p > b) return 1 - smooth(invLerp(b, b + fade, p));
  return 1;
}

/** Position continue dans la liste des projets (0 → 8), avec paliers. */
export function projectFloat(p: number) {
  const span = (T.projectsEnd - T.projectsStart) / FEATURED_COUNT;
  const x = (p - T.projectsStart) / span;
  if (x <= 0) return 0;
  if (x >= FEATURED_COUNT - 1) return FEATURED_COUNT - 1;
  const i = Math.floor(x);
  const f = x - i;
  // Pause sur chaque projet, puis rotation vers le suivant sur la fin du palier.
  return i + smooth(invLerp(0.72, 1, f));
}

export function activeProjectIndex(p: number) {
  return Math.round(projectFloat(p));
}

/** Progression qui place le projet i au centre de son palier. */
export function progressForProject(i: number) {
  const span = (T.projectsEnd - T.projectsStart) / FEATURED_COUNT;
  return T.projectsStart + span * (i + 0.3);
}

export function phaseOf(p: number): "hero" | "descent" | "projects" | "outro" {
  if (p < T.heroEnd) return "hero";
  if (p < T.projectsStart) return "descent";
  if (p < T.projectsEnd) return "projects";
  return "outro";
}
