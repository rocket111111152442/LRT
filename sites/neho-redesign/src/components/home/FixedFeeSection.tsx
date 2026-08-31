import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animation/Reveal";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

export function FixedFeeSection({ dict }: { dict: Dictionary }) {
  const t = dict.home.fixedFee;
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} />
          <div className="grid gap-5 sm:grid-cols-2">
            {t.points.map((point, i) => (
              <Reveal key={point.title} delay={i * 0.08} className="rounded-2xl border border-stone-200 bg-cream-100/70 p-6">
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-ivy-600 font-display text-sm text-cream-50">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold text-ink-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{point.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
