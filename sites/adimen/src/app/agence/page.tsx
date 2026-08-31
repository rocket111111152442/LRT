import type { Metadata } from 'next';

import DonneesStructurees from '@/components/DonneesStructurees';
import HeroPage from '@/components/HeroPage';
import ProcessusAnime from '@/components/ProcessusAnime';
import Reveal from '@/components/Reveal';
import SectionContact from '@/components/SectionContact';
import TitreMasque from '@/components/TitreMasque';
import { expertises } from '@/content/services';
import { agence, agrements, bureaux, horaires, zonesIntervention } from '@/content/site';
import { jsonLdFilAriane, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/agence/';

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: "L'agence", chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: "L'agence",
  description:
    "Agence de détectives privés agréée par le Conseil d'État à Genève, active en Suisse romande depuis plus de dix ans. Enquêtes privées et commerciales, filatures, contre-mesures.",
  chemin: CHEMIN,
});

export default function Agence() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />

      <HeroPage
        etiquette="L’agence"
        titre={['Une agence de terrain,', 'pas un cabinet', 'de conseil']}
        chapeau={`ADIMEN est une agence de détectives privés active en Suisse romande, spécialisée dans les enquêtes privées et commerciales. Plus de ${agence.anneesExperience} ans d’expérience de terrain, quatre implantations et un réseau international de correspondants.`}
        maillons={maillons}
        decor={<div className="grille-fond opacity-50" />}
      />

      {/* ---------------- Récit ---------------- */}
      <section className="section">
        <div className="cadre">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="etiquette">Notre métier</p>
              <TitreMasque
                as="h2"
                lignes={['Le renseignement privé', 'n’est pas', 'une intuition']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
            </div>

            <Reveal>
              <div className="prose max-w-none">
                <p>
                  On nous appelle rarement pour confirmer une certitude. On nous appelle parce
                  qu’une situation est devenue illisible : un comportement qui change, un partenaire
                  dont le discours ne concorde plus avec les faits, un arrêt de travail dont la
                  réalité fait doute, une inquiétude familiale qu’aucune conversation ne dissipe.
                </p>
                <p>
                  Dans tous ces cas, la difficulté n’est pas de deviner. Elle est de{' '}
                  <strong>distinguer ce que l’on croit de ce que l’on peut démontrer</strong>. C’est
                  le seul objet de notre travail.
                </p>

                <h2>Un cadre, avant une technique</h2>
                <p>
                  L’agence est agréée par le Conseil d’État à Genève, et chacun de ses agents est
                  titulaire de l’autorisation délivrée par le Département de la sécurité et de
                  l’économie. Ce cadre n’est pas décoratif : il détermine ce qui peut être
                  recueilli, comment, et donc ce qui restera exploitable ensuite. Une constatation
                  obtenue en dehors des règles n’a aucune valeur — elle peut même se retourner
                  contre celui qui l’a commandée.
                </p>

                <h2>Une équipe de terrain</h2>
                <p>
                  Nos agents disposent d’une expérience spécifique en vidéo-surveillance, en
                  infiltration et en détection de caméras et de micros espions. Ces compétences ne
                  se lisent pas dans un catalogue : elles se mesurent au fait qu’une filature de
                  plusieurs jours ne soit jamais remarquée, et qu’une image reste exploitable malgré
                  la distance et la faible lumière.
                </p>

                <h2>Une couverture régionale, un réseau mondial</h2>
                <p>
                  Quatre bureaux couvrent l’arc lémanique et le Valais. Au-delà, nous nous appuyons
                  sur un réseau de collaborateurs issus du monde du renseignement et du droit, ce
                  qui permet de poursuivre une enquête en {zonesIntervention.slice(1).join(', ')}.
                </p>

                <h2>Ce que nous ne faisons pas</h2>
                <p>
                  Nous n’acceptons pas les missions dont l’objet est le contrôle permanent d’une
                  personne, ni celles qui visent uniquement à alimenter un conflit. Nous le disons
                  dès le premier entretien, y compris lorsque cela nous conduit à refuser un
                  dossier.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Repères ---------------- */}
      <section className="section-serree border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <dl className="grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                cle: 'Expérience',
                valeur: `${agence.anneesExperience}+`,
                detail: 'années de terrain',
              },
              {
                cle: 'Implantations',
                valeur: String(bureaux.length),
                detail: 'bureaux en Suisse romande',
              },
              { cle: 'Accueil', valeur: '8 – 20 h', detail: 'du lundi au vendredi' },
              { cle: 'Terrain', valeur: '24 / 7', detail: 'capacité d’intervention' },
            ].map((repere, index) => (
              <div key={repere.cle} className="bg-graphite p-8">
                <Reveal retard={index * 80}>
                  <dt className="font-mono text-[0.6875rem] tracking-[0.2em] text-champagne uppercase">
                    {repere.cle}
                  </dt>
                  <dd className="mt-4 font-display text-t2 leading-none text-ivoire">
                    {repere.valeur}
                  </dd>
                  <dd className="mt-2 text-[0.875rem] text-brume">{repere.detail}</dd>
                </Reveal>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------- Compétences ---------------- */}
      <section className="section border-t border-[var(--trait)]">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Compétences</p>
            <TitreMasque
              as="h2"
              lignes={['Ce que nos équipes', 'savent faire']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>

          <ul className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {expertises.map((expertise, index) => (
              <li key={expertise.titre}>
                <Reveal retard={(index % 3) * 90}>
                  <h3 className="border-l border-[color-mix(in_oklab,var(--color-champagne)_50%,transparent)] pl-5 font-display text-t4 text-ivoire">
                    {expertise.titre}
                  </h3>
                  <p className="mt-3 pl-5 text-[0.9375rem] leading-relaxed text-brume">
                    {expertise.texte}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Agréments ---------------- */}
      <section className="section-serree border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="etiquette">Cadre légal</p>
              <TitreMasque
                as="h2"
                lignes={['Autorisations', 'et agréments']}
                className="mt-6 font-display text-t3 text-ivoire"
              />
            </div>
            <ul className="grid gap-8 sm:grid-cols-2">
              {agrements.map((agrement, index) => (
                <li key={agrement.titre}>
                  <Reveal retard={index * 100}>
                    <h3 className="font-display text-t4 text-ivoire">{agrement.titre}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-brume">
                      {agrement.detail}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- Processus ---------------- */}
      <section className="section border-t border-[var(--trait)]">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Déroulement d’une mission</p>
            <TitreMasque
              as="h2"
              lignes={['Quatre étapes,', 'aucune zone d’ombre']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
            <Reveal retard={180}>
              <p className="mt-6 text-conduite text-argent">
                {horaires.accueil} pour l’accueil et la prise de rendez-vous ; nos équipes
                interviennent sur le terrain {horaires.terrain.toLowerCase()}.
              </p>
            </Reveal>
          </div>
          <div className="mt-14">
            <ProcessusAnime />
          </div>
        </div>
      </section>

      <SectionContact variante="rappel" />
    </>
  );
}
