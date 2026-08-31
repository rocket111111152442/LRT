import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';

import Reveal from '@/components/Reveal';
import TitreMasque from '@/components/TitreMasque';
import { apparitions } from '@/content/medias';

/**
 * Section « Médias » de la page d'accueil.
 *
 * Elle ne s'affiche que si au moins une intervention est publiable. Tant que
 * `src/content/medias.ts` est vide, la section disparaît entièrement plutôt
 * que d'exposer une grille creuse — voir le commentaire en tête de ce fichier
 * de contenu.
 */
export default function SectionMedias() {
  if (apparitions.length === 0) return null;

  return (
    <section className="section relative border-t border-[var(--trait)]">
      <div className="cadre">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="etiquette">Médias</p>
            <TitreMasque
              as="h2"
              lignes={['L’agence dans la presse', 'et à la télévision']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>
          <Reveal>
            <Link href="/medias/" className="lien-fleche">
              Toutes les interventions
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {apparitions.slice(0, 3).map((apparition, index) => (
            <li key={apparition.url}>
              <Reveal retard={index * 110} className="h-full">
                <a
                  href={apparition.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="carte carte-halo flex h-full flex-col p-8"
                >
                  <div className="flex items-center gap-3">
                    <Newspaper aria-hidden="true" className="size-4 text-champagne" />
                    <span className="font-mono text-[0.6875rem] tracking-[0.18em] text-brume uppercase">
                      {apparition.media}
                      {apparition.emission ? ` · ${apparition.emission}` : ''} · {apparition.annee}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-t4 text-ivoire">{apparition.titre}</h3>
                  <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-brume">
                    {apparition.resume}
                  </p>
                  <span className="lien-fleche mt-7">
                    Voir le sujet
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
