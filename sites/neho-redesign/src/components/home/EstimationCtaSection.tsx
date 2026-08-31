import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/animation/MagneticButton";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function EstimationCtaSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.estimationCta;
  return (
    <section className="relative overflow-hidden bg-ivy-700 py-20 text-cream-50 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-bronze-500/20 blur-3xl"
      />
      <Container className="relative flex flex-col items-center text-center">
        <h2 className="max-w-2xl font-display text-3xl sm:text-4xl">{t.title}</h2>
        <p className="mt-4 max-w-xl text-cream-50/80">{t.description}</p>
        <MagneticButton className="mt-8">
          <Button href={`/${locale}/estimation`} variant="dark" size="lg">
            {t.cta}
          </Button>
        </MagneticButton>
        <p className="mt-3 text-xs text-cream-50/60">{t.timeHint}</p>
      </Container>
    </section>
  );
}
