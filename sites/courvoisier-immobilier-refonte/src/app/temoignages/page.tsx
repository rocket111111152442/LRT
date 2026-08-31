import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { Reveal } from "@/components/ui/reveal";
import { testimonials } from "@/lib/data/testimonials";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Témoignages clients",
  description: "Ce que nos clients disent de leur expérience avec Courvoisier Immobilier.",
  path: "/temoignages",
});

export default function TemoignagesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Confiance"
        title="Ce que nos clients en disent."
        lead="L’immobilier est une affaire de confiance. Voici, en quelques mots, ce qu’en retiennent les personnes que nous avons accompagnées."
      />

      <Container className="pb-28 sm:pb-36">
        <div className="divide-y divide-[var(--color-stone-dark)] border-t border-[var(--color-stone-dark)]">
          {testimonials.map((testimonial, i) => (
            <Reveal
              key={testimonial.attribution}
              delay={i * 80}
              className={`flex flex-col gap-6 py-16 sm:py-20 ${i % 2 === 1 ? "sm:items-end sm:text-right" : ""}`}
            >
              <blockquote className="max-w-3xl font-serif text-3xl italic leading-snug sm:text-5xl">
                «&nbsp;{testimonial.quote}&nbsp;»
              </blockquote>
              <div>
                <p className="font-sans text-sm uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">
                  {testimonial.attribution}
                </p>
                <p className="mt-1 font-sans text-xs text-[var(--color-graphite-light)]">{testimonial.context}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
