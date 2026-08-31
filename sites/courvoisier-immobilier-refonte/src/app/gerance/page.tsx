import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Artwork } from "@/components/illustrations/artwork";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Gérance immobilière — gestion locative",
  description:
    "Gestion locative complète d’immeubles, d’appartements ou de propriétés privées : relations locataires, suivi administratif, comptable et technique.",
  path: "/gerance",
});

const PILLARS = [
  {
    number: "01",
    title: "Relations locataires",
    description: "Un interlocuteur unique pour vos locataires, de l’état des lieux au renouvellement de bail.",
  },
  {
    number: "02",
    title: "Suivi administratif",
    description: "Encaissement des loyers, décomptes de charges et suivi rigoureux de chaque dossier.",
  },
  {
    number: "03",
    title: "Suivi technique",
    description: "Coordination des travaux d’entretien et suivi des interventions nécessaires.",
  },
  {
    number: "04",
    title: "Valorisation patrimoniale",
    description: "Une vision de long terme pour préserver et valoriser votre patrimoine immobilier.",
  },
];

export default function GerancePage() {
  return (
    <>
      <PageIntro
        eyebrow="Gérance"
        title="Votre patrimoine, géré avec rigueur."
        lead="Gestion locative complète d’immeubles, d’appartements ou de propriétés privées — un suivi transparent et organisé, au quotidien."
      />

      <Container className="pb-28 sm:pb-36">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <Reveal>
            <Artwork scene="facade" tone="stone" ratio="portrait" />
          </Reveal>
          <div>
            {PILLARS.map((pillar, i) => (
              <Reveal key={pillar.number} delay={i * 80} className="border-t border-[var(--color-stone-dark)] py-8 first:border-t-0">
                <div className="flex items-baseline gap-6">
                  <span className="font-serif text-lg italic text-[var(--color-brown)]">{pillar.number}</span>
                  <div>
                    <p className="font-sans text-lg font-medium">{pillar.title}</p>
                    <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col items-start gap-6 border-t border-[var(--color-stone-dark)] pt-16">
          <p className="max-w-lg font-serif text-2xl italic">
            Confiez la gestion de votre bien à une équipe qui connaît le terrain.
          </p>
          <Button href="/contact">Parler à notre équipe gérance</Button>
        </div>
      </Container>
    </>
  );
}
