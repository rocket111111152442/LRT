import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { PropertyCard } from "@/components/properties/property-card";
import { properties } from "@/lib/data/properties";

export function FeaturedProperties() {
  const featured = properties.filter((p) => p.featured);
  const [main, ...rest] = featured;
  if (!main) return null;

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <Eyebrow>Sélection</Eyebrow>
            <h2 className="mt-4 max-w-md font-serif text-4xl italic sm:text-5xl">Biens à la une</h2>
          </Reveal>
          <Reveal delay={100}>
            <Button href="/acheter" variant="ghost" size="md">
              Tous les biens
            </Button>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <PropertyCard property={main} variant="large" />
          </Reveal>
          <div className="flex flex-col gap-14 lg:col-span-5">
            {rest.slice(0, 2).map((property, i) => (
              <Reveal key={property.slug} delay={120 + i * 100}>
                <PropertyCard property={property} variant="compact" />
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
