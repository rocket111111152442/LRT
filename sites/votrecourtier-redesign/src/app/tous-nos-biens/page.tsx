import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PropertyGrid } from "@/components/properties/PropertyGrid";
import { properties, propertyTypeLabels, type PropertyType } from "@/lib/data/properties";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Tous nos biens à vendre — Vaud & Fribourg",
  description:
    "Maisons, appartements, terrains, projets neufs et biens d'investissement à vendre dans les cantons de Vaud et Fribourg.",
  alternates: { canonical: "/tous-nos-biens" },
};

const types: { value: PropertyType | "tous"; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "maison", label: propertyTypeLabels.maison },
  { value: "appartement", label: propertyTypeLabels.appartement },
  { value: "terrain", label: propertyTypeLabels.terrain },
  { value: "projet-neuf", label: propertyTypeLabels["projet-neuf"] },
  { value: "investissement", label: propertyTypeLabels.investissement },
];

const cantons: { value: "VD" | "FR" | "tous"; label: string }[] = [
  { value: "tous", label: "Vaud & Fribourg" },
  { value: "VD", label: "Vaud" },
  { value: "FR", label: "Fribourg" },
];

export default async function TousNosBiensPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; canton?: string }>;
}) {
  const params = await searchParams;
  const activeType = (params.type as PropertyType | undefined) ?? "tous";
  const activeCanton = (params.canton as "VD" | "FR" | undefined) ?? "tous";

  const filtered = properties.filter((p) => {
    const typeMatch = activeType === "tous" || p.type === activeType;
    const cantonMatch = activeCanton === "tous" || p.canton === activeCanton;
    return typeMatch && cantonMatch;
  });

  function buildHref(next: { type?: string; canton?: string }) {
    const merged = { type: activeType, canton: activeCanton, ...next };
    const qp = new URLSearchParams();
    if (merged.type && merged.type !== "tous") qp.set("type", merged.type);
    if (merged.canton && merged.canton !== "tous") qp.set("canton", merged.canton);
    const qs = qp.toString();
    return qs ? `/tous-nos-biens?${qs}` : "/tous-nos-biens";
  }

  return (
    <>
      <PageHero
        eyebrow="Biens à vendre"
        title="Une sélection en cours de commercialisation"
        intro="Maisons, appartements, terrains, projets neufs et biens d'investissement à Vaud et à Fribourg. Ce jeu de biens est une démonstration : contactez-nous pour l'état réel de nos mandats en cours."
        scene="appartement"
      />
      <Section tone="paper" compact>
        <Container>
          <div className="flex flex-col gap-6 border-b border-stone pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <Link
                  key={t.value}
                  href={buildHref({ type: t.value })}
                  className={cn(
                    "px-4 py-2 text-[0.8125rem] transition-colors",
                    activeType === t.value ? "bg-ink text-paper" : "bg-paper-dim text-ink-soft hover:text-ink",
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {cantons.map((c) => (
                <Link
                  key={c.value}
                  href={buildHref({ canton: c.value })}
                  className={cn(
                    "px-4 py-2 text-[0.8125rem] transition-colors",
                    activeCanton === c.value ? "text-clay underline underline-offset-4" : "text-ink-faint hover:text-ink",
                  )}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <p className="mt-8 text-sm text-ink-faint">
            {filtered.length} bien{filtered.length > 1 ? "s" : ""}
          </p>

          <div className="mt-8">
            <PropertyGrid properties={filtered} />
          </div>
        </Container>
      </Section>
    </>
  );
}
