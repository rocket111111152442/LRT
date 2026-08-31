import type { Metadata } from 'next';

import Carte3D from '@/components/Carte3D';
import DonneesStructurees from '@/components/DonneesStructurees';
import HeroPage from '@/components/HeroPage';
import Reveal from '@/components/Reveal';
import SectionContact from '@/components/SectionContact';
import TitreMasque from '@/components/TitreMasque';
import { garanties } from '@/content/services';
import { jsonLdFilAriane, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/garanties/';

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Nos garanties', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Nos garanties',
  description:
    "Discrétion, cadre légal, rapports détaillés et horodatés, données conservées sur des serveurs sécurisés en Suisse. Les engagements de l'agence ADIMEN, détectives privés agréés.",
  chemin: CHEMIN,
});

export default function Garanties() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />

      <HeroPage
        etiquette="Nos garanties"
        titre={['Des engagements', 'vérifiables']}
        chapeau="Une agence d'investigation se juge à ce qu'elle s'interdit autant qu'à ce qu'elle promet. Voici, précisément, ce sur quoi nous nous engageons — et ce que cela implique concrètement pour votre dossier."
        maillons={maillons}
        decor={
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_70%_25%,color-mix(in_oklab,var(--color-champagne)_26%,transparent),transparent_68%)]" />
        }
      />

      {/* ---------------- Les six garanties ---------------- */}
      <section className="section">
        <div className="cadre">
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {garanties.map((garantie, index) => (
              <li key={garantie.titre}>
                <Reveal retard={(index % 3) * 100} className="h-full">
                  <Carte3D className="h-full">
                    <article className="flex h-full flex-col p-8 lg:p-9">
                      <span
                        aria-hidden="true"
                        className="font-mono text-[0.6875rem] tracking-[0.2em] text-champagne"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h2 className="mt-4 font-display text-t3 text-ivoire">{garantie.titre}</h2>
                      <p className="mt-4 leading-relaxed text-brume">{garantie.texte}</p>
                    </article>
                  </Carte3D>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Portée juridique ---------------- */}
      <section className="section border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="etiquette">Portée de nos rapports</p>
              <TitreMasque
                as="h2"
                lignes={['Ce qu’un rapport', 'peut — et ne peut pas —', 'établir']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
            </div>

            <Reveal>
              <div className="prose max-w-none">
                <p>
                  Nos missions se concluent par un <strong>rapport détaillé et horodaté</strong>,
                  comprenant les photographies et les vidéos des éléments recueillis au cours de
                  l’enquête. Ce document est conçu pour être lu par un tiers : un avocat, un
                  assureur, une direction.
                </p>

                <h3>Une pièce, pas un verdict</h3>
                <p>
                  Un rapport d’investigation est une pièce parmi d’autres. Il rapporte des
                  constatations datées et documentées&nbsp;; il n’établit pas à lui seul une
                  qualification juridique, et l’appréciation de sa portée revient à l’autorité ou à
                  la juridiction saisie. Nous ne promettons donc jamais un résultat procédural : ce
                  serait s’avancer sur un terrain qui n’est pas le nôtre.
                </p>

                <h3>La méthode conditionne la valeur</h3>
                <p>
                  C’est précisément parce que la recevabilité dépend des conditions de recueil que
                  nous travaillons dans le cadre de l’agrément du Conseil d’État et des
                  autorisations du Département de la sécurité et de l’économie. Une constatation
                  obtenue autrement fragiliserait le dossier qu’elle prétend soutenir.
                </p>

                <h3>Ce que nous vous disons avant de commencer</h3>
                <ul>
                  <li>Ce qui nous paraît matériellement établissable, et ce qui ne l’est pas.</li>
                  <li>Le temps et les moyens que cela suppose, et donc le budget.</li>
                  <li>Les limites de ce que le rapport pourra démontrer.</li>
                </ul>
                <p>
                  Cette évaluation est gratuite et sans engagement. Il nous arrive de conclure
                  qu’une investigation ne servirait à rien&nbsp;: nous le disons alors clairement,
                  plutôt que d’ouvrir un dossier sans perspective.
                </p>

                <h3>Confidentialité et conservation</h3>
                <p>
                  Toutes vos demandes sont traitées de manière strictement confidentielle dès le
                  premier échange. Les informations recueillies et transmises sont conservées sur
                  des <strong>serveurs sécurisés situés en Suisse</strong> pendant toute la durée
                  des investigations.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionContact variante="rappel" />
    </>
  );
}
