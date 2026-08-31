import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { TextLink } from "@/components/ui/TextLink";
import { properties } from "@/lib/data/properties";

export function FeaturedProperties() {
  const featured = properties.filter((p) => p.status !== "vendu").slice(0, 3);
  const [first, second, third] = featured;

  return (
    <Section tone="paper">
      <Container>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <Eyebrow index="04">Biens à la vente</Eyebrow>
            <h2 className="mt-4 max-w-md font-serif text-[1.9rem] leading-[1.15] text-ink sm:text-[2.3rem]">
              Une sélection en cours de commercialisation
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <TextLink href="/tous-nos-biens" className="text-sm text-ink-soft">
              Voir tous nos biens
            </TextLink>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12">
          {first ? (
            <Reveal className="lg:col-span-7">
              <PropertyCard property={first} priority aspect="aspect-[4/5] lg:aspect-[16/13]" />
            </Reveal>
          ) : null}
          <div className="grid grid-cols-1 gap-y-14 sm:grid-cols-2 sm:gap-x-8 lg:col-span-5 lg:grid-cols-1">
            {second ? (
              <Reveal delay={0.1}>
                <PropertyCard property={second} />
              </Reveal>
            ) : null}
            {third ? (
              <Reveal delay={0.18}>
                <PropertyCard property={third} />
              </Reveal>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
