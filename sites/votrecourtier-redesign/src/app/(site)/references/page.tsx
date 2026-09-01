import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animation/Reveal";
import { testimonials } from "@/lib/data/testimonials";
import { companyStats } from "@/lib/data/stats";
import { AnimatedNumber } from "@/components/animation/AnimatedNumber";

export const metadata: Metadata = {
  title: "Références — Témoignages clients",
  description: "Ce que disent les propriétaires, acquéreurs et investisseurs accompagnés par votrecourtier.ch SA.",
  alternates: { canonical: "/references" },
};

export default function ReferencesPage() {
  return (
    <>
      <PageHero
        eyebrow="Références"
        title="La confiance se lit dans la durée d'une relation."
        intro="Une sélection de témoignages reformulés à partir d'avis publics authentiques. Voir docs/votrecourtier-audit.md pour la méthodologie de vérification."
        scene="bureau"
      />

      <Section tone="paper" compact>
        <Container>
          <div className="grid grid-cols-2 gap-y-10 border-t border-stone pt-10 lg:grid-cols-4">
            {companyStats.map((stat) => (
              <div key={stat.label} className="border-l border-stone pl-5">
                <p className="font-serif text-3xl text-ink">
                  {stat.isYear ? stat.value : <AnimatedNumber value={stat.value} suffix={stat.suffix} />}
                </p>
                <p className="mt-2 max-w-[10rem] text-xs leading-snug text-ink-faint">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="dim">
        <Container>
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal key={t.attribution + t.context} delay={i * 0.06} className={i % 2 === 1 ? "sm:mt-14" : undefined}>
                <p className="font-serif text-[1.25rem] italic leading-[1.55] text-ink">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-5 text-[0.8125rem] uppercase tracking-[0.1em] text-ink-faint">
                  {t.attribution} — <span className="text-clay">{t.context}</span>
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
