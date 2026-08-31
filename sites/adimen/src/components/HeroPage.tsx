import type { ReactNode } from 'react';

import FilAriane from '@/components/FilAriane';
import Reveal from '@/components/Reveal';
import TitreMasque from '@/components/TitreMasque';
import type { MailleFil } from '@/lib/jsonld';
import { cx } from '@/lib/utils';

type Props = {
  etiquette: string;
  /** Une entrée par ligne du titre : le découpage reste maîtrisé. */
  titre: readonly string[];
  chapeau: string;
  maillons: readonly MailleFil[];
  /** Élément décoratif placé en fond, généralement une scène 3D. */
  decor?: ReactNode;
  /** Bloc d'actions ou de repères sous le chapeau. */
  children?: ReactNode;
  className?: string;
};

/**
 * En-tête des pages intérieures : fil d'Ariane, titre dévoilé, chapeau.
 * Le décor est purement visuel et n'emporte aucune information.
 */
export default function HeroPage({
  etiquette,
  titre,
  chapeau,
  maillons,
  decor,
  children,
  className,
}: Props) {
  return (
    <section className={cx('relative overflow-hidden border-b border-[var(--trait)]', className)}>
      {decor && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {decor}
        </div>
      )}

      {/* Voiles de lisibilité.
          Le premier protège la colonne de texte, à gauche ; le second referme
          le bas de la section. Le décor reste ainsi perceptible à droite, là où
          aucun texte ne le recouvre. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,color-mix(in_oklab,var(--color-noir)_92%,transparent)_0%,color-mix(in_oklab,var(--color-noir)_70%,transparent)_42%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,var(--color-noir))]"
      />

      <div className="cadre relative z-2 pt-14 pb-16 lg:pt-20 lg:pb-24">
        <Reveal>
          <FilAriane maillons={maillons} />
        </Reveal>

        <p className="etiquette mt-8">{etiquette}</p>

        <TitreMasque
          as="h1"
          lignes={titre}
          className="mt-9 max-w-4xl font-display text-t1 text-ivoire"
        />

        <Reveal retard={220}>
          <p className="mt-7 max-w-2xl text-conduite text-argent">{chapeau}</p>
        </Reveal>

        {children && <Reveal retard={340}>{children}</Reveal>}
      </div>
    </section>
  );
}
