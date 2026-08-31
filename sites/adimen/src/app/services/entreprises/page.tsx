import type { Metadata } from 'next';

import DonneesStructurees from '@/components/DonneesStructurees';
import PageService from '@/components/PageService';
import Reveal from '@/components/Reveal';
import SectionContact from '@/components/SectionContact';
import TitreMasque from '@/components/TitreMasque';
import { universParId } from '@/content/services';
import { jsonLdFilAriane, jsonLdService, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/services/entreprises/';
const univers = universParId('entreprises');

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Services', chemin: '/services/particuliers/' },
  { nom: 'Entreprises', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Détective privé pour entreprises',
  description:
    "Enquêtes pré-relation d'affaires, contrôle de solvabilité, vérification de réputation, arrêts de travail suspects et dossiers d'assurance. Détectives privés agréés en Suisse romande.",
  chemin: CHEMIN,
});

/** Profils de clientèle, tels qu'annoncés par l'agence. */
const clientele = [
  'Cabinets d’avocats',
  'PME romandes',
  'Groupes nationaux et internationaux',
  'Compagnies d’assurance',
  'Régies immobilières',
  'Agences publiques',
];

export default function Entreprises() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />
      <DonneesStructurees
        donnees={jsonLdService('Enquêtes pour entreprises', univers.chapeau, CHEMIN)}
      />

      <PageService
        univers={univers}
        maillons={maillons}
        titre={['Décider sur des faits,', 'pas sur des déclarations']}
      >
        {/* ---------------- Clientèle ---------------- */}
        <section className="section-serree border-t border-[var(--trait)] bg-graphite">
          <div className="cadre">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="etiquette">Qui nous mandate</p>
                <TitreMasque
                  as="h2"
                  lignes={['Des organisations', 'qui ne peuvent pas', 'vérifier elles-mêmes']}
                  className="mt-6 font-display text-t3 text-ivoire"
                />
              </div>
              <Reveal>
                <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {clientele.map((profil) => (
                    <li key={profil} className="flex items-start gap-3">
                      <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-champagne" />
                      <span className="text-argent">{profil}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- Méthode ---------------- */}
        <section className="section border-t border-[var(--trait)]">
          <div className="cadre">
            <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div>
                <p className="etiquette">Méthode</p>
                <TitreMasque
                  as="h2"
                  lignes={['Un rapport', 'qui tient devant', 'la contradiction']}
                  className="mt-6 font-display text-t2 text-ivoire"
                />
              </div>

              <Reveal>
                <div className="prose max-w-none">
                  <p>
                    Un dossier d’entreprise se distingue rarement par la difficulté technique de
                    l’observation : il se distingue par l’usage qui en sera fait. Un rapport destiné
                    à appuyer une procédure, une résiliation ou une négociation doit résister à
                    l’examen de la partie adverse.
                  </p>

                  <h3>Cadrage préalable</h3>
                  <p>
                    Nous commençons par établir ce qui doit être démontré, et sous quelle forme. Un
                    objectif mal défini produit des heures de terrain inutilisables&nbsp;: c’est le
                    principal poste d’économie d’un dossier.
                  </p>

                  <h3>Constatations et recoupement</h3>
                  <p>
                    Les observations de terrain sont menées depuis le domaine public et croisées
                    avec les vérifications documentaires. Une information isolée n’établit
                    rien&nbsp;; un faisceau d’éléments concordants, si.
                  </p>

                  <h3>Restitution</h3>
                  <p>
                    Chaque mission se conclut par un <strong>rapport détaillé et horodaté</strong>,
                    comprenant les photographies et les vidéos recueillies. Vous êtes informé en
                    temps réel de l’avancée et des frais engagés pendant toute la durée de
                    l’enquête.
                  </p>

                  <h3>Confidentialité</h3>
                  <p>
                    Les informations sont conservées sur des serveurs sécurisés situés en Suisse.
                    Nous recevons dans nos bureaux de Genève et de Lausanne pour définir les
                    objectifs à l’abri des regards.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <SectionContact
          titre={['Exposez-nous', 'votre dossier']}
          chapeau="Nous évaluons gratuitement la faisabilité et le coût de la vérification envisagée, et vous disons si le terrain peut réellement apporter ce que vous cherchez à établir."
        />
      </PageService>
    </>
  );
}
