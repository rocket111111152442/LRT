import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';

import CarteImplantations from '@/components/CarteImplantations';
import DonneesStructurees from '@/components/DonneesStructurees';
import FormulaireContact from '@/components/FormulaireContact';
import HeroPage from '@/components/HeroPage';
import Reveal from '@/components/Reveal';
import TitreMasque from '@/components/TitreMasque';
import { agence, bureaux, horaires } from '@/content/site';
import { jsonLdFilAriane, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';
import { lienPlan, lienTel } from '@/lib/utils';

const CHEMIN = '/contact/';

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Contact', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Contact',
  description: `Contactez l'agence ADIMEN : ${agence.telephonePrincipalAffiche}, ${agence.email}. Bureaux à Genève, Lausanne, Montreux et Sion. Évaluation gratuite, échanges strictement confidentiels.`,
  chemin: CHEMIN,
});

export default function Contact() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />

      <HeroPage
        etiquette="Contact"
        titre={['Un premier échange,', 'sans engagement']}
        chapeau="Décrivez-nous votre situation. Nous évaluons gratuitement ce qui peut être établi, dans quel délai et à quel coût. Toutes vos demandes sont traitées de manière strictement confidentielle, dès le premier message."
        maillons={maillons}
        decor={
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_72%_25%,color-mix(in_oklab,var(--color-champagne)_24%,transparent),transparent_70%)]" />
        }
      />

      {/* ---------------- Accès directs ---------------- */}
      <section className="section-serree border-b border-[var(--trait)]">
        <div className="cadre">
          <div className="grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] md:grid-cols-3">
            <a
              href={lienTel(agence.telephonePrincipal)}
              className="group bg-graphite p-8 transition-colors duration-300 hover:bg-ardoise"
            >
              <Phone aria-hidden="true" className="size-4 text-champagne" />
              <h2 className="mt-4 font-mono text-[0.6875rem] tracking-[0.2em] text-brume uppercase">
                Par téléphone
              </h2>
              <p className="mt-3 font-display text-t3 text-ivoire transition-colors duration-300 group-hover:text-champagne">
                {agence.telephonePrincipalAffiche}
              </p>
              <p className="mt-2 text-[0.875rem] text-brume">{horaires.accueil}</p>
            </a>

            <a
              href={`mailto:${agence.email}`}
              className="group bg-graphite p-8 transition-colors duration-300 hover:bg-ardoise"
            >
              <Mail aria-hidden="true" className="size-4 text-champagne" />
              <h2 className="mt-4 font-mono text-[0.6875rem] tracking-[0.2em] text-brume uppercase">
                Par e-mail
              </h2>
              <p className="mt-3 break-all font-display text-t4 text-ivoire transition-colors duration-300 group-hover:text-champagne">
                {agence.email}
              </p>
              <p className="mt-2 text-[0.875rem] text-brume">Réponse sous un jour ouvrable</p>
            </a>

            <div className="bg-graphite p-8">
              <Clock aria-hidden="true" className="size-4 text-champagne" />
              <h2 className="mt-4 font-mono text-[0.6875rem] tracking-[0.2em] text-brume uppercase">
                Sur le terrain
              </h2>
              <p className="mt-3 font-display text-t3 text-ivoire">{horaires.terrain}</p>
              <p className="mt-2 text-[0.875rem] text-brume">
                Capacité d’intervention de nos équipes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Formulaire ---------------- */}
      <section className="section">
        <div className="cadre">
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="etiquette">Formulaire</p>
              <TitreMasque
                as="h2"
                lignes={['Décrivez-nous', 'votre situation']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
              <Reveal retard={180}>
                <p className="mt-6 leading-relaxed text-argent">
                  Plus votre description est précise, plus notre réponse le sera. Vous n’avez pas
                  besoin de tout détailler par écrit&nbsp;: l’essentiel est que nous comprenions ce
                  que vous cherchez à établir.
                </p>
              </Reveal>

              <Reveal retard={280}>
                <ul className="mt-8 flex flex-col gap-4 border-t border-[var(--trait)] pt-7">
                  {[
                    'Aucun dossier n’est ouvert sans votre accord écrit',
                    'L’évaluation initiale est gratuite',
                    'Vos données sont conservées sur des serveurs en Suisse',
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <ShieldCheck
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-champagne"
                      />
                      <span className="text-[0.9375rem] text-argent">{point}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal retard={140}>
              <div className="carte p-7 lg:p-10">
                <FormulaireContact />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Bureaux ---------------- */}
      <section className="section border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Nos bureaux</p>
            <TitreMasque
              as="h2"
              lignes={['Quatre adresses', 'en Suisse romande']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>

          <ul className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] sm:grid-cols-2 xl:grid-cols-4">
            {bureaux.map((bureau, index) => {
              const adresse = `${bureau.rue}, ${bureau.npa} ${bureau.localite}, Suisse`;
              return (
                <li key={bureau.id} className="bg-graphite">
                  <Reveal retard={index * 80} className="h-full">
                    <div className="flex h-full flex-col p-8">
                      <h3 className="font-display text-t3 text-ivoire">{bureau.ville}</h3>
                      <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-brume">
                        {bureau.intro}
                      </p>
                      <address className="mt-5 flex flex-col gap-2.5 not-italic text-[0.875rem]">
                        <a
                          href={lienPlan(adresse)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 text-argent transition-colors duration-200 hover:text-champagne"
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
                            className="flex items-center gap-2 text-argent transition-colors duration-200 hover:text-champagne"
                          >
                            <Phone
                              aria-hidden="true"
                              className="size-3.5 shrink-0 text-champagne"
                            />
                            <span>{bureau.telephoneAffiche}</span>
                          </a>
                        )}
                      </address>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ul>

          <Reveal retard={120}>
            <div className="relative mt-14">
              <CarteImplantations />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
