import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/Button";
import { expert } from "@/config/site";

export const metadata: Metadata = {
  title: "Développement foncier — Acquisition et valorisation de terrains",
  description:
    "votrecourtier.ch SA achète des terrains en son nom ou en partenariat et accompagne les propriétaires fonciers dans l'étude et la valorisation de leur parcelle à Vaud et Fribourg.",
  alternates: { canonical: "/developpement-foncier" },
};

const pillars = [
  {
    title: "Étude de potentiel",
    description:
      "Analyse complète du plan d'affectation, du gabarit constructible et des contraintes techniques ou légales du terrain.",
  },
  {
    title: "Acquisition",
    description:
      "Achat en nom propre ou en partenariat avec le propriétaire, selon la structure la plus avantageuse pour chaque situation.",
  },
  {
    title: "Valorisation",
    description:
      "Définition du programme immobilier le plus pertinent — habitat individuel, groupé ou petit collectif — pour maximiser la valeur du foncier.",
  },
  {
    title: "Réalisation",
    description:
      "Suivi du projet jusqu'à la commercialisation, en coordination avec les architectes et entreprises générales partenaires.",
  },
];

export default function DeveloppementFoncierPage() {
  return (
    <>
      <PageHero
        eyebrow="Développement foncier"
        title="Valoriser un terrain demande plus qu'une estimation."
        intro="Développeur immobilier avec brevet fédéral, Alexandre Mirfassihi étudie le potentiel constructible réel d'une parcelle avant toute décision — achat, partenariat ou simple conseil au propriétaire."
        scene="projet-neuf"
      />

      <Section tone="paper">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <Eyebrow index="01">Notre rôle</Eyebrow>
              <h2 className="mt-4 max-w-xs font-serif text-[1.9rem] leading-[1.15] text-ink sm:text-[2.2rem]">
                Du terrain brut au projet commercialisable
              </h2>
            </div>
            <div className="lg:col-span-8">
              <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-ink-soft">
                Un terrain constructible n&rsquo;a de valeur que rapportée à ce qu&rsquo;il permet réellement de
                construire. {expert.name} intervient en amont, sur la base de son expérience en valorisation et
                projets neufs acquise chez Foncia/Domicim/DBS puis Barnes/Gerofinance dans les cantons de Vaud et
                Fribourg, pour établir une synthèse claire du potentiel d&rsquo;une parcelle avant toute transaction.
              </p>

              <ul className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 border-t border-stone pt-10 sm:grid-cols-2">
                {pillars.map((p, i) => (
                  <Reveal as="li" key={p.title} delay={i * 0.06}>
                    <span className="font-feature-numeric text-xs text-clay">0{i + 1}</span>
                    <h3 className="mt-3 font-serif text-lg text-ink">{p.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{p.description}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="dim" compact>
        <Container className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ink sm:text-[1.9rem]">Vous possédez un terrain constructible ?</h2>
            <p className="mt-2 max-w-md text-sm text-ink-soft">
              Recevez une première analyse de son potentiel, sans engagement.
            </p>
          </div>
          <Button href="/vendre-mon-terrain">Étudier mon terrain</Button>
        </Container>
      </Section>
    </>
  );
}
