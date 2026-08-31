'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { chargerGsap } from '@/lib/motion';
import { cx } from '@/lib/utils';

type Props = {
  children: ReactNode;
  /** Amplitude du déplacement vertical sur toute la traversée, en pixels. */
  amplitude?: number;
  className?: string;
};

/**
 * Décale son contenu à contre-sens du défilement.
 *
 * GSAP et ScrollTrigger sont importés à la demande, et seulement si le visiteur
 * n'a pas demandé de réduction des animations : la bibliothèque n'est alors pas
 * téléchargée du tout.
 */
export default function Parallaxe({ children, amplitude = 90, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const element = ref.current;
    if (!element) return;

    let nettoyer: (() => void) | undefined;
    let annule = false;

    chargerGsap()
      .then(({ gsap }) => {
        if (annule) return;
        const animation = gsap.fromTo(
          element,
          { yPercent: 0, y: -amplitude / 2 },
          {
            y: amplitude / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
        nettoyer = () => {
          animation.scrollTrigger?.kill();
          animation.kill();
        };
      })
      .catch(() => {
        // Sans GSAP, le contenu reste simplement statique.
      });

    return () => {
      annule = true;
      nettoyer?.();
    };
  }, [amplitude]);

  return (
    <div ref={ref} className={cx('will-change-transform', className)}>
      {children}
    </div>
  );
}
