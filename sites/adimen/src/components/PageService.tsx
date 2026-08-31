'use client';

import Link from 'next/link';
import { useCallback, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

import Carte3D from '@/components/Carte3D';
import HeroPage from '@/components/HeroPage';
import Reveal from '@/components/Reveal';
import TitreMasque from '@/components/TitreMasque';
import SceneHote from '@/components/scenes/SceneHote';
import { univers, type Univers } from '@/content/services';
import type { MailleFil } from '@/lib/jsonld';

/**
 * Trame commune aux quatre pages de service.
 *
 * Chaque univers garde sa teinte et son décor : la structure est partagée,
 * l'ambiance ne l'est pas.
 */

const DECORS: Record<Univers['id'], { lueur: string; grille: boolean }> = {
  particuliers: {
    lueur: 'color-mix(in oklab, var(--color-champagne) 28%, transparent)',
    grille: false,
  },
  entreprises: { lueur: 'color-mix(in oklab, var(--color-argent) 20%, transparent)', grille: true },
  parents: { lueur: 'color-mix(in oklab, var(--color-tactique) 24%, transparent)', grille: false },
  'contre-mesures': {
    lueur: 'color-mix(in oklab, var(--color-champagne) 22%, transparent)',
    grille: true,
  },
};

type Props = {
  univers: Univers;
  maillons: readonly MailleFil[];
  /** Titre du hero, une entrée par ligne. */
  titre: readonly string[];
  /** Développement éditorial propre à la page, sous la liste des prestations. */
  children?: ReactNode;
};

export default function PageService({ univers: courant, maillons, titre, children }: Props) {
  const decor = DECORS[courant.id];
  const chargerBalayage = useCallback(() => import('@/components/scenes/SceneBalayage'), []);
  const autres = univers.filter((u) => u.id !== courant.id);

  return (
    <>
      <HeroPage
        etiquette={`Services · ${courant.label}`}
        titre={titre}
        chapeau={courant.chapeau}
        maillons={maillons}
        decor={
          courant.id === 'contre-mesures' ? (
            <SceneHote
              className="h-full w-full"
              charger={chargerBalayage}
              repli={
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse 60% 70% at 50% 50%, ${decor.lueur}, transparent 70%)`,
                  }}
                />
              }
            />
          ) : (
            <>
              {decor.grille && <div className="grille-fond opacity-50" />}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 70% 80% at 72% 20%, ${decor.lueur}, transparent 68%)`,
                }}
              />
            </>
          )
        }
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/contact/" className="btn btn-primaire">
            Évaluer ma situation
          </Link>
          <Link href="/tarifs/" className="btn btn-secondaire">
            Voir les tarifs
          </Link>
        </div>
      </HeroPage>

      {/* ---------------- Prestations ---------------- */}
      <section className="section">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Ce que nous prenons en charge</p>
            <TitreMasque
              as="h2"
              lignes={['Nos domaines', 'd’intervention']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>

          <ul className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courant.prestations.map((prestation, index) => (
              <li key={prestation.titre} id={prestation.ancre}>
                <Reveal retard={(index % 3) * 100} className="h-full">
                  <Carte3D className="h-full">
                    <article className="flex h-full flex-col p-8">
                      <span
                        aria-hidden="true"
                        className="font-mono text-[0.6875rem] tracking-[0.2em] text-champagne"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="mt-4 font-display text-t4 text-ivoire">{prestation.titre}</h3>
                      <p className="mt-3 text-[0.9375rem] leading-relaxed text-brume">
                        {prestation.texte}
                      </p>
                    </article>
                  </Carte3D>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {children}

      {/* ---------------- Vers les autres univers ---------------- */}
      <section className="section-serree border-t border-[var(--trait)] bg-graphite pb-16">
        <div className="cadre">
          <p className="etiquette">Autres univers</p>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] sm:grid-cols-3">
            {autres.map((autre, index) => (
              <li key={autre.id} className="bg-graphite">
                <Reveal retard={index * 90} className="h-full">
                  <Link
                    href={autre.href}
                    className="group flex h-full flex-col p-7 transition-colors duration-400 hover:bg-ardoise"
                  >
                    <h3 className="font-display text-t4 text-ivoire">{autre.label}</h3>
                    <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-brume">
                      {autre.accroche}
                    </p>
                    <span className="lien-fleche mt-6 text-[0.875rem]">
                      Consulter
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
