'use client';

import type { ReactNode } from 'react';
import { useEntreeEnVue } from '@/lib/motion';
import { cx } from '@/lib/utils';

type Props = {
  /** Une entrée par ligne : le découpage reste maîtrisé et n'exige aucune mesure. */
  lignes: readonly ReactNode[];
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
  /** Écart entre l'apparition de deux lignes, en millisecondes. */
  cadence?: number;
};

/**
 * Titre dévoilé ligne par ligne derrière un masque.
 *
 * Chaque ligne est un bloc à débordement caché dont l'enfant remonte : c'est
 * l'effet cinématographique classique, obtenu en CSS pur.
 */
export default function TitreMasque({
  lignes,
  as: Balise = 'h2',
  className,
  cadence = 110,
}: Props) {
  const ref = useEntreeEnVue<HTMLHeadingElement>(0.2);

  return (
    <Balise ref={ref} className={className}>
      {lignes.map((ligne, index) => (
        <span
          key={index}
          className={cx('masque-ligne')}
          style={{ '--retard': `${index * cadence}ms` } as React.CSSProperties}
        >
          <span>{ligne}</span>
        </span>
      ))}
    </Balise>
  );
}
