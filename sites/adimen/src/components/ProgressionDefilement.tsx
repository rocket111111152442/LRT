'use client';

import { useEffect, useState } from 'react';

/**
 * Fine barre de progression de lecture, posée sur l'arête basse de l'en-tête.
 *
 * La valeur est calculée dans une image d'animation afin de ne pas déclencher
 * de recalcul de mise en page à chaque événement de défilement.
 */
export default function ProgressionDefilement() {
  const [progression, setProgression] = useState(0);

  useEffect(() => {
    let image = 0;

    const mesurer = () => {
      image = 0;
      const parcours = document.documentElement.scrollHeight - window.innerHeight;
      setProgression(parcours > 0 ? Math.min(1, window.scrollY / parcours) : 0);
    };

    const surDefilement = () => {
      if (image) return;
      image = window.requestAnimationFrame(mesurer);
    };

    mesurer();
    window.addEventListener('scroll', surDefilement, { passive: true });
    window.addEventListener('resize', surDefilement, { passive: true });

    return () => {
      window.removeEventListener('scroll', surDefilement);
      window.removeEventListener('resize', surDefilement);
      if (image) window.cancelAnimationFrame(image);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px">
      <div
        className="h-full origin-left bg-champagne"
        style={{
          transform: `scaleX(${progression})`,
          opacity: progression > 0.002 ? 1 : 0,
          transition: 'opacity 240ms var(--ease-doux)',
        }}
      />
    </div>
  );
}
