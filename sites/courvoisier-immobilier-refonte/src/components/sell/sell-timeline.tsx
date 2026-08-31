"use client";

import { useActiveStep } from "@/lib/hooks/use-active-step";
import { Artwork } from "@/components/illustrations/artwork";
import { sellSteps } from "@/lib/data/sell-steps";

export function SellTimeline() {
  const { activeIndex, setRef } = useActiveStep(sellSteps.length);
  const activeStep = sellSteps[activeIndex] ?? sellSteps[0];

  return (
    <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
      <div className="hidden lg:block">
        <div className="sticky top-28">
          {activeStep && <Artwork scene={activeStep.scene} tone="stone" ratio="square" className="max-w-md" />}
          <p className="mt-6 font-serif text-3xl italic">
            <span className="text-[var(--color-brown)]">{activeStep?.number}</span>
          </p>
        </div>
      </div>

      <div>
        {sellSteps.map((step, i) => (
          <div
            key={step.number}
            ref={setRef(i)}
            className="flex min-h-[60vh] flex-col justify-center border-t border-[var(--color-stone-dark)] py-10 first:border-t-0 lg:min-h-[70vh]"
          >
            <Artwork scene={step.scene} tone="stone" ratio="landscape" className="mb-8 max-w-sm lg:hidden" />
            <span
              className={`font-serif text-2xl italic transition-colors duration-500 ${
                i === activeIndex ? "text-[var(--color-brown)]" : "text-[var(--color-graphite-light)]"
              }`}
            >
              {step.number}
            </span>
            <h3
              className={`mt-3 font-sans text-2xl font-medium transition-opacity duration-500 sm:text-3xl ${
                i === activeIndex ? "opacity-100" : "opacity-50"
              }`}
            >
              {step.title}
            </h3>
            <p
              className={`mt-4 max-w-md font-sans text-base leading-relaxed transition-opacity duration-500 ${
                i === activeIndex ? "text-[var(--color-graphite)] opacity-100" : "text-[var(--color-graphite)] opacity-40"
              }`}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
