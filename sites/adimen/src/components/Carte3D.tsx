'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

import { usePointeurPrecis, usePrefereMoinsDeMouvement } from '@/lib/navigateur';
import { cx } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  /** Inclinaison maximale, en degrés. */
  amplitude?: number;
};

/**
 * Carte inclinée en trois dimensions sous le pointeur, avec un halo qui le suit.
 *
 * L'inclinaison est écrite dans des variables CSS plutôt qu'appliquée
 * directement : la transformation reste décrite dans la feuille de style, et
 * un seul style est recalculé par déplacement.
 */
export default function Carte3D({ children, className, amplitude = 5 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const image = useRef(0);
  // Les deux abonnements sont lus séparément : un « && » rendrait le second
  // appel conditionnel, ce que les règles des hooks interdisent.
  const pointeurPrecis = usePointeurPrecis();
  const mouvementReduit = usePrefereMoinsDeMouvement();
  const actif = pointeurPrecis && !mouvementReduit;

  // Annule l'image en attente si la carte disparaît entre-temps.
  useEffect(
    () => () => {
      if (image.current) cancelAnimationFrame(image.current);
    },
    [],
  );

  const surMouvement = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const element = ref.current;
      const { clientX, clientY } = e;

      if (image.current) return;
      image.current = requestAnimationFrame(() => {
        image.current = 0;
        const cadre = element.getBoundingClientRect();
        const px = (clientX - cadre.left) / cadre.width;
        const py = (clientY - cadre.top) / cadre.height;

        // Le halo suit le pointeur, y compris sans inclinaison.
        element.style.setProperty('--pointeur-x', `${px * 100}%`);
        element.style.setProperty('--pointeur-y', `${py * 100}%`);

        if (!actif) return;
        element.style.setProperty('--ry', `${(px - 0.5) * amplitude * 2}deg`);
        element.style.setProperty('--rx', `${(0.5 - py) * amplitude * 2}deg`);
        element.style.setProperty('--tz', '6px');
      });
    },
    [actif, amplitude],
  );

  const surSortie = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty('--ry', '0deg');
    element.style.setProperty('--rx', '0deg');
    element.style.setProperty('--tz', '0px');
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={surMouvement}
      onMouseLeave={surSortie}
      className={cx('carte carte-halo carte-3d', className)}
      style={{
        transition: 'transform 420ms var(--ease-net), border-color 420ms, box-shadow 420ms',
      }}
    >
      {children}
    </div>
  );
}
