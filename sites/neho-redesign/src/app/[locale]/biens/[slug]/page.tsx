import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BedDouble, Ruler, Trees, Car, Calendar } from "lucide-react";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { AgentAvatar } from "@/components/ui/AgentAvatar";
import { FrenchContent } from "@/components/ui/FrenchContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { propertyJsonLd } from "@/lib/seo/jsonld";
import { PropertyGallery } from "@/components/properties/PropertyGallery";
import { FinancingCalculator } from "@/components/properties/FinancingCalculator";
import { PropertyMapView } from "@/components/properties/PropertyMapView";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { VisitRequestForm } from "@/components/forms/VisitRequestForm";
import { getPropertyBySlug, getSimilarProperties, properties } from "@/lib/data/properties";
import { getCommuneBySlug } from "@/lib/data/communes";
import { getAgentBySlug } from "@/lib/data/agents";
import { formatCHF } from "@/lib/utils/format";

export function generateStaticParams() {
  return locales.flatMap((locale) => properties.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const property = getPropertyBySlug(slug);
  if (!property) return buildMetadata({ locale, path: `/biens/${slug}`, title: dict.notFound.title, description: dict.notFound.description, noIndex: true });
  const commune = getCommuneBySlug(property.commune);
  return buildMetadata({
    locale,
    path: `/biens/${slug}`,
    title: `${property.title} — ${commune?.name}`,
    description: property.description.slice(0, 155),
  });
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const commune = getCommuneBySlug(property.commune);
  const agent = getAgentBySlug(property.agentSlug);
  const similar = getSimilarProperties(property);
  const t = dict.propertyDetail;

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <JsonLd data={propertyJsonLd(property, commune?.name ?? "")} />
        <Breadcrumbs
          locale={locale}
          items={[
            { label: dict.common.breadcrumbHome, href: "" },
            { label: dict.nav.buy, href: "/biens" },
            { label: property.title },
          ]}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <DemoBadge label={t.demoNotice} />
          {property.availability !== "disponible" ? <Badge tone="stone">{dict.properties.availability[property.availability === "sous-offre" ? "sousOffre" : "vendu"]}</Badge> : null}
        </div>

        <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">{property.title}</h1>
            <p className="mt-1 text-ink-500">
              {commune?.name} — {t.location}
            </p>

            <div className="mt-6">
              <PropertyGallery property={property} labels={{ photos: t.gallery.photos, virtualTour: t.gallery.virtualTour, plans: t.gallery.plans, demoNotice: t.demoNotice }} />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-stone-200 p-5 sm:grid-cols-4">
              <Characteristic icon={BedDouble} label={t.characteristicsLabels.rooms} value={property.rooms > 0 ? String(property.rooms) : "—"} />
              <Characteristic icon={Ruler} label={t.characteristicsLabels.surface} value={property.surface > 0 ? `${property.surface} m²` : "—"} />
              <Characteristic icon={Trees} label={t.characteristicsLabels.land} value={property.landSurface ? `${property.landSurface} m²` : "—"} />
              <Characteristic icon={Car} label={t.characteristicsLabels.parking} value={String(property.parkingSpaces)} />
              <Characteristic icon={Calendar} label={t.characteristicsLabels.year} value={property.yearBuilt > 0 ? String(property.yearBuilt) : "—"} />
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl text-ink-900">{t.description}</h2>
              <FrenchContent locale={locale} notice={dict.common.contentInFrench} as="p" className="mt-3 leading-relaxed text-ink-700">
                {property.description}
              </FrenchContent>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl text-ink-900">{t.location}</h2>
              <p className="mt-1 text-sm text-ink-500">{commune?.description}</p>
              <div className="mt-4">
                <PropertyMapView properties={[property]} locale={locale} hint={dict.properties.mapHint} />
              </div>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-stone-200 bg-cream-50 p-6">
              <p className="text-xs uppercase tracking-wide text-ink-500">{t.priceLabel}</p>
              <p className="font-display text-3xl text-ink-900">{formatCHF(property.price, locale)}</p>
            </div>

            {agent ? (
              <div className="rounded-2xl border border-stone-200 bg-cream-50 p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-900">{t.agent.title}</h2>
                <div className="flex items-center gap-3">
                  <AgentAvatar agent={agent} size={56} />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{agent.name}</p>
                    <p className="text-xs text-ink-500">{agent.role}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <VisitRequestForm propertySlug={property.slug} dict={dict} />
                </div>
              </div>
            ) : null}

            <FinancingCalculator price={property.price} locale={locale} dict={dict} />
          </aside>
        </div>

        {similar.length > 0 ? (
          <div className="mt-16">
            <h2 className="font-display text-2xl text-ink-900">{t.similar}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <PropertyCard key={p.slug} property={p} locale={locale} availabilityLabels={dict.properties.availability} />
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </div>
  );
}

function Characteristic({ icon: Icon, label, value }: { icon: typeof BedDouble; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon size={20} className="text-ivy-600" aria-hidden="true" />
      <span className="mt-1.5 font-display text-lg text-ink-900">{value}</span>
      <span className="text-xs text-ink-500">{label}</span>
    </div>
  );
}
