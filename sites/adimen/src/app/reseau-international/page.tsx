import type { Metadata } from 'next';

import DonneesStructurees from '@/components/DonneesStructurees';
import HeroPage from '@/components/HeroPage';
import Reveal from '@/components/Reveal';
import SectionContact from '@/components/SectionContact';
import SectionReseau from '@/components/SectionReseau';
import TitreMasque from '@/components/TitreMasque';
import { zonesIntervention } from '@/content/site';
import { jsonLdFilAriane, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/reseau-international/';

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Implantations', chemin: '/detective-geneve/' },
  { nom: 'Réseau international', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Réseau international de détectives privés',
  description:
    'Un réseau de correspondants issus du renseignement et du droit, en Europe, au Canada et aux États-Unis. Filatures, recherches de personne et vérifications au-delà des frontières suisses.',
  chemin: CHEMIN,
});

const usages = [
  {
    titre: 'Recherche de personne à l’étranger',
    texte:
      'Un débiteur, un proche perdu de vue ou une personne disparue quitte rarement le pays sans laisser de trace exploitable. Nos correspondants prennent le relais là où la piste conduit.',
  },
  {
    titre: 'Filature transfrontalière',
    texte:
      "Une observation qui s'arrêterait à la frontière laisserait le dossier incomplet — un point sensible dans la région genevoise, où une part des trajets quotidiens franchit la douane.",
  },
  {
    titre: 'Vérification avant engagement',
    texte:
      "Contrôler la réalité d'une structure, l'identité de ses dirigeants ou la cohérence de son activité déclarée, lorsque celle-ci se situe hors de Suisse.",
  },
  {
    titre: 'Suivi de dossiers d’assurance',
    texte:
      "Poursuivre un dossier lorsque l'assuré réside ou séjourne à l'étranger, avec les mêmes exigences de méthode que sur le territoire suisse.",
  },
];

export default function ReseauInternational() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />

      <HeroPage
        etiquette="Réseau international"
        titre={['Une enquête', 'ne s’arrête pas', 'à la frontière']}
        chapeau="Nos détectives disposent d'un réseau étendu à l'étranger, constitué de collaborateurs issus du monde du renseignement et du droit. Il permet de conduire une investigation, une surveillance ou une recherche au-delà des frontières suisses, avec la même méthode et le même cadre de restitution."
        maillons={maillons}
        decor={
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_68%_28%,color-mix(in_oklab,var(--color-argent)_18%,transparent),transparent_70%)]" />
        }
      />

      {/* ---------------- Zones ---------------- */}
      <section className="section-serree border-b border-[var(--trait)]">
        <div className="cadre">
          <p className="etiquette">Zones d’intervention</p>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] sm:grid-cols-2 xl:grid-cols-4">
            {zonesIntervention.map((zone, index) => (
              <li key={zone} className="bg-graphite p-8">
                <Reveal retard={index * 80}>
                  <span
                    aria-hidden="true"
                    className="font-mono text-[0.6875rem] tracking-[0.2em] text-champagne"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="mt-4 font-display text-t4 text-ivoire">{zone}</h2>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Globe ---------------- */}
      <SectionReseau />

      {/* ---------------- Cas d'usage ---------------- */}
      <section className="section border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Quand le réseau intervient</p>
            <TitreMasque
              as="h2"
              lignes={['Quatre situations', 'où la frontière', 'devient un obstacle']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2">
            {usages.map((usage, index) => (
              <li key={usage.titre}>
                <Reveal retard={(index % 2) * 100} className="h-full">
                  <article className="carte h-full p-8 lg:p-9">
                    <h3 className="font-display text-t3 text-ivoire">{usage.titre}</h3>
                    <p className="mt-4 leading-relaxed text-brume">{usage.texte}</p>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Fonctionnement ---------------- */}
      <section className="section border-t border-[var(--trait)]">
        <div className="cadre">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="etiquette">Fonctionnement</p>
              <TitreMasque
                as="h2"
                lignes={['Un seul', 'interlocuteur,', 'où que soit', 'le terrain']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
            </div>

            <Reveal>
              <div className="prose max-w-none">
                <p>
                  Faire appel à un correspondant étranger ne signifie pas transmettre un dossier et
                  attendre. La coordination reste à Genève : c’est de là que le périmètre est
                  défini, que les constatations sont contrôlées et que le rapport est assemblé.
                </p>

                <h3>Un cadre commun</h3>
                <p>
                  Chaque juridiction pose ses propres règles sur ce qui peut être recueilli et
                  comment. Le cadrage préalable en tient compte, car une constatation obtenue hors
                  des règles locales fragiliserait l’ensemble du dossier — y compris sa partie
                  suisse.
                </p>

                <h3>Une restitution unifiée</h3>
                <p>
                  Les éléments recueillis à l’étranger rejoignent le même{' '}
                  <strong>rapport détaillé et horodaté</strong> que les constatations menées en
                  Suisse. Vous n’avez pas à rapprocher vous-même des documents hétérogènes.
                </p>

                <h3>Confidentialité</h3>
                <p>
                  Les informations transmises restent conservées sur des serveurs sécurisés situés
                  en Suisse pendant toute la durée des investigations, quelle que soit l’origine
                  géographique des constatations.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <SectionContact
        titre={['Un dossier', 'hors de Suisse ?']}
        chapeau="Indiquez-nous le pays concerné et ce que vous cherchez à établir. Nous vous dirons si le réseau permet d'y répondre, dans quel délai et à quelles conditions."
      />
    </>
  );
}
