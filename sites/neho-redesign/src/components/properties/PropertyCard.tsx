import Link from "next/link";
import { BedDouble, Ruler, MapPin } from "lucide-react";
import { PropertyIllustration } from "@/components/illustrations/PropertyIllustration";
import { Badge } from "@/components/ui/Badge";
import type { Property } from "@/lib/data/types";
import { getCommuneBySlug } from "@/lib/data/communes";
import { formatCHF } from "@/lib/utils/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

export function PropertyCard({
  property,
  locale,
  newLabel,
  availabilityLabels,
}: {
  property: Property;
  locale: Locale;
  newLabel?: string;
  availabilityLabels: Dictionary["properties"]["availability"];
}) {
  const commune = getCommuneBySlug(property.commune);
  const availability = availabilityLabels;

  return (
    <Link
      href={`/${locale}/biens/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-cream-50 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <PropertyIllustration
          variant={property.illustration}
          label={property.title}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {property.isNew && newLabel ? (
          <Badge tone="bronze" className="absolute left-3 top-3">
            {newLabel}
          </Badge>
        ) : null}
        {property.availability !== "disponible" ? (
          <span className="absolute right-3 top-3 rounded-full bg-ink-900/80 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-cream-50">
            {property.availability === "sous-offre" ? availability.sousOffre : availability.vendu}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-xl text-ink-900">{formatCHF(property.price, locale)}</p>
        <h3 className="mt-1 text-sm font-semibold text-ink-900 line-clamp-1">{property.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
          <MapPin size={12} aria-hidden="true" />
          {commune?.name}
        </p>
        <div className="mt-4 flex items-center gap-4 border-t border-stone-200 pt-3 text-xs text-ink-500">
          {property.rooms > 0 ? (
            <span className="flex items-center gap-1">
              <BedDouble size={14} aria-hidden="true" /> {property.rooms} p.
            </span>
          ) : null}
          {property.surface > 0 ? (
            <span className="flex items-center gap-1">
              <Ruler size={14} aria-hidden="true" /> {property.surface} m²
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
