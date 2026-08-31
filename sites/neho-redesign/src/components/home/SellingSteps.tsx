import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animation/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

export function SellingSteps({ dict }: { dict: Dictionary }) {
  const t = dict.home.steps;

  return (
    <section className="bg-cream-100/60 py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} align="center" className="mx-auto" />

        <div className="relative mt-16">
          <div aria-hidden="true" className="absolute inset-x-0 top-6 hidden h-px bg-stone-300 lg:block" />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {t.items.map((step, i) => (
              <li key={step.title} className="relative flex flex-col gap-3">
                <Reveal delay={i * 0.06} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-lg text-cream-50">
                      {i + 1}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-ivy-600">{step.duration}</span>
                  </div>
                  <h3 className="text-base font-semibold text-ink-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-500">{step.description}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
