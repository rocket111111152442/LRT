"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { IconArrowRight } from "@/components/ui/icons";
import { testimonials } from "@/lib/data/testimonials";

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const testimonial = testimonials[index];
  if (!testimonial) return null;

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Eyebrow>Confiance</Eyebrow>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_2.4fr] lg:items-center">
          <p className="font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
            {testimonial.context}
          </p>

          <div>
            <blockquote className="font-serif text-3xl italic leading-snug sm:text-4xl lg:text-5xl">
              «&nbsp;{testimonial.quote}&nbsp;»
            </blockquote>
            <p className="mt-6 font-sans text-sm uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">
              {testimonial.attribution}
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-6">
          <div className="flex gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.attribution}
                aria-label={`Témoignage ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-[3px] w-8 transition-colors ${i === index ? "bg-[var(--color-ink)]" : "bg-[var(--color-stone-dark)]"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex((index + 1) % testimonials.length)}
            className="group flex items-center gap-2 font-sans text-sm"
            aria-label="Témoignage suivant"
          >
            Suivant
            <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </Container>
    </section>
  );
}
