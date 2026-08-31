'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

import { usePrefereMoinsDeMouvement } from '@/lib/navigateur';

export { usePrefereMoinsDeMouvement } from '@/lib/navigateur';

/**
 * Marque un élément comme « vu » dès qu'il entre dans la fenêtre.
 * L'observation cesse ensuite : aucune animation ne se rejoue au défilement
 * inverse, ce qui évite le scintillement et le travail inutile.
 */
export function useEntreeEnVue<T extends HTMLElement>(seuil = 0.15) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      element.dataset.vu = 'true';
      return;
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) {
            (entree.target as HTMLElement).dataset.vu = 'true';
            observateur.unobserve(entree.target);
          }
        }
      },
      { threshold: seuil, rootMargin: '0px 0px -8% 0px' },
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, [seuil]);

  return ref;
}

/* --------------------------------------------------------------------------
   Capacité graphique
   -------------------------------------------------------------------------- */

export type Capacite = 'complete' | 'allegee' | 'aucune';

/**
 * Sonde matérielle, évaluée une seule fois puis mémorisée.
 *
 * La création d'un contexte WebGL n'est pas gratuite : la refaire à chaque
 * lecture coûterait cher, et le résultat ne change pas au cours d'une visite.
 */
let sondeMemorisee: 'complete' | 'allegee' | 'aucune' | null = null;

function sonderMateriel(): 'complete' | 'allegee' | 'aucune' {
  if (sondeMemorisee) return sondeMemorisee;

  // WebGL indisponible : le composant appelant affichera son repli.
  try {
    const toile = document.createElement('canvas');
    const contexte = toile.getContext('webgl2') ?? toile.getContext('webgl');
    if (!contexte) {
      sondeMemorisee = 'aucune';
      return sondeMemorisee;
    }
    // Le contexte n'a servi qu'à la détection : on le libère aussitôt.
    contexte.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    sondeMemorisee = 'aucune';
    return sondeMemorisee;
  }

  const petitEcran = window.matchMedia('(max-width: 767px)').matches;
  const peuDeCoeurs = (navigator.hardwareConcurrency ?? 8) <= 4;
  const economieDonnees = (navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection?.saveData;

  sondeMemorisee = petitEcran || peuDeCoeurs || economieDonnees ? 'allegee' : 'complete';
  return sondeMemorisee;
}

/* La sonde ne varie pas : l'abonnement n'a rien à écouter. */
function abonnementInerte() {
  return () => {};
}

/**
 * Décide si la machine peut raisonnablement afficher une scène 3D complète.
 * Sert à basculer sur une version allégée plutôt qu'à tout désactiver.
 */
export function useCapaciteGraphique(): Capacite {
  const mouvementReduit = usePrefereMoinsDeMouvement();

  const materiel = useSyncExternalStore(
    abonnementInerte,
    sonderMateriel,
    // Au rendu serveur, on suppose la version allégée : c'est le repli le plus sûr.
    () => 'allegee' as const,
  );

  return mouvementReduit ? 'aucune' : materiel;
}

/** Charge GSAP et ScrollTrigger à la demande, une seule fois par page. */
export async function chargerGsap() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}
