import Link from "next/link";
import type { Property } from "@/lib/data/properties";
import { formatChf, propertyStatusLabels, propertyTypeLabels } from "@/lib/data/properties";
import { ArchitecturalScene } from "@/components/illustrations/ArchitecturalScene";
import { cn } from "@/lib/utils/cn";

export function PropertyCard({
  property,
  aspect = "aspect-[4/5]",
  className,
}: {
  property: Property;
  priority?: boolean;
  aspect?: string;
  className?: string;
}) {
  const isSold = property.status === "vendu";

  return (
    <Link href={`/tous-nos-biens/${property.slug}`} className={cn("group block", className)}>
      <div className={cn("relative overflow-hidden", aspect)}>
        <ArchitecturalScene
          variant={property.scene}
          label={property.title}
          className={cn(
            "h-full w-full transition-transform duration-[1400ms] ease-luxury group-hover:scale-[1.045]",
            isSold && "grayscale",
          )}
        />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            className={cn(
              "bg-paper/90 px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.1em] text-ink backdrop-blur-sm",
              property.status === "disponible" && "text-pine",
              property.status === "sous-offre" && "text-clay",
              isSold && "text-ink-faint",
            )}
          >
            {propertyStatusLabels[property.status]}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-faint">
            {property.city} — {property.canton}
          </p>
          <h3 className="mt-1.5 font-serif text-lg leading-snug text-ink transition-colors duration-300 group-hover:text-clay">
            {property.title}
          </h3>
          <p className="mt-1.5 text-sm text-ink-faint">
            {propertyTypeLabels[property.type]}
            {property.rooms ? ` · ${property.rooms} pièces` : ""}
            {property.surfaceM2 ? ` · ${property.surfaceM2} m²` : ""}
            {property.landM2 && !property.surfaceM2 ? ` · ${property.landM2} m² de terrain` : ""}
          </p>
        </div>
        <p className="whitespace-nowrap font-feature-numeric text-[0.95rem] text-ink">
          CHF {formatChf(property.priceChf)}.—
        </p>
      </div>
    </Link>
  );
}
