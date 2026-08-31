'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const CLE_SESSION = 'adimen-intro-vue';

/* Lu une seule fois : la valeur ne change pas au cours de la visite, et
   `useSyncExternalStore` exige un instantané stable. */
let dejaVueMemorise: boolean | null = null;

function lireDejaVue(): boolean {
  if (dejaVueMemorise === null) {
    try {
      dejaVueMemorise = window.sessionStorage.getItem(CLE_SESSION) === '1';
    } catch {
      // Stockage indisponible (navigation privée stricte) : l'intro se rejouera.
      dejaVueMemorise = false;
    }
  }
  return dejaVueMemorise;
}

function abonnementInerte() {
  return () => {};
}

/**
 * Ouverture du site : un voile se lève sur la marque.
 *
 * L'animation est entièrement décrite en CSS. Elle se joue donc aussi sans
 * JavaScript, et la feuille de style la neutralise en mouvement réduit. Le
 * script ne sert qu'à deux choses : ne pas la rejouer pendant la session, et
 * retirer le voile du document une fois l'animation terminée.
 *
 * Le voile n'intercepte aucun clic : même bloqué, il ne peut pas empêcher
 * l'accès au contenu.
 */
export default function IntroSite() {
  const dejaVue = useSyncExternalStore(
    abonnementInerte,
    lireDejaVue,
    // Au rendu serveur, on suppose la première visite : le voile fait alors
    // partie du document et son animation démarre sans attendre l'hydratation.
    () => false,
  );
  const [retire, setRetire] = useState(false);

  useEffect(() => {
    if (dejaVue) return;

    try {
      window.sessionStorage.setItem(CLE_SESSION, '1');
      dejaVueMemorise = true;
    } catch {
      // Sans persistance, l'intro se rejouera : sans conséquence.
    }

    const minuteur = window.setTimeout(() => setRetire(true), 1500);
    return () => window.clearTimeout(minuteur);
  }, [dejaVue]);

  if (dejaVue || retire) return null;

  return (
    <div
      aria-hidden="true"
      className="intro-voile sans-impression pointer-events-none fixed inset-0 z-100 flex items-center justify-center bg-noir"
    >
      <span className="intro-marque font-display text-[clamp(1.75rem,7vw,3.5rem)] tracking-[0.42em] text-ivoire">
        ADIMEN
      </span>
    </div>
  );
}
