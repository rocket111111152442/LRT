"use client";

import { useId, useState } from "react";
import { View } from "lucide-react";
import { PropertyIllustration } from "@/components/illustrations/PropertyIllustration";
import { cn } from "@/lib/utils/format";
import type { Property } from "@/lib/data/types";

type Tab = "photos" | "tour" | "plans";

export function PropertyGallery({
  property,
  labels,
}: {
  property: Property;
  labels: { photos: string; virtualTour: string; plans: string; demoNotice: string };
}) {
  const tabs: Tab[] = ["photos", ...(property.hasVirtualTour ? (["tour"] as const) : []), ...(property.hasFloorPlans ? (["plans"] as const) : [])];
  const [tab, setTab] = useState<Tab>("photos");
  const baseId = useId();

  return (
    <div>
      <div role="tablist" aria-label={labels.photos} className="mb-3 flex gap-2">
        {tabs.map((key) => (
          <button
            key={key}
            role="tab"
            id={`${baseId}-${key}-tab`}
            aria-controls={`${baseId}-${key}-panel`}
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === key ? "bg-ink-900 text-cream-50" : "bg-stone-200 text-ink-700 hover:bg-stone-300",
            )}
          >
            {key === "photos" ? labels.photos : key === "tour" ? labels.virtualTour : labels.plans}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-${tab}-panel`}
        aria-labelledby={`${baseId}-${tab}-tab`}
        className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-stone-200"
      >
        <PropertyIllustration variant={property.illustration} label={property.title} className="h-full w-full" />
        {tab === "tour" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-900/40">
            <span className="flex items-center gap-2 rounded-full bg-cream-50 px-5 py-2.5 font-medium text-ink-900">
              <View size={18} aria-hidden="true" /> {labels.virtualTour}
            </span>
          </div>
        ) : null}
        {tab === "plans" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-cream-50/70">
            <PlanPlaceholder />
          </div>
        ) : null}
        <span className="absolute bottom-3 left-3 rounded-full bg-ink-900/80 px-3 py-1 text-[0.7rem] font-medium text-cream-50">
          {labels.demoNotice}
        </span>
      </div>
    </div>
  );
}

function PlanPlaceholder() {
  return (
    <svg viewBox="0 0 200 140" className="h-2/3 w-2/3 text-ink-700" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="10" y="10" width="180" height="120" />
      <line x1="90" y1="10" x2="90" y2="80" />
      <line x1="90" y1="80" x2="190" y2="80" />
      <line x1="10" y1="80" x2="90" y2="80" />
      <line x1="140" y1="80" x2="140" y2="130" />
      <path d="M90 10a20 20 0 0 1 0 30" opacity="0.5" />
    </svg>
  );
}
