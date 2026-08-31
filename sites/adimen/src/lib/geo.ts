/**
 * Projection des coordonnées réelles vers l'espace des scènes 3D.
 *
 * Le rapport entre degrés de longitude et de latitude est corrigé : à 46° de
 * latitude, un degré de longitude vaut environ 77,5 km contre 111 km pour un
 * degré de latitude. Sans cette correction, l'arc lémanique apparaîtrait étiré.
 */

const LNG_CENTRE = 6.7;
const LAT_CENTRE = 46.35;
const ECHELLE_LNG = 9;
const ECHELLE_LAT = ECHELLE_LNG * (111 / 77.5);

export function versSceneX(lng: number): number {
  return (lng - LNG_CENTRE) * ECHELLE_LNG;
}

export function versSceneZ(lat: number): number {
  return -(lat - LAT_CENTRE) * ECHELLE_LAT;
}

export function versScene(lng: number, lat: number): [number, number] {
  return [versSceneX(lng), versSceneZ(lat)];
}

/**
 * Axe médian du Léman, de la rade de Genève à Villeneuve.
 * `demiLargeur` suit l'élargissement réel du lac en son milieu.
 */
export const axeLeman: readonly { lng: number; lat: number; demiLargeur: number }[] = [
  { lng: 6.15, lat: 46.21, demiLargeur: 0.16 },
  { lng: 6.19, lat: 46.28, demiLargeur: 0.26 },
  { lng: 6.24, lat: 46.38, demiLargeur: 0.36 },
  { lng: 6.33, lat: 46.44, demiLargeur: 0.46 },
  { lng: 6.44, lat: 46.47, demiLargeur: 0.56 },
  { lng: 6.56, lat: 46.47, demiLargeur: 0.62 },
  { lng: 6.68, lat: 46.45, demiLargeur: 0.6 },
  { lng: 6.79, lat: 46.42, demiLargeur: 0.5 },
  { lng: 6.88, lat: 46.4, demiLargeur: 0.38 },
  { lng: 6.93, lat: 46.39, demiLargeur: 0.24 },
];

/** Distance d'un point du plan à l'axe du lac, rapportée à la demi-largeur locale. */
export function proximiteLac(x: number, z: number): number {
  let meilleur = Number.POSITIVE_INFINITY;

  for (let i = 0; i < axeLeman.length - 1; i += 1) {
    const a = axeLeman[i];
    const b = axeLeman[i + 1];
    if (!a || !b) continue;

    const [ax, az] = versScene(a.lng, a.lat);
    const [bx, bz] = versScene(b.lng, b.lat);

    const dx = bx - ax;
    const dz = bz - az;
    const longueurCarree = dx * dx + dz * dz;
    const t =
      longueurCarree === 0
        ? 0
        : Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / longueurCarree));

    const px = ax + t * dx;
    const pz = az + t * dz;
    const distance = Math.hypot(x - px, z - pz);
    const demiLargeur = a.demiLargeur + (b.demiLargeur - a.demiLargeur) * t;

    // Rapport < 1 : le point est dans l'eau. > 1 : il est sur la terre.
    meilleur = Math.min(meilleur, distance / demiLargeur);
  }

  return meilleur;
}

/**
 * Contour du lac, obtenu en décalant l'axe médian de sa demi-largeur de part
 * et d'autre. Sert au rendu SVG de la carte, qui n'exige aucun WebGL.
 *
 * `echelle` et `decalage` adaptent le résultat au repère du dessin.
 */
export function contourLeman(
  echelle: number,
  decalageX: number,
  decalageY: number,
): { x: number; y: number }[] {
  const axe = axeLeman.map((point) => {
    const [x, z] = versScene(point.lng, point.lat);
    return { x, y: z, demiLargeur: point.demiLargeur };
  });

  const gauche: { x: number; y: number }[] = [];
  const droite: { x: number; y: number }[] = [];

  for (let i = 0; i < axe.length; i += 1) {
    const courant = axe[i];
    if (!courant) continue;
    const precedent = axe[i - 1] ?? courant;
    const suivant = axe[i + 1] ?? courant;

    // Normale à la tangente locale.
    const tx = suivant.x - precedent.x;
    const ty = suivant.y - precedent.y;
    const norme = Math.hypot(tx, ty) || 1;
    const nx = -ty / norme;
    const ny = tx / norme;

    const l = courant.demiLargeur;
    gauche.push({
      x: (courant.x + nx * l) * echelle + decalageX,
      y: (courant.y + ny * l) * echelle + decalageY,
    });
    droite.push({
      x: (courant.x - nx * l) * echelle + decalageX,
      y: (courant.y - ny * l) * echelle + decalageY,
    });
  }

  return [...gauche, ...droite.reverse()];
}

/** Transforme une suite de points en tracé SVG lissé (Catmull-Rom → Bézier). */
export function traceLisse(points: readonly { x: number; y: number }[], ferme = true): string {
  if (points.length < 2) return '';

  const nombre = points.length;
  const au = (i: number) => points[((i % nombre) + nombre) % nombre]!;
  let d = `M ${au(0).x.toFixed(2)} ${au(0).y.toFixed(2)}`;

  const dernier = ferme ? nombre : nombre - 1;
  for (let i = 0; i < dernier; i += 1) {
    const p0 = au(i - 1);
    const p1 = au(i);
    const p2 = au(i + 1);
    const p3 = au(i + 2);

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return ferme ? `${d} Z` : d;
}
