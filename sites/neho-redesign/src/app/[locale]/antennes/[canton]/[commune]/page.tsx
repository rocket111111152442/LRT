import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrendingUp, Clock, MapPin } from "lucide-react";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AgentCard } from "@/components/ui/AgentCard";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { FrenchContent } from "@/components/ui/FrenchContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessJsonLd } from "@/lib/seo/jsonld";
import { getCantonBySlug } from "@/lib/data/cantons";
import { communes, getCommuneBySlug } from "@/lib/data/communes";
import { getAgentsByCanton } from "@/lib/data/agents";
import { getPropertiesByCommune } from "@/lib/data/properties";
import { formatNumber } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

export function generateStaticParams() {
  return locales.flatMap((locale) => communes.map((c) => ({ locale, canton: c.canton, commune: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; canton: string; commune: string }>;
}): Promise<Metadata> {
  const { locale: raw, commune: communeSlug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const commune = getCommuneBySlug(communeSlug);
  if (!commune) return buildMetadata({ locale, path: `/antennes/x/${communeSlug}`, title: dict.notFound.title, description: dict.notFound.description, noIndex: true });
  return buildMetadata({
    locale,
    path: `/antennes/${commune.canton}/${commune.slug}`,
    title: `${dict.meta.siteName} — ${commune.name}`,
    description: commune.description,
  });
}

export default async function CommunePage({
  params,
}: {
  params: Promise<{ locale: string; canton: string; commune: string }>;
}) {
  const { locale: raw, canton: cantonSlug, commune: communeSlug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const canton = getCantonBySlug(cantonSlug);
  const commune = getCommuneBySlug(communeSlug);
  if (!canton || !commune || commune.canton !== canton.slug) notFound();

  const agents = getAgentsByCanton(canton.slug).filter((a) => a.communes.includes(commune.slug));
  const fallbackAgents = agents.length > 0 ? agents : getAgentsByCanton(canton.slug).slice(0, 1);
  const propertiesHere = getPropertiesByCommune(commune.slug);

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <JsonLd data={localBusinessJsonLd({ ...canton, name: commune.name, description: commune.description })} />
        <Breadcrumbs
          locale={locale}
          items={[
            { label: dict.common.breadcrumbHome, href: "" },
            { label: dict.nav.menu.discoverRegions, href: "/antennes" },
            { label: canton.name, href: `/antennes/${canton.slug}` },
            { label: commune.name },
          ]}
        />

        <div className="mt-6 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ivy-600">
          <MapPin size={14} aria-hidden="true" /> {canton.name} — {commune.postalCode}
        </div>
        <h1 className="mt-2 font-display text-3xl text-ink-900 sm:text-4xl">{commune.name}</h1>
        <FrenchContent locale={locale} notice={dict.common.contentInFrench} as="p" className="mt-3 max-w-2xl text-ink-500">
          {commune.description}
        </FrenchContent>

        <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-stone-200 bg-cream-100/50 p-6 sm:grid-cols-4">
          <MiniStat icon={TrendingUp} value={`${formatNumber(commune.averagePricePerSqm, locale)} CHF`} label="/ m²" />
          <MiniStat icon={TrendingUp} value={`${commune.priceTrendPercent > 0 ? "+" : ""}${commune.priceTrendPercent}%`} label="1 an (démo)" />
          <MiniStat icon={Clock} value={String(commune.averageDaysOnMarket)} label="jours (démo)" />
          <MiniStat icon={MapPin} value={formatNumber(commune.population, locale)} label="habitants" />
        </div>

        {fallbackAgents.length > 0 ? (
          <div className="mt-12">
            <SectionHeading title={dict.regions.canton.agentsTitle} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {fallbackAgents.map((agent) => (
                <AgentCard key={agent.slug} agent={agent} locale={locale} contactLabel={dict.team.agentCard.contact} />
              ))}
            </div>
          </div>
        ) : null}

        {propertiesHere.length > 0 ? (
          <div className="mt-12">
            <SectionHeading title={dict.regions.canton.propertiesTitle} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {propertiesHere.map((p) => (
                <PropertyCard key={p.slug} property={p} locale={locale} availabilityLabels={dict.properties.availability} />
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-12 text-sm text-ink-500">{dict.properties.empty.description}</p>
        )}

        <div className="mt-12 flex flex-col items-start gap-3 rounded-2xl border border-bronze-500/40 bg-bronze-100/50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-700">{dict.home.estimationCta.description}</p>
          <Button href={`/${locale}/estimation`} variant="bronze" className="shrink-0">
            {dict.common.ctaEstimateFree}
          </Button>
        </div>
      </Container>
    </div>
  );
}

function MiniStat({ icon: Icon, value, label }: { icon: typeof TrendingUp; value: string; label: string }) {
  return (
    <div className="text-center">
      <Icon size={16} className="mx-auto text-ivy-600" aria-hidden="true" />
      <p className="mt-1 font-display text-lg text-ink-900">{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  );
}
