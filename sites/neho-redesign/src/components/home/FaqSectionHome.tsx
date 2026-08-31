import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

export function FaqSectionHome({ dict }: { dict: Dictionary }) {
  const t = dict.home.faq;
  return (
    <section className="bg-cream-100/60 py-20 sm:py-28">
      <Container narrow>
        <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} align="center" className="mx-auto" />
        <div className="mt-12">
          <FaqAccordion items={t.items} />
        </div>
      </Container>
    </section>
  );
}
