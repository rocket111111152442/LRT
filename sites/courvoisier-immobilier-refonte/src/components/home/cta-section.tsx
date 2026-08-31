import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function CtaSection() {
  return (
    <section className="bg-[var(--color-green)] py-28 text-[var(--color-ivory)] sm:py-36">
      <Container className="flex flex-col items-start gap-8">
        <Reveal mask>
          <h2 className="max-w-2xl font-serif text-4xl italic leading-[1.1] sm:text-6xl">
            Parlons de votre projet.
          </h2>
        </Reveal>
        <Reveal delay={120} className="flex flex-wrap gap-5">
          <Button href="/estimer" className="!bg-[var(--color-ivory)] !text-[var(--color-ink)] hover:!bg-[var(--color-ink)] hover:!text-[var(--color-ivory)]">
            Estimer mon bien
          </Button>
          <Button href="/contact" variant="ghost" className="!text-[var(--color-ivory)]">
            Contacter une agence
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
