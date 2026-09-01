import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Vendre mon terrain — Analyse de constructibilité et vente",
  description:
    "Vendez votre terrain au meilleur prix : analyse de constructibilité, solutions de valorisation et mise en vente accompagnées par un développeur immobilier breveté.",
  alternates: { canonical: "/vendre-mon-terrain" },
};

const steps = [
  {
    title: "Analyse du terrain",
    description: "Vérification du plan d'affectation, de l'indice d'utilisation du sol et des servitudes existantes.",
  },
  {
    title: "Options de valorisation",
    description:
      "Vente en l'état, division parcellaire ou partenariat de développement : nous présentons les options qui augmentent réellement le prix final.",
  },
  {
    title: "Mise en vente ciblée",
    description: "Diffusion auprès d'un réseau de promoteurs, d'investisseurs et de particuliers déjà identifiés.",
  },
];

export default function VendreMonTerrainPage() {
  return (
    <>
      <PageHero
        eyebrow="Vendre mon terrain"
        title="Un terrain se vend rarement bien au premier prix affiché."
        intro="Avant toute diffusion, notre développeur breveté établit ce que votre parcelle permet réellement de construire — l'élément qui détermine la majeure partie de sa valeur."
        scene="terrain"
      />

      <Section tone="paper">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <Eyebrow index="01">Pourquoi être accompagné</Eyebrow>
              <h2 className="mt-4 max-w-xs font-serif text-[1.9rem] leading-[1.15] text-ink sm:text-[2.2rem]">
                Déléguer, sans perdre le contrôle
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-ink-soft">
                En confiant la vente à un professionnel breveté, vous évitez de sous-évaluer un terrain à fort
                potentiel — ou de le voir s&rsquo;éterniser sur le marché faute d&rsquo;un positionnement clair.
              </p>
            </div>

            <div className="lg:col-span-8">
              <ol className="space-y-10 border-t border-stone pt-10">
                {steps.map((step, i) => (
                  <Reveal as="li" key={step.title} delay={i * 0.06} className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:gap-8">
                    <span className="font-serif text-2xl text-clay sm:col-span-2">0{i + 1}</span>
                    <h3 className="font-serif text-xl text-ink sm:col-span-3">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-ink-soft sm:col-span-7">{step.description}</p>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="pine" compact>
        <Container className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl sm:text-[1.9rem]">Recevez une première analyse gratuite</h2>
            <p className="mt-2 max-w-md text-sm text-paper/70">
              Sans engagement, réponse par un expert en estimations immobilières breveté.
            </p>
          </div>
          <Button href="/estimation-immobiliere" variant="inverse">
            Démarrer l&rsquo;analyse
          </Button>
        </Container>
      </Section>
    </>
  );
}
