import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/Button";
import { ArchitecturalScene } from "@/components/illustrations/ArchitecturalScene";

export function EstimationCta() {
  return (
    <section className="relative overflow-hidden bg-pine py-28 text-paper sm:py-32">
      <div className="absolute inset-0 opacity-[0.35]">
        <ArchitecturalScene variant="paysage" className="h-full w-full" />
      </div>
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-clay-soft">
              10 — Estimation gratuite
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 text-balance font-serif text-[2.1rem] leading-[1.15] sm:text-[2.7rem]">
              Une estimation précise est la première décision qui compte.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-md text-[1.0625rem] leading-relaxed text-paper/70">
              Réponse d&rsquo;un expert breveté, sans engagement — pour un bien résidentiel, un terrain ou un
              immeuble de rendement.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-9 flex justify-center">
            <Button href="/estimation-immobiliere" variant="inverse">
              Démarrer mon estimation
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
