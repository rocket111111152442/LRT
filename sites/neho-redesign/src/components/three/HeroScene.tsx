"use client";

import dynamic from "next/dynamic";
import { useCanRender3D } from "@/lib/hooks/use-webgl-support";
import { PropertyIllustration } from "@/components/illustrations/PropertyIllustration";

const HouseScene = dynamic(() => import("./HouseScene").then((m) => m.HouseScene), {
  ssr: false,
  loading: () => null,
});

/**
 * Sélectionne, côté client uniquement, entre la scène 3D légère et
 * l'illustration statique de repli (WebGL indisponible, viewport mobile,
 * ou `prefers-reduced-motion`). Le rendu serveur affiche toujours
 * l'illustration statique pour éviter tout flash de contenu.
 */
export function HeroScene({ label }: { label: string }) {
  const { ready, canRender } = useCanRender3D();

  if (!ready || !canRender) {
    return <PropertyIllustration variant="villa" label={label} className="h-full w-full rounded-3xl" />;
  }

  return (
    <div className="h-full w-full rounded-3xl bg-gradient-to-br from-ivy-100 via-cream-100 to-stone-200">
      <HouseScene />
    </div>
  );
}
