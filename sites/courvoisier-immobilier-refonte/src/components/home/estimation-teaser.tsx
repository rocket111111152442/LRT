import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const PATHS = [
  {
    number: "01",
    title: "Rencontrer",
    description: "Un courtier se déplace chez vous pour une estimation détaillée, in situ.",
  },
  {
    number: "02",
    title: "Échanger",
    description: "Une estimation en visioconférence, rapide, sans rendez-vous à domicile.",
  },
  {
    number: "03",
    title: "Estimer",
    description: "Une première fourchette de prix en ligne, en quelques clics.",
  },
];

export function EstimationTeaser() {
  return (
    <section className="border-y border-[var(--color-stone-dark)] py-24 sm:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <Reveal>
            <Eyebrow>Estimation</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl italic leading-[1.1] sm:text-5xl">
              Combien vaut votre bien&nbsp;?
            </h2>
            <p className="mt-6 max-w-sm font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
              Trois façons de connaître sa valeur, selon le temps dont vous
              disposez et la précision recherchée.
            </p>
            <Button href="/estimer" className="mt-8">
              Démarrer mon estimation
            </Button>
          </Reveal>

          <div className="grid gap-10 sm:grid-cols-3">
            {PATHS.map((path, i) => (
              <Reveal key={path.number} delay={i * 100} className="border-t border-[var(--color-stone-dark)] pt-6">
                <span className="font-serif text-2xl italic text-[var(--color-brown)]">{path.number}</span>
                <p className="mt-3 font-sans text-lg font-medium">{path.title}</p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
                  {path.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
