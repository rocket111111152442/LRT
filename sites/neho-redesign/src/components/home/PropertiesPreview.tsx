import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animation/Reveal";
import { getFeaturedProperties } from "@/lib/data/properties";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function PropertiesPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.properties;
  const preview = getFeaturedProperties(4);

  return (
    <section className="bg-cream-100/60 py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} />
          <Button href={`/${locale}/biens`} variant="outline" className="shrink-0">
            {t.ctaAll}
          </Button>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {preview.map((property, i) => (
            <Reveal key={property.slug} delay={i * 0.06}>
              <PropertyCard property={property} locale={locale} newLabel={t.newBadge} availabilityLabels={dict.properties.availability} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
