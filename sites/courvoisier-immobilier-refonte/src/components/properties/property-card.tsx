import Link from "next/link";
import type { Property } from "@/lib/data/types";
import { formatPrice, formatRooms, formatSurface } from "@/lib/utils/format";
import { Artwork } from "@/components/illustrations/artwork";
import type { SceneName } from "@/components/illustrations/scenes";
import { IconArrowUpRight } from "@/components/ui/icons";

const SCENE_BY_CATEGORY: Record<Property["category"], SceneName> = {
  Maison: "roofline",
  Appartement: "facade",
  Immeuble: "facade",
  Terrain: "contour",
  Commercial: "plan",
};

interface PropertyCardProps {
  property: Property;
  variant?: "large" | "compact" | "row";
}

export function PropertyCard({ property, variant = "compact" }: PropertyCardProps) {
  const scene = SCENE_BY_CATEGORY[property.category];

  if (variant === "row") {
    return (
      <Link
        href={`/biens/${property.slug}`}
        className="group grid grid-cols-[6rem_1fr_auto] items-center gap-5 border-b border-[var(--color-stone-dark)] py-5 sm:grid-cols-[8rem_1fr_auto]"
      >
        <Artwork scene={scene} ratio="square" showCaption={false} className="transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">
            {property.locality}
          </p>
          <p className="mt-1 font-serif text-xl italic">{property.title}</p>
          <p className="mt-1 font-sans text-xs text-[var(--color-graphite)]">
            {formatRooms(property.rooms)} · {formatSurface(property.surface)}
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <span className="font-sans text-sm">{formatPrice(property.price, { perMonth: property.transaction === "location" })}</span>
          <IconArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/biens/${property.slug}`} className="group block">
      <Artwork
        scene={scene}
        ratio={variant === "large" ? "wide" : "landscape"}
        className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">
            {property.locality} · {property.category}
          </p>
          <p className={`mt-1.5 font-serif italic ${variant === "large" ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
            {property.title}
          </p>
          <p className="mt-2 font-sans text-sm text-[var(--color-graphite)]">
            {property.rooms > 0 && `${formatRooms(property.rooms)} · `}
            {formatSurface(property.surface || property.landSurface || 0)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 pt-1 text-right">
          <span className="font-sans text-sm">
            {formatPrice(property.price, { perMonth: property.transaction === "location" })}
          </span>
          <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </Link>
  );
}
