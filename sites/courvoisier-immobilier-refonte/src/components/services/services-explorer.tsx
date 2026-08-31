"use client";

import { useState } from "react";
import { services } from "@/lib/data/services";
import { Artwork } from "@/components/illustrations/artwork";
import type { SceneName } from "@/components/illustrations/scenes";
import { IconCheck } from "@/components/ui/icons";

const SCENE_BY_SLUG: Record<string, SceneName> = {
  estimation: "horizon",
  courtage: "facade",
  promotion: "plan",
  conseil: "staircase",
  gerance: "roofline",
};

export function ServicesExplorer() {
  const [activeSlug, setActiveSlug] = useState(services[0]?.slug ?? "");
  const active = services.find((s) => s.slug === activeSlug) ?? services[0];
  if (!active) return null;

  return (
    <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
      <ul>
        {services.map((service) => (
          <li key={service.slug} id={service.slug} className="scroll-mt-32 border-b border-[var(--color-stone-dark)] first:border-t">
            <button
              type="button"
              onMouseEnter={() => setActiveSlug(service.slug)}
              onFocus={() => setActiveSlug(service.slug)}
              onClick={() => setActiveSlug(service.slug)}
              className={`flex w-full items-baseline gap-6 py-6 text-left transition-colors ${
                activeSlug === service.slug ? "text-[var(--color-ink)]" : "text-[var(--color-graphite-light)] hover:text-[var(--color-graphite)]"
              }`}
            >
              <span className="font-serif text-lg italic text-[var(--color-brown)]">{service.number}</span>
              <span className="font-serif text-3xl italic sm:text-4xl">{service.title}</span>
            </button>
          </li>
        ))}
      </ul>

      <div>
        <Artwork scene={SCENE_BY_SLUG[active.slug] ?? "facade"} ratio="landscape" />
        <p className="mt-7 font-sans text-base leading-relaxed text-[var(--color-graphite)]">
          {active.description}
        </p>
        <ul className="mt-6 space-y-3">
          {active.points.map((point) => (
            <li key={point} className="flex items-start gap-3 font-sans text-sm">
              <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-green)]" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
