'use client';

import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';

import { useCapaciteGraphique } from '@/lib/motion';
import { cx } from '@/lib/utils';

type Qualite = 'complete' | 'allegee';

type Props = {
  /** Scène à charger. L'import n'est déclenché qu'à l'approche de la fenêtre. */
  charger: () => Promise<{ default: React.ComponentType<{ qualite?: Qualite }> }>;
  /** Rendu affiché sans WebGL, en mouvement réduit, et pendant le chargement. */
  repli: ReactNode;
  className?: string;
};

/**
 * Hôte des scènes WebGL.
 *
 * Trois garde-fous :
 *   1. la scène n'est importée que lorsqu'elle approche de la fenêtre ;
 *   2. sans WebGL ou en mouvement réduit, seul le repli est rendu — le module
 *      three.js n'est alors jamais téléchargé ;
 *   3. le repli reste visible sous la scène, ce qui évite tout vide pendant le
 *      chargement et garantit un contenu si le contexte WebGL est perdu.
 */
export default function SceneHote({ charger, repli, className }: Props) {
  const capacite = useCapaciteGraphique();
  const [proche, setProche] = useState(false);
  const [Scene, setScene] = useState<React.ComponentType<{ qualite?: Qualite }> | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);

  /* --- Déclenchement à l'approche --- */
  useEffect(() => {
    const element = conteneurRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setProche(true);
      return;
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((entree) => entree.isIntersecting)) {
          setProche(true);
          observateur.disconnect();
        }
      },
      { rootMargin: '300px' },
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  /* --- Import effectif --- */
  useEffect(() => {
    if (!proche || capacite === 'aucune') return;
    let annule = false;

    charger()
      .then((module) => {
        if (!annule) setScene(() => lazy(async () => module));
      })
      .catch(() => {
        // Échec de chargement : le repli reste affiché, rien d'autre à faire.
      });

    return () => {
      annule = true;
    };
  }, [proche, capacite, charger]);

  const afficherScene = capacite !== 'aucune' && Scene !== null;

  /* La racine sert de référence aux enfants positionnés : elle doit rester en
     `relative`. L'appelant lui donne sa taille (`h-full w-full`, une hauteur
     fixe, un rapport d'aspect…) mais jamais une autre valeur de `position` :
     les deux utilitaires se neutraliseraient et la hauteur tomberait à zéro. */
  return (
    <div ref={conteneurRef} className={cx('relative', className)}>
      {/* Le repli est toujours dans le DOM : il porte le contenu accessible. */}
      <div
        className={cx(
          'transition-opacity duration-1000 ease-[var(--ease-doux)]',
          afficherScene && 'opacity-0',
        )}
        aria-hidden={afficherScene || undefined}
      >
        {repli}
      </div>

      {afficherScene && (
        <div className="absolute inset-0 motion-safe:animate-[apparition_1200ms_var(--ease-doux)_forwards]">
          <Suspense fallback={null}>
            <Scene qualite={capacite} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
