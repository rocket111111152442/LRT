import Link from "next/link";
import { BedDouble, Ruler, MapPin, Heart } from "lucide-react";
import { PropertyIllustration } from "@/components/illustrations/PropertyIllustration";
import type { Property } from "@/lib/data/types";
import { getCommuneBySlug } from "@/lib/data/communes";
import { formatCHF } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";
import type { Locale } from "@/lib/i18n/config";

export function PropertyListItem({
  property,
  locale,
  isFavorite,
  onToggleFavorite,
  favoriteLabel,
}: {
  property: Property;
  locale: Locale;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  favoriteLabel: string;
}) {
  const commune = getCommuneBySlug(property.commune);
  return (
    <div className="flex gap-4 rounded-2xl border border-stone-200 bg-cream-50 p-3 shadow-soft sm:gap-5 sm:p-4">
      <Link href={`/${locale}/biens/${property.slug}`} className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl sm:w-48">
        <PropertyIllustration variant={property.illustration} label={property.title} className="h-full w-full" />
      </Link>
      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link href={`/${locale}/biens/${property.slug}`} className="text-sm font-semibold text-ink-900 hover:underline sm:text-base">
              {property.title}
            </Link>
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={favoriteLabel}
              className="shrink-0 rounded-full p-1.5 text-ink-500 hover:bg-ivy-100/60 hover:text-ivy-600"
            >
              <Heart size={18} className={cn(isFavorite && "fill-ivy-600 text-ivy-600")} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
            <MapPin size={12} aria-hidden="true" />
            {commune?.name}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-ink-500">
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
          <p className="font-display text-lg text-ink-900">{formatCHF(property.price, locale)}</p>
        </div>
      </div>
    </div>
  );
}
