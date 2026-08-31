import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/Button";
import { processSteps } from "@/lib/data/process";

export const metadata: Metadata = {
  title: "Vendre mon bien résidentiel — Maison, appartement",
  description:
    "Estimation, mise en valeur, diffusion et négociation : l'accompagnement complet de votrecourtier.ch pour vendre votre maison ou appartement à Vaud et Fribourg.",
  alternates: { canonical: "/vendre-mon-bien-residentiel" },
};

export default function VendreMonBienResidentielPage() {
  return (
    <>
      <PageHero
        eyebrow="Vendre mon bien résidentiel"
        title="Vendre sans brader, ni s'éterniser sur le marché."
        intro="Maison, appartement ou villa : le même accompagnement, du premier rendez-vous d'estimation jusqu'à la signature chez le notaire."
        scene="villa"
      />

      <Section tone="paper">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <Eyebrow index="01">Notre méthode</Eyebrow>
              <h2 className="mt-4 max-w-xs font-serif text-[1.9rem] leading-[1.15] text-ink sm:text-[2.2rem]">
                Six étapes, un seul interlocuteur
              </h2>
            </div>
            <div className="lg:col-span-8">
              <ol className="space-y-8 border-t border-stone pt-10">
                {processSteps.map((step, i) => (
                  <Reveal as="li" key={step.index} delay={i * 0.04} className="grid grid-cols-1 gap-1.5 sm:grid-cols-12 sm:gap-8">
                    <span className="font-serif text-xl text-clay sm:col-span-2">{step.index}</span>
                    <h3 className="font-serif text-lg text-ink sm:col-span-3">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-ink-soft sm:col-span-7">{step.description}</p>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="dim" compact>
        <Container className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ink sm:text-[1.9rem]">Quelle est la valeur de votre bien ?</h2>
            <p className="mt-2 max-w-md text-sm text-ink-soft">Estimation gratuite par un expert breveté, sans engagement.</p>
          </div>
          <Button href="/estimation-immobiliere">Demander une estimation</Button>
        </Container>
      </Section>
    </>
  );
}
