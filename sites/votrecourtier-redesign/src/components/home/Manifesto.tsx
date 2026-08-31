import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";

export function Manifesto() {
  return (
    <Section tone="paper">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <Eyebrow index="02">Notre approche</Eyebrow>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <Reveal>
              <p className="font-serif text-[1.75rem] leading-[1.3] tracking-[-0.005em] text-ink sm:text-[2.1rem] lg:text-[2.4rem]">
                Une transaction immobilière se joue avant tout sur la préparation.{" "}
                <span className="text-ink-faint">
                  Nous refusons les estimations gonflées pour décrocher un mandat et les diffusions vagues qui
                  font perdre du temps à tout le monde.
                </span>
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-8 max-w-2xl text-[1rem] leading-relaxed text-ink-soft">
                Développeur immobilier avec brevet fédéral et expert en estimations, Alexandre Mirfassihi a bâti son
                expérience chez des acteurs majeurs du marché romand avant de fonder votrecourtier.ch SA. Cette
                double compétence — évaluation rigoureuse et connaissance du foncier — structure chacun de nos
                mandats, qu&rsquo;il s&rsquo;agisse de vendre un appartement, un terrain ou de commercialiser un
                projet neuf.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
