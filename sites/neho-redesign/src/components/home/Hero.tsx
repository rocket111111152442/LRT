import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/Badge";
import { HeroScene } from "@/components/three/HeroScene";
import { MagneticButton } from "@/components/animation/MagneticButton";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.hero;

  return (
    <section className="relative overflow-hidden bg-cream-50 pb-16 pt-32 sm:pb-24 sm:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[36rem] w-[62rem] -translate-x-1/2 rounded-full bg-ivy-100/70 blur-3xl"
      />
      <Container className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-ink-900 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-cream-50">
              {t.eyebrow}
            </span>
            <DemoBadge label={dict.meta.demoBadge} />
          </div>

          <h1 className="font-display text-[2.6rem] font-medium leading-[1.05] text-ink-900 sm:text-6xl lg:text-[4rem]">
            {t.title} <span className="italic text-ivy-600">{t.titleHighlight}</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">{t.subtitle}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <MagneticButton>
              <Button href={`/${locale}/estimation`} size="lg">
                {t.ctaPrimary}
              </Button>
            </MagneticButton>
            <Button href={`/${locale}/biens`} variant="outline" size="lg">
              {t.ctaSecondary}
            </Button>
          </div>

          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-stone-200 pt-6">
            {[
              [t.stat1Value, t.stat1Label],
              [t.stat2Value, t.stat2Label],
              [t.stat3Value, t.stat3Label],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-xl text-ink-900 sm:text-2xl">{value}</dd>
                <dd className="mt-1 text-xs text-ink-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-stone-200 shadow-lift sm:aspect-[5/4.6] lg:aspect-[4/4.6]">
          <HeroScene label={t.title} />
        </div>
      </Container>

      <div className="mt-16 flex justify-center">
        <span className="flex flex-col items-center gap-2 text-xs font-medium uppercase tracking-widest text-ink-500">
          {t.scrollHint}
          <span aria-hidden="true" className="h-8 w-px animate-pulse bg-ink-500/40" />
        </span>
      </div>
    </section>
  );
}
