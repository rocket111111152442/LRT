"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";
import { processSteps } from "@/lib/data/process";

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.4"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 24, restDelta: 0.001 });

  return (
    <section className="relative bg-paper-dim py-24 sm:py-28 lg:py-36">
      <Container>
        <Reveal>
          <Eyebrow index="07">Notre méthode</Eyebrow>
          <h2 className="mt-4 max-w-lg font-serif text-[1.9rem] leading-[1.15] text-ink sm:text-[2.3rem]">
            De l&rsquo;estimation à la signature, six étapes maîtrisées
          </h2>
        </Reveal>

        <div ref={ref} className="relative mt-16">
          <div className="absolute left-[0.5px] top-0 hidden h-full w-px bg-stone-dark sm:block" aria-hidden="true">
            <motion.div
              style={{ scaleY: progress }}
              className="h-full w-full origin-top bg-clay"
            />
          </div>

          <ol className="space-y-14 sm:pl-12">
            {processSteps.map((step, i) => (
              <Reveal as="li" key={step.index} delay={i * 0.04} className="relative grid grid-cols-1 gap-2 sm:grid-cols-12 sm:gap-8">
                <div className="sm:col-span-2">
                  <span className="font-serif text-2xl text-clay">{step.index}</span>
                </div>
                <h3 className="font-serif text-xl text-ink sm:col-span-3">{step.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft sm:col-span-7">{step.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
