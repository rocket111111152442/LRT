'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { ArrowRight } from 'lucide-react';

import Reveal from '@/components/Reveal';
import TitreMasque from '@/components/TitreMasque';
import SceneHote from '@/components/scenes/SceneHote';
import { zonesIntervention } from '@/content/site';

/** Repli statique du globe : cercles concentriques et méridiens, en SVG. */
function GlobeStatique() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="mx-auto w-full max-w-md opacity-70"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="globe-repli" cx="42%" cy="36%" r="68%">
          <stop offset="0%" stopColor="#1e262f" />
          <stop offset="100%" stopColor="#0b0f14" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="150" fill="url(#globe-repli)" stroke="#2c3742" />
      {/* Parallèles */}
      {[-100, -55, 0, 55, 100].map((decalage) => (
        <ellipse
          key={decalage}
          cx="200"
          cy={200 + decalage}
          rx={Math.sqrt(Math.max(0, 150 * 150 - decalage * decalage))}
          ry="14"
          fill="none"
          stroke="#2c3742"
          strokeWidth="1"
        />
      ))}
      {/* Méridiens */}
      {[30, 75, 120].map((rx) => (
        <ellipse
          key={rx}
          cx="200"
          cy="200"
          rx={rx}
          ry="150"
          fill="none"
          stroke="#2c3742"
          strokeWidth="1"
        />
      ))}
      <circle cx="200" cy="150" r="150" fill="none" stroke="#2c3742" strokeWidth="0" />
      {/* Genève */}
      <circle cx="212" cy="152" r="4" fill="#f0dcb4" />
      <circle cx="212" cy="152" r="11" fill="none" stroke="#c9ab72" strokeOpacity="0.5" />
    </svg>
  );
}

export default function SectionReseau() {
  const chargerScene = useCallback(() => import('@/components/scenes/SceneGlobe'), []);

  return (
    <section className="section relative overflow-hidden border-t border-[var(--trait)]">
      <div className="cadre">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="etiquette">Réseau international</p>
            <TitreMasque
              as="h2"
              lignes={['Une enquête ne s’arrête pas', 'à la frontière']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
            <Reveal retard={180}>
              <p className="mt-6 max-w-md text-conduite text-argent">
                Nos détectives s’appuient sur un réseau de collaborateurs issus du renseignement et
                du droit, établis localement. Il permet de poursuivre une filature, une recherche de
                personne ou une vérification là où le dossier conduit.
              </p>
            </Reveal>

            <Reveal retard={280}>
              <ul className="mt-9 flex flex-wrap gap-2.5">
                {zonesIntervention.map((zone) => (
                  <li
                    key={zone}
                    className="rounded-full border border-[var(--trait)] px-4 py-2 font-mono text-[0.6875rem] tracking-[0.14em] text-argent uppercase"
                  >
                    {zone}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal retard={360}>
              <Link href="/reseau-international/" className="lien-fleche mt-9 inline-flex">
                Le réseau en détail
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Reveal>
          </div>

          <div aria-hidden="true" className="relative aspect-square">
            <SceneHote
              className="flex h-full w-full items-center justify-center"
              charger={chargerScene}
              repli={<GlobeStatique />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
