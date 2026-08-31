import type { Metadata } from 'next';

import DonneesStructurees from '@/components/DonneesStructurees';
import PageService from '@/components/PageService';
import Reveal from '@/components/Reveal';
import SectionContact from '@/components/SectionContact';
import TitreMasque from '@/components/TitreMasque';
import { universParId } from '@/content/services';
import { jsonLdFilAriane, jsonLdService, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/services/parents/';
const univers = universParId('parents');

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Services', chemin: '/services/particuliers/' },
  { nom: 'Parents', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Services aux parents',
  description:
    "Comprendre l'environnement réel d'un adolescent : fréquentations, exposition à l'alcool ou aux stupéfiants. Accompagnement discret des familles par des détectives privés agréés.",
  chemin: CHEMIN,
});

export default function Parents() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />
      <DonneesStructurees
        donnees={jsonLdService('Accompagnement des familles', univers.chapeau, CHEMIN)}
      />

      <PageService
        univers={univers}
        maillons={maillons}
        titre={['Savoir, pour', 'pouvoir aider', 'à temps']}
      >
        <section className="section border-t border-[var(--trait)] bg-graphite">
          <div className="cadre">
            <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
              <div>
                <p className="etiquette">Notre position</p>
                <TitreMasque
                  as="h2"
                  lignes={['Documenter un contexte,', 'pas surveiller', 'un enfant']}
                  className="mt-6 font-display text-t2 text-ivoire"
                />
              </div>

              <Reveal>
                <div className="prose max-w-none">
                  <p>
                    Les parents qui nous appellent ont presque toujours le même point de départ : un
                    changement de comportement qu’ils constatent sans parvenir à l’expliquer. Le
                    dialogue s’est refermé, les réponses ne concordent plus, et l’inquiétude
                    s’installe sans qu’aucun fait ne vienne la confirmer ni la lever.
                  </p>
                  <p>
                    Notre rôle s’arrête là où commence le vôtre. Nous établissons un contexte —
                    l’entourage réel, les lieux fréquentés, une éventuelle exposition à l’alcool ou
                    aux stupéfiants — et vous le restituons. Ce que vous en faites relève de votre
                    responsabilité de parent, et nous n’avons pas vocation à nous y substituer.
                  </p>

                  <h3>Ce que nous refusons</h3>
                  <p>
                    Nous n’acceptons pas les demandes dont l’objet est le contrôle permanent d’un
                    mineur, ni celles qui visent à alimenter un conflit entre parents séparés. Une
                    mission a un objet précis et une fin&nbsp;; à défaut, nous le disons dès le
                    premier entretien.
                  </p>

                  <h3>Discrétion vis-à-vis de l’adolescent</h3>
                  <p>
                    Nos interventions sont conçues pour rester invisibles. Un adolescent qui se
                    découvrirait observé perdrait la confiance qu’il vous reste, et la démarche
                    aurait alors produit l’inverse de son but.
                  </p>

                  <h3>Restitution</h3>
                  <p>
                    Vous recevez un <strong>rapport détaillé et horodaté</strong> réunissant les
                    constatations. Nous prenons le temps de le commenter avec vous&nbsp;: un
                    document brut, dans ces situations, se lit rarement seul.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <SectionContact
          titre={['Parlons-en', 'avant d’aller plus loin']}
          chapeau="Un premier échange, gratuit et confidentiel, permet souvent de mesurer si une intervention est justifiée — et, le cas échéant, de vous orienter autrement."
        />
      </PageService>
    </>
  );
}
