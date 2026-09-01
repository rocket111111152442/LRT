"use client";

import { useState } from "react";
import Image from "next/image";
import { ArchitecturalScene } from "@/components/illustrations/ArchitecturalScene";
import type { SceneVariant } from "@/components/illustrations/ArchitecturalScene";

export function PropertyGallery({
  gallery,
  photos,
  title,
}: {
  gallery: SceneVariant[];
  photos?: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const usePhotos = !!photos && photos.length > 0;
  const count = usePhotos ? photos!.length : gallery.length;

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden bg-stone sm:aspect-[16/9]">
        {usePhotos ? (
          <Image src={photos![active] ?? photos![0]!} alt={title} fill sizes="100vw" className="object-cover" priority />
        ) : (
          <ArchitecturalScene variant={gallery[active] ?? gallery[0]!} label={title} className="h-full w-full" />
        )}
      </div>
      {count > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {(usePhotos ? photos! : gallery).map((item, i) => (
            <button
              key={`${item}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Voir la vue ${i + 1}`}
              aria-pressed={active === i}
              className="relative aspect-[4/3] overflow-hidden bg-stone focus-visible:outline-offset-2"
            >
              {usePhotos ? (
                <Image src={item as string} alt="" fill sizes="120px" className="object-cover" />
              ) : (
                <ArchitecturalScene variant={item as SceneVariant} className="h-full w-full" />
              )}
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
