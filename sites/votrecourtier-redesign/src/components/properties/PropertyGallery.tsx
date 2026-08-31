"use client";

import { useState } from "react";
import { ArchitecturalScene } from "@/components/illustrations/ArchitecturalScene";
import type { SceneVariant } from "@/components/illustrations/ArchitecturalScene";

export function PropertyGallery({ gallery, title }: { gallery: SceneVariant[]; title: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/9]">
        <ArchitecturalScene variant={gallery[active] ?? gallery[0]!} label={title} className="h-full w-full" />
      </div>
      {gallery.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {gallery.map((scene, i) => (
            <button
              key={`${scene}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Voir la vue ${i + 1}`}
              aria-pressed={active === i}
              className="relative aspect-[4/3] overflow-hidden focus-visible:outline-offset-2"
            >
              <ArchitecturalScene variant={scene} className="h-full w-full" />
              <span
                className={
                  active === i
                    ? "absolute inset-0 ring-2 ring-inset ring-clay"
                    : "absolute inset-0 bg-ink/0 transition-colors hover:bg-ink/10"
                }
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
