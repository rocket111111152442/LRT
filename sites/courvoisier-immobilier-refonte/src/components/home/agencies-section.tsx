import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Artwork } from "@/components/illustrations/artwork";
import { agencies } from "@/lib/data/agencies";

export function AgenciesSection() {
  const [main, ...rest] = agencies;
  if (!main) return null;

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <Eyebrow>Territoire</Eyebrow>
            <h2 className="mt-4 max-w-md font-serif text-4xl italic sm:text-5xl">
              Nous connaissons le terrain.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <Button href="/agences" variant="ghost">
              Nos trois agences
            </Button>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Artwork scene="horizon" tone="stone" ratio="wide" />
            <p className="mt-5 font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">
              Siège — {main.city}
            </p>
            <p className="mt-1 font-serif text-2xl italic">{main.street}, {main.postalCode} {main.city}</p>
            <a href={main.phoneHref} className="link-underline mt-2 inline-block font-sans text-sm">
              {main.phone}
            </a>
          </Reveal>

          <div className="flex flex-col gap-14 lg:col-span-5">
            {rest.map((agency, i) => (
              <Reveal key={agency.id} delay={120 + i * 100}>
                <Artwork scene={i === 0 ? "contour" : "facade"} ratio="landscape" />
                <p className="mt-5 font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">
                  Agence — {agency.city}
                </p>
                <p className="mt-1 font-serif text-xl italic">{agency.street}, {agency.postalCode} {agency.city}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
