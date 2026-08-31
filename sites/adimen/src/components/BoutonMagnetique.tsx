'use client';

import Link from 'next/link';
import { useCallback, useRef, type ReactNode } from 'react';

import { usePointeurPrecis, usePrefereMoinsDeMouvement } from '@/lib/navigateur';
import { cx } from '@/lib/utils';

type Props = {
  children: ReactNode;
  href: string;
  className?: string;
  /** Amplitude du déplacement, en pixels. */
  force?: number;
  /** Lien externe : ouvre un nouvel onglet et pose les attributs de sécurité. */
  externe?: boolean;
};

/**
 * Bouton légèrement attiré par le pointeur.
 *
 * L'effet ne s'active que sur un pointeur précis (souris ou stylet) et hors
 * mouvement réduit : au doigt, il n'apporterait rien et gênerait le défilement.
 */
export default function BoutonMagnetique({
  children,
  href,
  className,
  force = 7,
  externe = false,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  // Les deux abonnements sont lus séparément : un « && » rendrait le second
  // appel conditionnel, ce que les règles des hooks interdisent.
  const pointeurPrecis = usePointeurPrecis();
  const mouvementReduit = usePrefereMoinsDeMouvement();
  const actif = pointeurPrecis && !mouvementReduit;

  const surMouvement = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!actif || !ref.current) return;
      const cadre = ref.current.getBoundingClientRect();
      const dx = e.clientX - (cadre.left + cadre.width / 2);
      const dy = e.clientY - (cadre.top + cadre.height / 2);
      // Déplacement proportionnel à l'écart au centre, borné par `force`.
      ref.current.style.transform = `translate(${(dx / cadre.width) * force * 2}px, ${(dy / cadre.height) * force * 2}px)`;
    },
    [actif, force],
  );

  const surSortie = useCallback(() => {
    if (ref.current) ref.current.style.transform = '';
  }, []);

  const proprietesExternes = externe
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <Link
      ref={ref}
      href={href}
      className={cx('btn', className)}
      onMouseMove={surMouvement}
      onMouseLeave={surSortie}
      onBlur={surSortie}
      {...proprietesExternes}
    >
      {children}
    </Link>
  );
}
