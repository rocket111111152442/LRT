import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Building2, Globe2, ShieldCheck, User } from 'lucide-react';

import BoutonMagnetique from '@/components/BoutonMagnetique';
import Carte3D from '@/components/Carte3D';
import CarteImplantations from '@/components/CarteImplantations';
import HeroAccueil from '@/components/HeroAccueil';
import Parallaxe from '@/components/Parallaxe';
import ProcessusAnime from '@/components/ProcessusAnime';
import Reveal from '@/components/Reveal';
import SectionContact from '@/components/SectionContact';
import SectionMedias from '@/components/SectionMedias';
import SectionReseau from '@/components/SectionReseau';
import TitreMasque from '@/components/TitreMasque';
import { expertises, garanties, universParId } from '@/content/services';
import { agence, agrements, tarifs } from '@/content/site';
import { construireMeta } from '@/lib/seo';

export const metadata: Metadata = construireMeta({
  titre: `${agence.nom} — Détectives privés à Genève et en Suisse romande`,
  description:
    "Agence de détectives privés agréée par le Conseil d'État à Genève. Filatures, enquêtes privées et commerciales, contre-mesures électroniques. Genève, Lausanne, Montreux, Sion. Analyse gratuite.",
  chemin: '/',
});

/* Les trois portes d'entrée de la page d'accueil. Les deux premières reprennent
   l'accroche déjà rédigée dans le fichier de contenu, la troisième mène au
   réseau international. */
const acces = [
  { ...universParId('particuliers'), icone: User, titre: 'Particuliers' },
  { ...universParId('entreprises'), icone: Building2, titre: 'Entreprises' },
  {
    id: 'international',
    href: '/reseau-international/',
    icone: Globe2,
    titre: 'International',
    accroche:
      'Prolonger une enquête au-delà de la frontière, en Europe, au Canada et aux États-Unis.',
  },
];

export default function Accueil() {
  return (
    <>
      <HeroAccueil />

      {/* ==================== L'agence en bref ==================== */}
      <section className="section relative border-t border-[var(--trait)]">
        <div className="cadre">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="etiquette">L’agence</p>
              <TitreMasque
                as="h2"
                lignes={['Le renseignement privé', 'exige de la méthode']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
            </div>

            <div>
              <Reveal>
                <p className="text-conduite text-argent">
                  ADIMEN est une agence de détectives privés active en Suisse romande, spécialisée
                  dans les enquêtes privées et commerciales. Plus de {agence.anneesExperience} ans
                  de terrain ont façonné une manière de travailler : comprendre d’abord ce qui doit
                  être établi, engager ensuite les moyens strictement nécessaires, et restituer des
                  éléments matériels — pas des impressions.
                </p>
              </Reveal>

              <Reveal retard={140}>
                <p className="mt-6 text-argent">
                  L’agence est agréée par le Conseil d’État à Genève et chacun de ses agents est
                  titulaire de l’autorisation du Département de la sécurité et de l’économie. Ce
                  cadre n’est pas un argument commercial : il conditionne la recevabilité de ce que
                  nous recueillons.
                </p>
              </Reveal>

              <Reveal retard={240}>
                <ul className="mt-9 grid gap-5 sm:grid-cols-2">
                  {agrements.map((agrement) => (
                    <li
                      key={agrement.titre}
                      className="border-l border-[color-mix(in_oklab,var(--color-champagne)_45%,transparent)] pl-5"
                    >
                      <h3 className="font-display text-[1.0625rem] text-ivoire">
                        {agrement.titre}
                      </h3>
                      <p className="mt-2 text-[0.875rem] leading-relaxed text-brume">
                        {agrement.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal retard={320}>
                <Link href="/agence/" className="lien-fleche mt-9 inline-flex">
                  Découvrir l’agence
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Trois accès ==================== */}
      <section className="section-serree relative border-t border-[var(--trait)] bg-graphite pb-20">
        <div className="cadre">
          <Reveal>
            <p className="etiquette">Par où commencer</p>
          </Reveal>

          <div className="mt-9 grid gap-6 lg:grid-cols-3">
            {acces.map((acce, index) => {
              const Icone = acce.icone;
              return (
                <Reveal key={acce.id} retard={index * 110}>
                  <Carte3D className="h-full">
                    <Link href={acce.href} className="flex h-full flex-col p-8 lg:p-10">
                      <Icone aria-hidden="true" className="size-6 text-champagne" />
                      <h2 className="mt-6 font-display text-t3 text-ivoire">{acce.titre}</h2>
                      <p className="mt-4 flex-1 leading-relaxed text-brume">{acce.accroche}</p>
                      <span className="lien-fleche mt-8">
                        Voir les prestations
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </span>
                    </Link>
                  </Carte3D>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== Domaines d'expertise ==================== */}
      <section className="section relative overflow-hidden border-t border-[var(--trait)]">
        <div aria-hidden="true" className="grille-fond opacity-40" />

        <div className="cadre relative z-2">
          <div className="max-w-2xl">
            <p className="etiquette">Savoir-faire</p>
            <TitreMasque
              as="h2"
              lignes={['Six compétences', 'qui ne s’improvisent pas']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
            <Reveal retard={180}>
              <p className="mt-6 text-conduite text-argent">
                Une filature réussie ne se voit pas. Une enquête solide tient à la qualité du
                recoupement. Ces deux exigences commandent tout le reste.
              </p>
            </Reveal>
          </div>

          <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] sm:grid-cols-2 lg:grid-cols-3">
            {expertises.map((expertise, index) => (
              <li key={expertise.titre} className="group relative bg-graphite">
                <Reveal retard={(index % 3) * 90} className="h-full">
                  <div className="flex h-full flex-col p-8 transition-colors duration-500 group-hover:bg-ardoise lg:p-9">
                    <span
                      aria-hidden="true"
                      className="font-mono text-[0.6875rem] tracking-[0.2em] text-acier-clair transition-colors duration-500 group-hover:text-champagne"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 font-display text-t4 text-ivoire">{expertise.titre}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-brume">
                      {expertise.texte}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ==================== Filature, enquête, contre-mesures ==================== */}
      <section className="section relative overflow-hidden border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="etiquette">Trois métiers, un même dossier</p>
              <TitreMasque
                as="h2"
                lignes={['Observer, recouper,', 'puis protéger']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
              <Reveal retard={180}>
                <p className="mt-6 max-w-md text-conduite text-argent">
                  La plupart des dossiers mobilisent ces trois registres. Ils se complètent&nbsp;:
                  ce que la filature constate, l’enquête l’explique&nbsp;; ce que les contre-mesures
                  révèlent change parfois la lecture de l’ensemble.
                </p>
              </Reveal>
              <Reveal retard={280}>
                <BoutonMagnetique href="/services/particuliers/" className="btn-secondaire mt-9">
                  Voir tous les services
                  <ArrowRight aria-hidden="true" className="size-4" />
                </BoutonMagnetique>
              </Reveal>
            </div>

            <Parallaxe amplitude={54}>
              <div className="flex flex-col gap-5">
                {[
                  {
                    titre: 'La filature',
                    texte:
                      "Suivre une personne sur la durée sans être détecté suppose une équipe, des relais et une préparation. C'est ce qui sépare une observation exploitable d'une intuition invérifiable.",
                  },
                  {
                    titre: 'L’enquête',
                    texte:
                      "Croiser sources ouvertes, registres accessibles et constatations de terrain jusqu'à obtenir un faisceau cohérent. Une information isolée ne prouve rien ; un recoupement, si.",
                  },
                  {
                    titre: 'Les contre-mesures',
                    texte:
                      "Détecter micros, caméras et balises posés à votre insu. Cette recherche précède souvent le reste : il faut savoir si l'on est écouté avant de décider quoi que ce soit.",
                  },
                ].map((bloc, index) => (
                  <Reveal key={bloc.titre} retard={index * 120}>
                    <article className="carte p-8 lg:p-10">
                      <h3 className="font-display text-t3 text-ivoire">{bloc.titre}</h3>
                      <p className="mt-4 leading-relaxed text-brume">{bloc.texte}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </Parallaxe>
          </div>
        </div>
      </section>

      {/* ==================== Processus ==================== */}
      <section className="section relative border-t border-[var(--trait)]">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Comment se déroule une mission</p>
            <TitreMasque
              as="h2"
              lignes={['Quatre étapes,', 'aucune zone d’ombre']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
            <Reveal retard={180}>
              <p className="mt-6 text-conduite text-argent">
                Vous êtes informé en temps réel de l’avancée de l’enquête et des frais engagés. À
                tout moment, vous pouvez dire «&nbsp;stop&nbsp;».
              </p>
            </Reveal>
          </div>

          <div className="mt-14">
            <ProcessusAnime />
          </div>
        </div>
      </section>

      {/* ==================== Garanties ==================== */}
      <section className="section relative overflow-hidden border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="etiquette">Nos garanties</p>
              <TitreMasque
                as="h2"
                lignes={['Ce sur quoi', 'nous nous engageons']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
              <Reveal retard={200}>
                <Link href="/garanties/" className="lien-fleche mt-8 inline-flex">
                  Le détail de nos engagements
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Reveal>
            </div>

            <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
              {garanties.map((garantie, index) => (
                <li key={garantie.titre}>
                  <Reveal retard={(index % 2) * 90}>
                    <div className="flex items-start gap-4">
                      <ShieldCheck
                        aria-hidden="true"
                        className="mt-1 size-4 shrink-0 text-champagne"
                      />
                      <div>
                        <h3 className="font-display text-t4 text-ivoire">{garantie.titre}</h3>
                        <p className="mt-2 text-[0.9375rem] leading-relaxed text-brume">
                          {garantie.texte}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ==================== Tarifs ==================== */}
      <section className="section relative border-t border-[var(--trait)]">
        <div className="cadre">
          <div className="carte grain relative overflow-hidden p-9 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <p className="etiquette">Tarifs</p>
                <TitreMasque
                  as="h2"
                  lignes={['Un budget', 'que vous maîtrisez']}
                  className="mt-6 font-display text-t2 text-ivoire"
                />
                <Reveal retard={180}>
                  <p className="mt-6 max-w-md leading-relaxed text-argent">
                    Pour les enquêtes et les filatures, nos honoraires se situent entre{' '}
                    <strong className="text-ivoire">
                      {tarifs.devise} {tarifs.min}
                    </strong>{' '}
                    et{' '}
                    <strong className="text-ivoire">
                      {tarifs.devise} {tarifs.max} {tarifs.unite}
                    </strong>
                    . Le montant dépend de la complexité du dossier, du temps consacré et des
                    ressources humaines et techniques nécessaires. Les recherches administratives
                    font l’objet d’un forfait.
                  </p>
                </Reveal>
                <Reveal retard={280}>
                  <Link href="/tarifs/" className="lien-fleche mt-8 inline-flex">
                    Comment nous établissons un devis
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Reveal>
              </div>

              <Reveal retard={160}>
                <div className="flex h-full flex-col justify-center">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[0.75rem] tracking-[0.2em] text-brume uppercase">
                      {tarifs.devise}
                    </span>
                    <span className="font-display text-affiche leading-none text-ivoire">
                      {tarifs.min}
                    </span>
                    <span className="font-display text-t2 text-acier-clair">–</span>
                    <span className="font-display text-affiche leading-none text-champagne">
                      {tarifs.max}
                    </span>
                  </div>
                  <p className="mt-4 font-mono text-[0.75rem] tracking-[0.18em] text-brume uppercase">
                    {tarifs.unite}
                  </p>
                  <hr className="trait-horizontal my-8" />
                  <ul className="flex flex-col gap-3.5">
                    {[
                      'Analyse et étude de faisabilité gratuites',
                      'Devis écrit avant toute intervention',
                      'Suivi en temps réel des frais engagés',
                      'Forfait pour les recherches administratives',
                    ].map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2.5 h-px w-3 shrink-0 bg-champagne"
                        />
                        <span className="text-[0.9375rem] text-argent">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Implantations ==================== */}
      <section className="section relative overflow-hidden border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Implantations</p>
            <TitreMasque
              as="h2"
              lignes={['De la rade de Genève', 'à la vallée du Rhône']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
            <Reveal retard={180}>
              <p className="mt-6 text-conduite text-argent">
                Quatre bureaux couvrent l’arc lémanique et le Valais. Cette implantation raccourcit
                les délais de mise en place : sur une filature, les premières heures décident
                souvent du reste.
              </p>
            </Reveal>
          </div>

          <Reveal retard={120}>
            <div className="relative mt-14">
              <CarteImplantations />
            </div>
          </Reveal>
        </div>
      </section>

      <SectionMedias />
      <SectionReseau />
      <SectionContact />
    </>
  );
}
