import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SavingsCalculator } from "@/components/home/SavingsCalculator";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function CalculatorSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.calculator;
  return (
    <section className="relative overflow-hidden bg-night-900 py-20 text-cream-50 sm:py-28">
      <div className="grain pointer-events-none absolute inset-0" />
      <Container className="relative">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} tone="dark" align="center" className="mx-auto" />
        <div className="mt-12">
          <SavingsCalculator locale={locale} dict={dict} />
        </div>
      </Container>
    </section>
  );
}
