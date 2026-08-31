'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEntreeEnVue } from '@/lib/motion';
import { cx } from '@/lib/utils';

/**
 * Balises autorisées. La liste est volontairement fermée : les types de
 * react-three-fiber étendent l'espace JSX global, et un `ElementType` ouvert
 * n'y est plus inférable.
 */
type BaliseAutorisee =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'figure'
  | 'header'
  | 'li'
  | 'ol'
  | 'p'
  | 'span'
  | 'ul';

type Props = {
  children: ReactNode;
  /** Retard d'apparition, en millisecondes. Sert aux apparitions échelonnées. */
  retard?: number;
  className?: string;
  as?: BaliseAutorisee;
  seuil?: number;
};

/**
 * Révèle son contenu lorsqu'il entre dans la fenêtre.
 *
 * L'effet repose sur une classe CSS et un observateur d'intersection : aucune
 * bibliothèque d'animation n'est chargée pour ce cas courant, et le contenu
 * reste visible si le JavaScript est indisponible.
 */
export default function Reveal({
  children,
  retard = 0,
  className,
  as = 'div',
  seuil = 0.15,
}: Props) {
  const ref = useEntreeEnVue<HTMLDivElement>(seuil);
  const Balise = as as 'div';

  return (
    <Balise
      ref={ref}
      className={cx('revele', className)}
      style={retard ? ({ '--retard': `${retard}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Balise>
  );
}
