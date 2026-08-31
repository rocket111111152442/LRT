/**
 * Générateur pseudo-aléatoire déterministe (mulberry32).
 *
 * Les scènes 3D ont besoin de désordre — position des points, déphasage des
 * pulsations — mais `Math.random()` rend la construction impure : React
 * l'interdit pendant le rendu, et la scène changerait à chaque visite.
 *
 * Une graine fixe donne une figure identique à chaque chargement, ce qui rend
 * aussi le rendu comparable d'une capture à l'autre.
 */
export function generateur(graine: number): () => number {
  let etat = graine >>> 0;
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
