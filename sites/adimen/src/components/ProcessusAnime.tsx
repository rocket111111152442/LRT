'use client';

import { useEffect, useRef } from 'react';

import { processus } from '@/content/services';
import { chargerGsap } from '@/lib/motion';

/**
 * Le processus en quatre étapes.
 *
 * Une ligne se trace au fil du défilement et chaque étape s'active à son
 * passage. Sans JavaScript ou en mouvement réduit, les quatre étapes sont
 * affichées d'emblée dans leur état final : l'information n'est jamais portée
 * par la seule animation.
 */
export default function ProcessusAnime() {
  const conteneur = useRef<HTMLDivElement>(null);
  const trait = useRef<SVGLineElement>(null);

  useEffect(() => {
    const element = conteneur.current;
    if (!element) return;

    const etapes = Array.from(element.querySelectorAll<HTMLElement>('[data-etape]'));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const etape of etapes) etape.dataset.actif = 'true';
      if (trait.current) trait.current.style.strokeDashoffset = '0';
      return;
    }

    let nettoyer: (() => void) | undefined;
    let annule = false;

    chargerGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (annule) return;
        const contexte = gsap.context(() => {
          if (trait.current) {
            gsap.to(trait.current, {
              strokeDashoffset: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: element,
                start: 'top 72%',
                end: 'bottom 72%',
                scrub: 0.6,
              },
            });
          }

          etapes.forEach((etape, index) => {
            ScrollTrigger.create({
              trigger: etape,
              start: 'top 78%',
              once: true,
              onEnter: () => {
                // Léger décalage : les étapes s'allument l'une après l'autre.
                gsap.delayedCall(index * 0.06, () => {
                  etape.dataset.actif = 'true';
                });
              },
            });
          });
        }, element);

        nettoyer = () => contexte.revert();
      })
      .catch(() => {
        for (const etape of etapes) etape.dataset.actif = 'true';
      });

    return () => {
      annule = true;
      nettoyer?.();
    };
  }, []);

  return (
    <div ref={conteneur} className="relative">
      <ol className="relative grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] md:grid-cols-2 xl:grid-cols-4">
        {/* Trait de progression, posé sur l'arête haute de la rangée */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-2 hidden h-px w-full xl:block"
          preserveAspectRatio="none"
          viewBox="0 0 100 1"
        >
          <line
            ref={trait}
            x1="0"
            y1="0.5"
            x2="100"
            y2="0.5"
            stroke="#c9ab72"
            strokeWidth="2"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {processus.map((etape) => (
          <li
            key={etape.numero}
            data-etape
            className="group relative bg-graphite p-8 transition-colors duration-500 data-[actif=true]:bg-[color-mix(in_oklab,var(--color-ardoise)_60%,var(--color-graphite))] lg:p-10"
          >
            <span
              aria-hidden="true"
              className="font-mono text-[2.5rem] leading-none text-acier-clair transition-colors duration-700 group-data-[actif=true]:text-champagne"
            >
              {etape.numero}
            </span>
            <h3 className="mt-5 font-display text-t4 text-ivoire">{etape.titre}</h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-brume">{etape.texte}</p>

            {/* Liseré d'activation */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-champagne transition-transform duration-700 ease-[var(--ease-net)] group-data-[actif=true]:scale-x-100"
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
