import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";
import { TextLink } from "@/components/ui/TextLink";
import { testimonials } from "@/lib/data/testimonials";

export function Testimonials() {
  return (
    <Section tone="paper">
      <Container>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <Eyebrow index="08">Témoignages</Eyebrow>
            <h2 className="mt-4 max-w-md font-serif text-[1.9rem] leading-[1.15] text-ink sm:text-[2.3rem]">
              Ce qu&rsquo;en disent nos clients
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <TextLink href="/references" className="text-sm text-ink-soft">
              Toutes nos références
            </TextLink>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-12 border-t border-stone pt-12 sm:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.attribution + t.context} delay={i * 0.06} className={i % 2 === 1 ? "sm:mt-14" : undefined}>
              <p className="font-serif text-[1.2rem] italic leading-[1.5] text-ink">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-5 text-[0.8125rem] uppercase tracking-[0.1em] text-ink-faint">
                {t.attribution} — <span className="text-clay">{t.context}</span>
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
