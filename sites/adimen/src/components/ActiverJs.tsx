'use client';

import { useEffect } from 'react';

/**
 * Ajoute la classe `js` sur <html> dès l'hydratation.
 *
 * Les états initiaux des animations (opacité nulle, décalage) ne s'appliquent
 * que sous cette classe : sans JavaScript, le contenu reste entièrement lisible
 * plutôt que de rester invisible.
 */
export default function ActiverJs() {
  useEffect(() => {
    document.documentElement.classList.add('js');
    return () => document.documentElement.classList.remove('js');
  }, []);

  return null;
}
