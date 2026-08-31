import type { Metadata } from 'next';
import { ArrowRight, Mail, Newspaper, Phone } from 'lucide-react';

import DonneesStructurees from '@/components/DonneesStructurees';
import HeroPage from '@/components/HeroPage';
import Reveal from '@/components/Reveal';
import TitreMasque from '@/components/TitreMasque';
import { apparitions } from '@/content/medias';
import { agence } from '@/content/site';
import { jsonLdFilAriane, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';
import { lienTel } from '@/lib/utils';

const CHEMIN = '/medias/';

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: "L'agence", chemin: '/agence/' },
  { nom: 'Médias', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Médias et presse',
  description:
    "Contact presse de l'agence ADIMEN, détectives privés agréés à Genève. Ce que nous pouvons commenter publiquement sur la profession, et ce que la confidentialité de nos dossiers nous interdit.",
  chemin: CHEMIN,
});

const sujets = [
  {
    titre: 'Le cadre légal de la profession',
    texte:
      "L'agrément du Conseil d'État genevois, l'autorisation du Département de la sécurité et de l'économie, et ce que ce cadre implique concrètement pour l'exercice du métier.",
  },
  {
    titre: 'La méthode d’enquête',
    texte:
      "Comment se construit un dossier, ce qui distingue une constatation exploitable d'une observation sans valeur, et pourquoi le recoupement prime sur l'information isolée.",
  },
  {
    titre: 'Les contre-mesures électroniques',
    texte:
      "La réalité des dispositifs de surveillance rencontrés sur le terrain — micros, caméras, balises — loin des représentations qu'en donne la fiction.",
  },
  {
    titre: 'L’évolution du métier',
    texte:
      "La place croissante des sources ouvertes, l'importance de la sécurité opérationnelle, et les compétences que le métier exige aujourd'hui.",
  },
];

export default function Medias() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />

      <HeroPage
        etiquette="Médias"
        titre={['Parler du métier,', 'jamais des dossiers']}
        chapeau="Nous répondons volontiers aux sollicitations des journalistes sur la profession de détective privé et son cadre légal en Suisse. En revanche, aucun dossier, aucun client et aucune enquête ne peuvent être évoqués : la confidentialité qui fonde notre travail ne souffre pas d'exception, y compris pour un reportage."
        maillons={maillons}
        decor={<div className="grille-fond opacity-40" />}
      />

      {/* ---------------- Interventions publiées ---------------- */}
      {apparitions.length > 0 && (
        <section className="section">
          <div className="cadre">
            <div className="max-w-2xl">
              <p className="etiquette">Interventions</p>
              <TitreMasque
                as="h2"
                lignes={['L’agence dans', 'la presse et', 'à la télévision']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
            </div>

            <ul className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {apparitions.map((apparition, index) => (
                <li key={apparition.url}>
                  <Reveal retard={(index % 3) * 100} className="h-full">
                    <a
                      href={apparition.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="carte carte-halo flex h-full flex-col p-8"
                    >
                      <div className="flex items-center gap-3">
                        <Newspaper aria-hidden="true" className="size-4 text-champagne" />
                        <span className="font-mono text-[0.6875rem] tracking-[0.18em] text-brume uppercase">
                          {apparition.media}
                          {apparition.emission ? ` · ${apparition.emission}` : ''} ·{' '}
                          {apparition.annee}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-t4 text-ivoire">{apparition.titre}</h3>
                      <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-brume">
                        {apparition.resume}
                      </p>
                      <span className="lien-fleche mt-7">
                        Voir le sujet
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </span>
                    </a>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------- Sujets que nous pouvons traiter ---------------- */}
      <section className="section border-t border-[var(--trait)]">
        <div className="cadre">
          <div className="max-w-2xl">
            <p className="etiquette">Sujets abordables</p>
            <TitreMasque
              as="h2"
              lignes={['Ce dont nous', 'pouvons parler']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
          </div>

          <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-carte)] border border-[var(--trait)] bg-[var(--trait)] sm:grid-cols-2">
            {sujets.map((sujet, index) => (
              <li key={sujet.titre} className="bg-graphite">
                <Reveal retard={(index % 2) * 100} className="h-full">
                  <div className="h-full p-8 lg:p-10">
                    <h3 className="font-display text-t3 text-ivoire">{sujet.titre}</h3>
                    <p className="mt-4 leading-relaxed text-brume">{sujet.texte}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Ce que nous ne commentons pas ---------------- */}
      <section className="section border-t border-[var(--trait)] bg-graphite">
        <div className="cadre">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="etiquette">Nos limites</p>
              <TitreMasque
                as="h2"
                lignes={['Ce que la', 'confidentialité', 'nous interdit']}
                className="mt-6 font-display text-t2 text-ivoire"
              />
            </div>

            <Reveal>
              <div className="prose max-w-none">
                <p>
                  La discrétion n’est pas un argument commercial que l’on suspendrait à l’occasion
                  d’un reportage. Elle est la condition même de notre activité, et elle vaut aussi
                  bien après la fin d’une mission que pendant.
                </p>

                <h3>Nous ne communiquons jamais</h3>
                <ul>
                  <li>l’identité d’un client, actuel ou passé, même sous forme anonymisée ;</li>
                  <li>
                    le contenu d’un dossier, y compris lorsqu’il a fait l’objet d’une procédure
                    publique ;
                  </li>
                  <li>les méthodes précises employées sur une mission déterminée ;</li>
                  <li>
                    l’identité de nos agents de terrain, dont l’efficacité repose sur le fait de ne
                    pas être connus.
                  </li>
                </ul>

                <h3>Tournages et reconstitutions</h3>
                <p>
                  Nous n’acceptons pas d’être filmés en situation réelle d’enquête : la présence
                  d’une équipe compromettrait la mission et, avec elle, les intérêts du client qui
                  nous l’a confiée. Les demandes de reconstitution sont étudiées au cas par cas.
                </p>

                <h3>Vérification avant publication</h3>
                <p>
                  Nous acceptons volontiers de relire les passages techniques d’un article nous
                  citant, afin d’éviter les approximations sur le cadre légal — sans intervenir sur
                  la ligne éditoriale.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Contact presse ---------------- */}
      <section className="section border-t border-[var(--trait)]">
        <div className="cadre">
          <div className="carte grain relative overflow-hidden p-9 lg:p-16">
            <p className="etiquette">Contact presse</p>
            <TitreMasque
              as="h2"
              lignes={['Une demande', 'de journaliste ?']}
              className="mt-6 font-display text-t2 text-ivoire"
            />
            <Reveal retard={180}>
              <p className="mt-6 max-w-xl text-conduite text-argent">
                Indiquez votre média, le sujet traité et vos délais. Nous vous répondons pour
                convenir d’un entretien ou vous orienter vers les sources publiques pertinentes.
              </p>
            </Reveal>

            <Reveal retard={280}>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href={`mailto:${agence.email}`} className="btn btn-primaire">
                  <Mail aria-hidden="true" className="size-4" />
                  {agence.email}
                </a>
                <a href={lienTel(agence.telephonePrincipal)} className="btn btn-secondaire">
                  <Phone aria-hidden="true" className="size-4" />
                  {agence.telephonePrincipalAffiche}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
