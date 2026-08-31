'use client';

import { useCallback } from 'react';
import { ArrowDown, Phone } from 'lucide-react';

import BoutonMagnetique from '@/components/BoutonMagnetique';
import CarteImplantations from '@/components/CarteImplantations';
import Reveal from '@/components/Reveal';
import TitreMasque from '@/components/TitreMasque';
import SceneHote from '@/components/scenes/SceneHote';
import { agence, bureaux } from '@/content/site';
import { lienTel } from '@/lib/utils';

export default function HeroAccueil() {
  /* La fonction est mémorisée : l'hôte de scène la reçoit en dépendance
     d'effet, et une nouvelle référence à chaque rendu relancerait l'import. */
  const chargerScene = useCallback(() => import('@/components/scenes/SceneLemanique'), []);

  return (
    <section className="relative flex min-h-[calc(100svh-var(--entete-hauteur))] flex-col justify-center overflow-hidden">
      {/* --- Scène 3D, ou carte SVG si WebGL est indisponible --- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <SceneHote
          className="h-full w-full"
          charger={chargerScene}
          repli={
            <div className="absolute inset-0 flex items-center justify-center opacity-70">
              <CarteImplantations statique className="w-full max-w-5xl" />
            </div>
          }
        />
      </div>

      {/* Voiles de lisibilité, du plus sombre en bas vers le plus clair en haut */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,transparent_0%,color-mix(in_oklab,var(--color-noir)_72%,transparent)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,transparent,var(--color-noir))]"
      />

      <div className="cadre relative z-2 py-14 lg:py-16">
        <p className="etiquette">Agence agréée par le Conseil d’État&nbsp;· Genève</p>

        <TitreMasque
          as="h1"
          lignes={[
            'Établir les faits,',
            <>
              sans jamais <span className="text-champagne italic">se faire remarquer</span>
            </>,
          ]}
          className="mt-10 max-w-4xl font-display text-affiche text-ivoire"
        />

        <Reveal retard={260}>
          <p className="mt-7 max-w-xl text-conduite text-argent">
            Enquêtes privées et commerciales, filatures et contre-mesures électroniques en Suisse
            romande. Plus de {agence.anneesExperience} ans de terrain, quatre implantations, un
            réseau international — et la discrétion pour méthode.
          </p>
        </Reveal>

        <Reveal retard={380}>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <BoutonMagnetique href="/contact/" className="btn-primaire">
              Évaluer ma situation
            </BoutonMagnetique>
            <a href={lienTel(agence.telephonePrincipal)} className="btn btn-secondaire">
              <Phone aria-hidden="true" className="size-4" />
              Appeler en toute confidentialité
            </a>
          </div>
        </Reveal>

        {/* Repères d'implantation — l'information ne dépend pas de la scène 3D */}
        <Reveal retard={500}>
          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--trait)] pt-7">
            {bureaux.map((bureau) => (
              <li key={bureau.id} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-champagne"
                  style={{ opacity: bureau.principal ? 1 : 0.55 }}
                />
                <span className="font-mono text-[0.6875rem] tracking-[0.2em] text-brume uppercase">
                  {bureau.ville}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* Invitation à faire défiler */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-6 z-2 flex justify-center"
      >
        <ArrowDown className="size-4 text-brume motion-safe:animate-[flotte_2.4s_ease-in-out_infinite]" />
      </div>
    </section>
  );
}
