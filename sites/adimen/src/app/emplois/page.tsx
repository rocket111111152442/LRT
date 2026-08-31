import type { Metadata } from 'next';

import DonneesStructurees from '@/components/DonneesStructurees';
import FormulaireContact from '@/components/FormulaireContact';
import HeroPage from '@/components/HeroPage';
import Reveal from '@/components/Reveal';
import TitreMasque from '@/components/TitreMasque';
import { agence } from '@/content/site';
import { jsonLdFilAriane, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/emplois/';

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: "L'agence", chemin: '/agence/' },
  { nom: 'Emplois', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Emplois et candidatures',
  description:
    "L'agence ADIMEN recrute des collaborateurs contractuels. Formation en école de détective, permis A et B, maîtrise des outils bureautiques, OSINT et OPSEC, compétences en électronique.",
  chemin: CHEMIN,
});

/** Prérequis annoncés par l'agence. */
const prerequis = [
  {
    titre: 'Permis de conduire A et B',
    texte:
      'La conduite fait partie du métier. Le deux-roues offre en milieu urbain une souplesse que la voiture ne permet pas.',
  },
  {
    titre: 'Outils bureautiques',
    texte:
      'Maîtrise des logiciels de bureautique courants : un rapport mal construit perd une partie de sa valeur.',
  },
  {
    titre: 'OSINT et OPSEC',
    texte:
      'Recherche en sources ouvertes et sécurité opérationnelle : savoir chercher sans se signaler est une compétence à part entière.',
  },
  {
    titre: 'Électronique',
    texte:
      'Des compétences en électronique sont nécessaires, en particulier pour les missions de contre-mesures.',
  },
];

const etatEsprit = [
  'Goût de l’échange et du travail en équipe',
  'Esprit collaboratif et bienveillant',
  'Discrétion, y compris en dehors des missions',
  'Rigueur dans la consignation des constatations',
];

export default function Emplois() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />

      <HeroPage
        etiquette="Emplois"
        titre={['Rejoindre', 'une équipe', 'de terrain']}
        chapeau="L'agence recrute des collaborateurs contractuels. Si vous avez suivi une formation en école de détective et souhaitez développer vos compétences et éprouver vos connaissances sur le terrain, votre profil peut nous intéresser."
        maillons={maillons}
        decor={<div className="grille-fond opacity-40" />}
      />

      {/* ---------------- Prérequis ---------------- */}
      <section className="section">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Compétences attendues</p>
            <TitreMasque
              as="h2"
              lignes={['Ce que nous', 'regardons d’abord']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>

          <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] sm:grid-cols-2 xl:grid-cols-4">
            {prerequis.map((element, index) => (
              <li key={element.titre} className="bg-graphite">
                <Reveal retard={index * 90} className="h-full">
                  <div className="h-full p-8">
                    <span
                      aria-hidden="true"
                      className="font-mono text-[0.6875rem] tracking-[0.2em] text-champagne"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 font-display text-t4 text-ivoire">{element.titre}</h3>
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

      {/* ---------------- État d'esprit ---------------- */}
      <section className="section-serree border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="etiquette">État d’esprit</p>
              <TitreMasque
                as="h2"
                lignes={['Le terrain', 'se travaille', 'à plusieurs']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
            </div>
            <Reveal>
              <div className="prose max-w-none">
                <p>
                  Une filature ne tient jamais à un seul agent. Elle repose sur des relais, des
                  décisions prises en quelques secondes et une confiance réciproque entre des
                  personnes qui ne peuvent pas se parler longuement pendant l’action.
                </p>
                <p>
                  Nous cherchons donc des profils intéressés par l’échange et le travail d’équipe,
                  dans un esprit collaboratif et bienveillant.
                </p>
                <ul>
                  {etatEsprit.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <p>
                  Une formation en école de détective constitue une base sérieuse. Elle ne remplace
                  pas l’expérience du terrain, mais elle montre que le cadre légal du métier est
                  compris — et c’est ce cadre qui conditionne la valeur de tout ce que nous
                  recueillons.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Candidature ---------------- */}
      <section className="section border-t border-[var(--trait)]">
        <div className="cadre">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="etiquette">Candidater</p>
              <TitreMasque
                as="h2"
                lignes={['Présentez-vous', 'en quelques lignes']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
              <Reveal retard={180}>
                <p className="mt-6 max-w-md text-conduite text-argent">
                  Sélectionnez «&nbsp;Candidature&nbsp;» dans la nature de la demande. Décrivez
                  votre parcours, vos permis et les compétences techniques dont vous disposez. Nous
                  répondons à chaque candidature.
                </p>
              </Reveal>
              <Reveal retard={280}>
                <p className="mt-6 text-[0.9375rem] text-brume">
                  Vous pouvez aussi nous écrire directement à{' '}
                  <a
                    href={`mailto:${agence.email}`}
                    className="text-champagne underline underline-offset-4"
                  >
                    {agence.email}
                  </a>
                  .
                </p>
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
    </>
  );
}
