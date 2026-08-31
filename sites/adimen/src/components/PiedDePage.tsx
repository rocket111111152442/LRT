import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

import Logo from '@/components/Logo';
import { navigationPied } from '@/content/navigation';
import { agence, bureaux, horaires } from '@/content/site';
import { lienPlan, lienTel } from '@/lib/utils';

const colonnes = [
  { titre: "L'agence", liens: navigationPied.agence },
  { titre: 'Services', liens: navigationPied.services },
  { titre: 'Implantations', liens: navigationPied.implantations },
] as const;

export default function PiedDePage() {
  const annee = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--trait)] bg-noir">
      <div aria-hidden="true" className="grille-fond opacity-40" />

      <div className="cadre relative z-2 pt-16 pb-10 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr]">
          {/* --- Identité et coordonnées principales --- */}
          <div>
            <Logo />
            <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-brume">
              {agence.baseline}. Enquêtes privées et commerciales, filatures et contre-mesures
              électroniques, depuis Genève, Lausanne, Montreux et Sion.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <a
                href={lienTel(agence.telephonePrincipal)}
                className="group flex items-center gap-3 text-argent transition-colors duration-200 hover:text-champagne"
              >
                <Phone aria-hidden="true" className="size-4 text-champagne" />
                <span className="text-[0.9375rem]">{agence.telephonePrincipalAffiche}</span>
              </a>
              <a
                href={`mailto:${agence.email}`}
                className="group flex items-center gap-3 text-argent transition-colors duration-200 hover:text-champagne"
              >
                <Mail aria-hidden="true" className="size-4 text-champagne" />
                <span className="text-[0.9375rem]">{agence.email}</span>
              </a>
            </div>

            <dl className="mt-7 space-y-2 text-[0.875rem]">
              <div className="flex gap-2">
                <dt className="text-brume">Accueil&nbsp;:</dt>
                <dd className="text-argent">{horaires.accueil}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-brume">Terrain&nbsp;:</dt>
                <dd className="text-argent">{horaires.terrain}</dd>
              </div>
            </dl>
          </div>

          {/* --- Plan du site --- */}
          <div className="grid gap-10 sm:grid-cols-3">
            {colonnes.map((colonne) => (
              <nav key={colonne.titre} aria-label={colonne.titre}>
                <h2 className="etiquette etiquette-nue font-mono text-etiquette">
                  {colonne.titre}
                </h2>
                <ul className="mt-5 flex flex-col gap-3">
                  {colonne.liens.map((lien) => (
                    <li key={lien.href}>
                      <Link
                        href={lien.href}
                        className="text-[0.9375rem] text-brume transition-colors duration-200 hover:text-ivoire"
                      >
                        {lien.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* --- Les quatre bureaux --- */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] sm:grid-cols-2 lg:grid-cols-4">
          {bureaux.map((bureau) => {
            const adresse = `${bureau.rue}, ${bureau.npa} ${bureau.localite}, Suisse`;
            return (
              <div key={bureau.id} className="bg-graphite p-6">
                <h3 className="font-display text-[1.0625rem] text-ivoire">{bureau.ville}</h3>
                <address className="mt-3 flex flex-col gap-2 not-italic text-[0.875rem] leading-relaxed text-brume">
                  <a
                    href={lienPlan(adresse)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 transition-colors duration-200 hover:text-champagne"
                  >
                    <MapPin
                      aria-hidden="true"
                      className="mt-0.5 size-3.5 shrink-0 text-champagne"
                    />
                    <span>
                      {bureau.rue}
                      <br />
                      {bureau.npa} {bureau.localite}
                    </span>
                  </a>
                  {bureau.telephone && bureau.telephoneAffiche && (
                    <a
                      href={lienTel(bureau.telephone)}
                      className="flex items-center gap-2 transition-colors duration-200 hover:text-champagne"
                    >
                      <Phone aria-hidden="true" className="size-3.5 shrink-0 text-champagne" />
                      <span>{bureau.telephoneAffiche}</span>
                    </a>
                  )}
                </address>
              </div>
            );
          })}
        </div>

        {/* --- Barre légale --- */}
        <div className="mt-12 flex flex-col gap-5 border-t border-[var(--trait)] pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[0.8125rem] text-brume">
            © {annee} {agence.nom}. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {navigationPied.legal.map((lien) => (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  className="text-[0.8125rem] text-brume transition-colors duration-200 hover:text-argent"
                >
                  {lien.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
