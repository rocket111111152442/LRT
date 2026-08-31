import type { Metadata } from 'next';

import DonneesStructurees from '@/components/DonneesStructurees';
import HeroPage from '@/components/HeroPage';
import ProcessusAnime from '@/components/ProcessusAnime';
import Reveal from '@/components/Reveal';
import SectionContact from '@/components/SectionContact';
import TitreMasque from '@/components/TitreMasque';
import { agence, tarifs } from '@/content/site';
import { jsonLdFaq, jsonLdFilAriane, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/tarifs/';

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Tarifs', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Tarifs et conditions',
  description: `Honoraires de détective privé entre ${tarifs.devise} ${tarifs.min} et ${tarifs.devise} ${tarifs.max} de l'heure pour les enquêtes et filatures, forfait pour les recherches administratives. Analyse gratuite et devis écrit.`,
  chemin: CHEMIN,
});

/**
 * Questions fréquentes.
 *
 * Elles sont affichées telles quelles sur la page : le balisage FAQPage ne
 * décrit donc que du contenu réellement visible par le visiteur, comme l'exige
 * la documentation de Google.
 */
const questions = [
  {
    question: 'Combien coûte une enquête de détective privé ?',
    reponse: `Pour les enquêtes et les filatures, nos honoraires se situent entre ${tarifs.devise} ${tarifs.min} et ${tarifs.devise} ${tarifs.max} de l'heure. Le montant dépend de la complexité du dossier, du temps consacré ainsi que des ressources humaines et techniques nécessaires. Les recherches administratives font l'objet d'un tarif forfaitaire.`,
  },
  {
    question: 'La première évaluation est-elle payante ?',
    reponse:
      "Non. Nous évaluons gratuitement votre demande et réalisons une étude de coût et de faisabilité, sans engagement de votre part. Cette étape sert aussi à vous dire si une investigation a réellement des chances d'aboutir.",
  },
  {
    question: 'Pourquoi une fourchette aussi large ?',
    reponse:
      "Parce que les dispositifs n'ont rien de comparable. Une vérification documentaire mobilise un enquêteur ; une filature en milieu urbain dense peut en mobiliser plusieurs, avec des relais et des véhicules. Le devis écrit fixe le périmètre exact avant toute intervention.",
  },
  {
    question: 'Puis-je interrompre une enquête en cours ?',
    reponse:
      "Oui. Vous êtes informé en temps réel de l'avancée de l'enquête et des frais engagés, ce qui vous permet de dire « stop » à tout moment et de maîtriser votre budget.",
  },
  {
    question: 'Que contient le rapport final ?',
    reponse:
      "À l'issue de la mission, nous vous remettons un rapport détaillé et horodaté réunissant les constatations, ainsi que les photographies et les vidéos des éléments recueillis au cours de l'enquête.",
  },
  {
    question: 'Les frais annexes sont-ils compris ?',
    reponse:
      "Les moyens techniques et les frais liés à la mission sont décrits dans le devis. Vous suivez ensuite les frais engagés au fil de l'enquête : aucun poste n'apparaît après coup sans que vous en ayez été informé.",
  },
];

const facteurs = [
  {
    titre: 'La complexité du dossier',
    texte:
      'Un environnement dense, une cible mobile ou un contexte déjà tendu multiplient les précautions à prendre, donc les moyens à engager.',
  },
  {
    titre: 'Le temps consacré',
    texte:
      "Certaines constatations exigent d'être répétées pour établir une habitude plutôt qu'un événement isolé. La durée n'est pas un confort : elle fait la solidité du constat.",
  },
  {
    titre: 'Les ressources humaines',
    texte:
      'Une filature discrète suppose souvent plusieurs agents en relais. Un seul observateur serait repéré, et le dossier perdu avec lui.',
  },
  {
    titre: 'Les moyens techniques',
    texte:
      'Matériel de captation à distance, équipement de détection pour les contre-mesures : les moyens mobilisés varient selon la nature de la mission.',
  },
];

export default function Tarifs() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />
      <DonneesStructurees donnees={jsonLdFaq(questions)} />

      <HeroPage
        etiquette="Tarifs et conditions"
        titre={['Un budget annoncé', 'avant de commencer']}
        chapeau="Aucune enquête ne démarre sans un devis écrit. Vous savez ce que vous engagez, vous suivez les frais au fil de la mission, et vous pouvez l'interrompre à tout moment."
        maillons={maillons}
        decor={
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_72%_25%,color-mix(in_oklab,var(--color-champagne)_26%,transparent),transparent_70%)]" />
        }
      />

      {/* ---------------- Le chiffre ---------------- */}
      <section className="section">
        <div className="cadre">
          <div className="carte grain relative overflow-hidden p-9 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <p className="etiquette">Enquêtes et filatures</p>
                <div className="mt-7 flex items-baseline gap-3">
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
                <p className="mt-8 max-w-md leading-relaxed text-argent">
                  Le montant de nos honoraires dépend de la complexité des cas, du temps consacré
                  ainsi que des ressources humaines et techniques nécessaires. En matière de{' '}
                  <strong className="text-ivoire">recherches administratives</strong>, un tarif
                  forfaitaire est appliqué.
                </p>
              </div>

              <Reveal>
                <div className="flex h-full flex-col justify-center gap-5 border-t border-[var(--trait)] pt-9 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-14">
                  {[
                    {
                      titre: 'Analyse gratuite',
                      texte: 'Évaluation de la demande et étude de faisabilité, sans engagement.',
                    },
                    {
                      titre: 'Devis écrit',
                      texte: 'Périmètre, moyens et budget fixés avant toute intervention.',
                    },
                    {
                      titre: 'Suivi en temps réel',
                      texte: 'Avancée de l’enquête et frais engagés communiqués au fil de l’eau.',
                    },
                    {
                      titre: 'Arrêt à tout moment',
                      texte: 'Vous pouvez dire « stop » et maîtriser votre budget.',
                    },
                  ].map((point) => (
                    <div key={point.titre} className="flex items-start gap-4">
                      <span aria-hidden="true" className="mt-3 h-px w-5 shrink-0 bg-champagne" />
                      <div>
                        <h2 className="font-display text-[1.0625rem] text-ivoire">{point.titre}</h2>
                        <p className="mt-1 text-[0.875rem] leading-relaxed text-brume">
                          {point.texte}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Ce qui fait varier le prix ---------------- */}
      <section className="section border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Ce qui fait varier un devis</p>
            <TitreMasque
              as="h2"
              lignes={['Quatre facteurs,', 'aucun supplément', 'imprévu']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>

          <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] sm:grid-cols-2 xl:grid-cols-4">
            {facteurs.map((facteur, index) => (
              <li key={facteur.titre} className="bg-graphite">
                <Reveal retard={index * 90} className="h-full">
                  <div className="h-full p-8">
                    <span
                      aria-hidden="true"
                      className="font-mono text-[0.6875rem] tracking-[0.2em] text-champagne"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 font-display text-t4 text-ivoire">{facteur.titre}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-brume">
                      {facteur.texte}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Processus ---------------- */}
      <section className="section border-t border-[var(--trait)]">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Du premier appel au rapport</p>
            <TitreMasque
              as="h2"
              lignes={['Comment se construit', 'le budget']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>
          <div className="mt-14">
            <ProcessusAnime />
          </div>
        </div>
      </section>

      {/* ---------------- Questions fréquentes ---------------- */}
      <section className="section border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="etiquette">Questions fréquentes</p>
              <TitreMasque
                as="h2"
                lignes={['Ce que l’on', 'nous demande', 'le plus souvent']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
              <Reveal retard={160}>
                <p className="mt-6 text-[0.9375rem] leading-relaxed text-brume">
                  Une question qui ne figure pas ici&nbsp;? Appelez le{' '}
                  <span className="text-argent">{agence.telephonePrincipalAffiche}</span>, la
                  réponse est gratuite.
                </p>
              </Reveal>
            </div>

            <ul className="flex flex-col">
              {questions.map((entree, index) => (
                <li
                  key={entree.question}
                  className="border-b border-[var(--trait)] py-7 first:pt-0"
                >
                  <Reveal retard={index * 70}>
                    <h3 className="font-display text-t4 text-ivoire">{entree.question}</h3>
                    <p className="mt-3 max-w-2xl leading-relaxed text-brume">{entree.reponse}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <SectionContact
        titre={['Demandez', 'un devis personnalisé']}
        chapeau="Décrivez-nous la situation : nous vous indiquons gratuitement ce qui peut être établi, avec quels moyens et pour quel budget. Le devis écrit vous engage seulement si vous l'acceptez."
      />
    </>
  );
}
