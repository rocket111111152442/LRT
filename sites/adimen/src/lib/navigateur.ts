'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Abonnements aux états du navigateur.
 *
 * Ces valeurs viennent d'une source extérieure à React (media queries, position
 * de défilement, stockage de session). `useSyncExternalStore` est le mécanisme
 * prévu pour cela : il évite le rendu en cascade qu'entraînerait un `setState`
 * appelé dans un effet, et fournit une valeur de rendu serveur explicite.
 */

/** Suit une media query. `valeurServeur` est utilisée pendant le rendu serveur. */
export function useMediaQuery(requete: string, valeurServeur = false): boolean {
  const abonner = useCallback(
    (surChangement: () => void) => {
      const mq = window.matchMedia(requete);
      mq.addEventListener('change', surChangement);
      return () => mq.removeEventListener('change', surChangement);
    },
    [requete],
  );

  return useSyncExternalStore(
    abonner,
    () => window.matchMedia(requete).matches,
    () => valeurServeur,
  );
}

/** Vrai si le visiteur demande une réduction des animations. */
export function usePrefereMoinsDeMouvement(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Vrai pour une souris ou un stylet — faux au doigt. */
export function usePointeurPrecis(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

/* --------------------------------------------------------------------------
   Défilement
   -------------------------------------------------------------------------- */

function abonnerDefilement(surChangement: () => void) {
  window.addEventListener('scroll', surChangement, { passive: true });
  return () => window.removeEventListener('scroll', surChangement);
}

/** Vrai dès que la page a défilé au-delà du seuil indiqué. */
export function useADefile(seuil = 12): boolean {
  return useSyncExternalStore(
    abonnerDefilement,
    () => window.scrollY > seuil,
    () => false,
  );
}
