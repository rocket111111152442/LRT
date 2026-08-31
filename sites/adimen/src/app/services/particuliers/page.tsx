import type { Metadata } from 'next';

import DonneesStructurees from '@/components/DonneesStructurees';
import PageService from '@/components/PageService';
import Reveal from '@/components/Reveal';
import SectionContact from '@/components/SectionContact';
import TitreMasque from '@/components/TitreMasque';
import { universParId } from '@/content/services';
import { jsonLdFilAriane, jsonLdService, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/services/particuliers/';
const univers = universParId('particuliers');

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Services', chemin: '/services/particuliers/' },
  { nom: 'Particuliers', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Détective privé pour particuliers',
  description:
    "Filature, enquête de moralité, suspicion d'infidélité, recherche de personne : nos détectives privés établissent les faits à Genève, Lausanne, Montreux et Sion. Analyse gratuite.",
  chemin: CHEMIN,
});

export default function Particuliers() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />
      <DonneesStructurees
        donnees={jsonLdService('Enquêtes pour particuliers', univers.chapeau, CHEMIN)}
      />

      <PageService
        univers={univers}
        maillons={maillons}
        titre={['Quand le doute', 'coûte plus cher', 'que la vérité']}
      >
        <section className="section border-t border-[var(--trait)] bg-graphite">
          <div className="cadre">
            <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div>
                <p className="etiquette">Ce qu’il faut savoir</p>
                <TitreMasque
                  as="h2"
                  lignes={['Un cadre légal', 'qui protège aussi', 'vos intérêts']}
                  className="mt-6 font-display text-t2 text-ivoire"
                />
              </div>

              <Reveal>
                <div className="prose max-w-none">
                  <p>
                    Une constatation n’a de valeur que si elle a été recueillie dans les règles.
                    C’est la raison pour laquelle l’agence est agréée par le Conseil d’État à Genève
                    et pour laquelle chacun de nos agents détient l’autorisation du Département de
                    la sécurité et de l’économie. Ce cadre détermine ce que nous pouvons faire — et
                    ce que nous refusons de faire.
                  </p>

                  <h3>Ce que nous pouvons établir</h3>
                  <ul>
                    <li>
                      Des déplacements, des présences et des habitudes de vie, observés depuis des
                      lieux accessibles au public.
                    </li>
                    <li>
                      Des éléments de contexte recoupés à partir de sources ouvertes et de registres
                      consultables.
                    </li>
                    <li>
                      Des constatations photographiques et vidéo, datées et consignées dans un
                      rapport détaillé.
                    </li>
                  </ul>

                  <h3>Comment se déroule un premier échange</h3>
                  <p>
                    Le premier entretien sert à définir vos objectifs, afin d’orienter l’enquête
                    dans la bonne direction. Nous vous disons franchement ce qui nous paraît
                    faisable, ce qui ne l’est pas, et à quel coût. Cette évaluation est{' '}
                    <strong>gratuite et sans engagement</strong>.
                  </p>
                  <p>
                    Si vous décidez de poursuivre, un devis écrit fixe le périmètre et le budget
                    avant toute intervention. Pendant la mission, vous êtes informé en temps réel de
                    l’avancée et des frais engagés, et vous pouvez interrompre à tout moment.
                  </p>

                  <h3>Discrétion</h3>
                  <p>
                    Nos interventions sont conçues pour ne rien changer au quotidien de la personne
                    observée. Les informations recueillies sont conservées sur des serveurs
                    sécurisés situés en Suisse pendant toute la durée des investigations, et ne sont
                    transmises qu’à vous.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <SectionContact
          titre={['Décrivez-nous', 'votre situation']}
          chapeau="Un échange suffit souvent à y voir plus clair. Nous évaluons gratuitement ce qui peut être établi, dans quel délai et à quel coût — sans que vous vous engagiez à quoi que ce soit."
        />
      </PageService>
    </>
  );
}
