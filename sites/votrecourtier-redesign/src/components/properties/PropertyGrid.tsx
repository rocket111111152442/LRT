import { Reveal } from "@/components/animation/Reveal";
import { PropertyCard } from "@/components/properties/PropertyCard";
import type { Property } from "@/lib/data/properties";

export function PropertyGrid({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return (
      <p className="border-t border-stone py-16 text-sm text-ink-faint">
        Aucun bien ne correspond à ces critères pour le moment. Contactez-nous : de nouveaux mandats sont
        régulièrement ajoutés avant même leur diffusion publique.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, i) => (
        <Reveal key={property.slug} delay={(i % 3) * 0.06}>
          <PropertyCard property={property} priority={i < 3} />
        </Reveal>
      ))}
    </div>
  );
}
