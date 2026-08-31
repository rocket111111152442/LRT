import Link from 'next/link';
import type { Metadata } from 'next';

import { navigationPied } from '@/content/navigation';
import { agence } from '@/content/site';
import { construireMeta } from '@/lib/seo';
import { lienTel } from '@/lib/utils';

export const metadata: Metadata = construireMeta({
  titre: 'Page introuvable',
  description: "La page demandée n'existe pas ou a été déplacée.",
  chemin: '/404/',
  noIndex: true,
});

export default function PageIntrouvable() {
  return (
    <section className="section relative flex min-h-[70svh] items-center overflow-hidden">
      <div aria-hidden="true" className="grille-fond opacity-40" />

      <div className="cadre relative z-2">
        <p className="etiquette">Erreur 404</p>
        <h1 className="mt-5 max-w-3xl font-display text-t1 text-ivoire">
          Cette piste ne mène nulle part
        </h1>
        <p className="mt-6 max-w-xl text-conduite text-argent">
          La page que vous cherchez n’existe pas ou a été déplacée lors de la refonte du site. Les
          principales rubriques restent accessibles ci-dessous.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primaire">
            Retour à l’accueil
          </Link>
          <a href={lienTel(agence.telephonePrincipal)} className="btn btn-secondaire">
            Appeler le {agence.telephonePrincipalAffiche}
          </a>
        </div>

        <nav
          aria-label="Rubriques principales"
          className="mt-14 border-t border-[var(--trait)] pt-9"
        >
          <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ...navigationPied.agence,
              ...navigationPied.services,
              ...navigationPied.implantations,
            ].map((lien) => (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  className="text-argent transition-colors duration-200 hover:text-champagne"
                >
                  {lien.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
