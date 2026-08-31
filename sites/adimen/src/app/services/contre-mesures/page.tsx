import type { Metadata } from 'next';

import DonneesStructurees from '@/components/DonneesStructurees';
import PageService from '@/components/PageService';
import Reveal from '@/components/Reveal';
import SectionContact from '@/components/SectionContact';
import TitreMasque from '@/components/TitreMasque';
import { universParId } from '@/content/services';
import { jsonLdFilAriane, jsonLdService, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/services/contre-mesures/';
const univers = universParId('contre-mesures');

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Services', chemin: '/services/particuliers/' },
  { nom: 'Contre-mesures', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Contre-mesures électroniques',
  description:
    'Détection de micros, caméras espions et balises de géolocalisation. Protection des locaux professionnels, des domiciles et des véhicules par des équipes spécialisées en Suisse romande.',
  chemin: CHEMIN,
});

const lieux = [
  {
    titre: 'Locaux professionnels',
    texte:
      'Salles de réunion, bureaux de direction et espaces où se tiennent des discussions sensibles. Le balayage précède généralement une négociation ou un contentieux.',
  },
  {
    titre: 'Domiciles privés',
    texte:
      'Pièces de vie, chambres et espaces de travail à domicile. Ces demandes émanent souvent d’une séparation conflictuelle ou d’un contexte de harcèlement.',
  },
  {
    titre: 'Véhicules',
    texte:
      'Recherche de balises de géolocalisation posées à l’insu du propriétaire ou de l’utilisateur, y compris sur les véhicules de fonction.',
  },
];

export default function ContreMesures() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />
      <DonneesStructurees
        donnees={jsonLdService('Contre-mesures électroniques', univers.chapeau, CHEMIN)}
      />

      <PageService univers={univers} maillons={maillons} titre={['Savoir si vos murs', 'écoutent']}>
        {/* ---------------- Lieux ---------------- */}
        <section className="section-serree border-t border-[var(--trait)] bg-graphite">
          <div className="cadre">
            <p className="etiquette">Où nous intervenons</p>
            <ul className="mt-9 grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] md:grid-cols-3">
              {lieux.map((lieu, index) => (
                <li key={lieu.titre} className="bg-graphite">
                  <Reveal retard={index * 100} className="h-full">
                    <div className="h-full p-8">
                      <h3 className="font-display text-t4 text-ivoire">{lieu.titre}</h3>
                      <p className="mt-3 text-[0.9375rem] leading-relaxed text-brume">
                        {lieu.texte}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------- Déroulement ---------------- */}
        <section className="section border-t border-[var(--trait)]">
          <div className="cadre">
            <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div>
                <p className="etiquette">Déroulement</p>
                <TitreMasque
                  as="h2"
                  lignes={['Un balayage', 'qui ne s’annonce pas']}
                  className="mt-6 font-display text-t2 text-ivoire"
                />
              </div>

              <Reveal>
                <div className="prose max-w-none">
                  <p>
                    Une recherche de dispositifs commence par une conversation qui n’a pas lieu dans
                    le local concerné. Si celui-ci est effectivement équipé, en parler sur place
                    revient à prévenir celui qui écoute — et le matériel disparaît avant notre
                    arrivée.
                  </p>

                  <h3>Préparation</h3>
                  <p>
                    Nous convenons d’un créneau et d’un prétexte de présence plausible. L’équipe
                    intervient avec un <strong>matériel de détection de pointe</strong> et se
                    présente comme n’importe quel prestataire technique.
                  </p>

                  <h3>Inspection</h3>
                  <p>
                    Le balayage couvre les émissions radio, les alimentations et les points
                    d’installation les plus courants — mobilier, cloisons, luminaires, équipements
                    techniques. Les dispositifs de captation d’image sans émission permanente font
                    l’objet d’une recherche distincte, car ils échappent à un simple contrôle
                    fréquentiel.
                  </p>

                  <h3>Après la découverte</h3>
                  <p>
                    Trouver un dispositif ne signifie pas qu’il faille le retirer immédiatement. Sa
                    présence, son emplacement et son état constituent des éléments qu’il peut être
                    utile de faire constater avant toute manipulation. Nous en discutons avec vous
                    avant d’agir.
                  </p>

                  <h3>Contre-filature</h3>
                  <p>
                    Lorsque le soupçon porte sur un suivi physique plutôt que sur un dispositif,
                    nous déterminons si vous faites l’objet d’une filature, par qui, et selon quel
                    dispositif.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <SectionContact
          titre={['Une inquiétude', 'sur la confidentialité', 'de vos échanges ?']}
          chapeau="Appelez-nous depuis un lieu et un appareil dont vous êtes sûr. Nous convenons d'un rendez-vous en dehors du local concerné pour évaluer la situation."
        />
      </PageService>
    </>
  );
}
