"use client";

import { useState } from "react";
import { Artwork } from "@/components/illustrations/artwork";
import type { SceneName } from "@/components/illustrations/scenes";

export function PropertyGallery({ scenes, tone = "stone" }: { scenes: SceneName[]; tone?: "stone" | "ivory" }) {
  const [active, setActive] = useState(0);
  const activeScene = scenes[active] ?? scenes[0] ?? "facade";

  return (
    <div>
      <Artwork scene={activeScene} tone={tone} ratio="wide" className="sm:aspect-[16/8]" />
      <div className="mt-3 grid grid-cols-4 gap-3">
        {scenes.map((scene, i) => (
          <button
            key={`${scene}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Voir la vue ${i + 1}`}
            aria-current={i === active}
            className={`transition-opacity ${i === active ? "opacity-100" : "opacity-45 hover:opacity-80"}`}
          >
            <Artwork scene={scene} tone={tone} ratio="square" showCaption={false} />
          </button>
        ))}
      </div>
    </div>
  );
}
