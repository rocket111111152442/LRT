import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Phone } from 'lucide-react';

import CarteImplantations from '@/components/CarteImplantations';
import HeroPage from '@/components/HeroPage';
import Reveal from '@/components/Reveal';
import SectionContact from '@/components/SectionContact';
import TitreMasque from '@/components/TitreMasque';
import { univers } from '@/content/services';
import { horaires } from '@/content/site';
import type { PageVille } from '@/content/villes';
import type { MailleFil } from '@/lib/jsonld';
import { lienPlan, lienTel } from '@/lib/utils';

/** Trame commune aux pages locales de Genève et de Lausanne. */
export default function PageLocale({
  ville,
  maillons,
}: {
  ville: PageVille;
  maillons: readonly MailleFil[];
}) {
  const { bureau } = ville;
  const adresseComplete = `${bureau.rue}, ${bureau.npa} ${bureau.localite}, Suisse`;

  return (
    <>
      <HeroPage
        etiquette={`Implantation · ${bureau.ville}`}
        titre={ville.titre}
        chapeau={ville.chapeau}
        maillons={maillons}
        decor={
          <>
            <div className="grille-fond opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_75%_25%,color-mix(in_oklab,var(--color-champagne)_13%,transparent),transparent_70%)]" />
          </>
        }
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/contact/" className="btn btn-primaire">
            Évaluer ma situation
          </Link>
          {bureau.telephone && bureau.telephoneAffiche && (
            <a href={lienTel(bureau.telephone)} className="btn btn-secondaire">
              <Phone aria-hidden="true" className="size-4" />
              {bureau.telephoneAffiche}
            </a>
          )}
        </div>
      </HeroPage>

      {/* ---------------- Coordonnées du bureau ---------------- */}
      <section className="section-serree border-b border-[var(--trait)]">
        <div className="cadre">
          <div className="carte grid gap-px overflow-hidden bg-[var(--trait)] md:grid-cols-3">
            <div className="bg-graphite p-8">
              <MapPin aria-hidden="true" className="size-4 text-champagne" />
              <h2 className="mt-4 font-mono text-[0.6875rem] tracking-[0.2em] text-brume uppercase">
                Adresse
              </h2>
              <address className="mt-3 not-italic text-argent">
                <a
                  href={lienPlan(adresseComplete)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-champagne"
                >
                  {bureau.rue}
                  <br />
                  {bureau.npa} {bureau.localite}
                </a>
              </address>
              <a
                href={lienPlan(adresseComplete)}
                target="_blank"
                rel="noopener noreferrer"
                className="lien-fleche mt-4 text-[0.875rem]"
              >
                Ouvrir dans Google Maps
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </a>
            </div>

            <div className="bg-graphite p-8">
              <Phone aria-hidden="true" className="size-4 text-champagne" />
              <h2 className="mt-4 font-mono text-[0.6875rem] tracking-[0.2em] text-brume uppercase">
                Téléphone
              </h2>
              {bureau.telephone && bureau.telephoneAffiche ? (
                <a
                  href={lienTel(bureau.telephone)}
                  className="mt-3 block font-display text-t4 text-ivoire transition-colors duration-200 hover:text-champagne"
                >
                  {bureau.telephoneAffiche}
                </a>
              ) : (
                <p className="mt-3 text-argent">Via le standard de Genève</p>
              )}
              <p className="mt-3 text-[0.875rem] text-brume">
                Toutes vos demandes sont traitées de manière strictement confidentielle.
              </p>
            </div>

            <div className="bg-graphite p-8">
              <Clock aria-hidden="true" className="size-4 text-champagne" />
              <h2 className="mt-4 font-mono text-[0.6875rem] tracking-[0.2em] text-brume uppercase">
                Disponibilité
              </h2>
              <dl className="mt-3 space-y-2 text-[0.9375rem]">
                <div>
                  <dt className="text-brume">Accueil</dt>
                  <dd className="text-argent">{horaires.accueil}</dd>
                </div>
                <div>
                  <dt className="text-brume">Terrain</dt>
                  <dd className="text-argent">{horaires.terrain}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Terrain local ---------------- */}
      <section className="section">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Le terrain</p>
            <TitreMasque
              as="h2"
              lignes={['Ce que ce terrain', 'impose à une enquête']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>

          <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] md:grid-cols-3">
            {ville.contexte.map((element, index) => (
              <li key={element.titre} className="bg-graphite">
                <Reveal retard={index * 100} className="h-full">
                  <div className="h-full p-8 lg:p-9">
                    <h3 className="font-display text-t4 text-ivoire">{element.titre}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-brume">
                      {element.texte}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Secteurs couverts ---------------- */}
      <section className="section-serree border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="etiquette">Secteurs couverts</p>
              <TitreMasque
                as="h2"
                lignes={['Depuis le bureau', `de ${bureau.ville}`]}
                className="mt-6 font-display text-t3 text-ivoire"
              />
              <Reveal retard={160}>
                <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-brume">
                  Cette liste n’est pas limitative : nos équipes interviennent sur l’ensemble du
                  territoire suisse et, via notre réseau, au-delà.
                </p>
              </Reveal>
            </div>

            <Reveal>
              <ul className="flex flex-wrap gap-2.5">
                {ville.secteurs.map((secteur) => (
                  <li
                    key={secteur}
                    className="rounded-full border border-[var(--trait)] px-4 py-2 text-[0.875rem] text-argent"
                  >
                    {secteur}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Prestations ---------------- */}
      <section className="section border-t border-[var(--trait)]">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Prestations</p>
            <TitreMasque
              as="h2"
              lignes={[`Nos interventions`, `à ${bureau.ville}`]}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {univers.map((u, index) => (
              <li key={u.id}>
                <Reveal retard={index * 90} className="h-full">
                  <Link
                    href={u.href}
                    className="carte carte-halo flex h-full flex-col p-7 transition-transform duration-400 hover:-translate-y-1"
                  >
                    <h3 className="font-display text-t4 text-ivoire">{u.label}</h3>
                    <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-brume">
                      {u.accroche}
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

      {/* ---------------- Carte ---------------- */}
      <section className="section border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Nos implantations</p>
            <TitreMasque
              as="h2"
              lignes={['Quatre bureaux', 'sur l’arc lémanique']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>
          <Reveal retard={120}>
            <div className="relative mt-12">
              <CarteImplantations />
            </div>
          </Reveal>
        </div>
      </section>

      <SectionContact
        titre={[`Un dossier`, `à ${bureau.ville} ?`]}
        chapeau="Nous évaluons gratuitement votre demande et vous indiquons ce qui peut être établi, dans quel délai et à quel coût. Aucun engagement avant votre accord écrit."
      />
    </>
  );
}
