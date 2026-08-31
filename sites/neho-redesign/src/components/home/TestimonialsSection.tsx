import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animation/Reveal";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { testimonials } from "@/lib/data/testimonials";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function TestimonialsSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.testimonials;
  const preview = testimonials.slice(0, 3);

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} />
          <Button href={`/${locale}/temoignages`} variant="outline" className="shrink-0">
            {t.ctaAll}
          </Button>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((testimonial, i) => (
            <Reveal key={testimonial.slug} delay={i * 0.06} className="h-full">
              <TestimonialCard
                testimonial={testimonial}
                locale={locale}
                verifiedLabel={t.verifiedBadge}
                frenchNotice={dict.common.contentInFrench}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
