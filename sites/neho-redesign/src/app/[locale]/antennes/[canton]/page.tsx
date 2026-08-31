import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AgentCard } from "@/components/ui/AgentCard";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessJsonLd } from "@/lib/seo/jsonld";
import { cantons, getCantonBySlug } from "@/lib/data/cantons";
import { getCommunesByCanton } from "@/lib/data/communes";
import { getAgentsByCanton } from "@/lib/data/agents";
import { getPropertiesByCanton } from "@/lib/data/properties";
import { getTestimonialsByCanton } from "@/lib/data/testimonials";
import { generateCantonFaq } from "@/lib/data/faq";
import { formatNumber } from "@/lib/utils/format";

export function generateStaticParams() {
  return locales.flatMap((locale) => cantons.map((c) => ({ locale, canton: c.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; canton: string }> }): Promise<Metadata> {
  const { locale: raw, canton: cantonSlug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const canton = getCantonBySlug(cantonSlug);
  if (!canton) return buildMetadata({ locale, path: `/antennes/${cantonSlug}`, title: dict.notFound.title, description: dict.notFound.description, noIndex: true });
  return buildMetadata({
    locale,
    path: `/antennes/${canton.slug}`,
    title: `${dict.meta.siteName} — ${canton.name}`,
    description: canton.description,
  });
}

export default async function CantonPage({ params }: { params: Promise<{ locale: string; canton: string }> }) {
  const { locale: raw, canton: cantonSlug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const canton = getCantonBySlug(cantonSlug);
  if (!canton) notFound();

  const communes = getCommunesByCanton(canton.slug);
  const agents = getAgentsByCanton(canton.slug);
  const properties = getPropertiesByCanton(canton.slug);
  const testimonials = getTestimonialsByCanton(canton.slug);
  const faq = generateCantonFaq(canton);
  const t = dict.regions.canton;

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <JsonLd data={localBusinessJsonLd(canton)} />
        <Breadcrumbs
          locale={locale}
          items={[
            { label: dict.common.breadcrumbHome, href: "" },
            { label: dict.nav.menu.discoverRegions, href: "/antennes" },
            { label: canton.name },
          ]}
        />
        <h1 className="mt-6 font-display text-3xl text-ink-900 sm:text-4xl">{canton.name}</h1>
        <p className="mt-1 text-sm font-medium text-ivy-600">{canton.heroFact}</p>
        <p className="mt-3 max-w-2xl text-ink-500">{canton.description}</p>

        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-900">{t.statsTitle}</h2>
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-stone-200 bg-cream-100/50 p-6">
            <Stat value={`${formatNumber(canton.stats.averagePricePerSqm, locale)} CHF`} label="/ m²" />
            <Stat value={String(canton.stats.medianSaleDays)} label="jours de vente médians" />
            <Stat value={String(canton.stats.activeListings)} label="biens actifs (démo)" />
          </div>
        </div>

        {agents.length > 0 ? (
          <div className="mt-12">
            <SectionHeading title={t.agentsTitle} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent.slug} agent={agent} locale={locale} contactLabel={dict.team.agentCard.contact} />
              ))}
            </div>
          </div>
        ) : null}

        {communes.length > 0 ? (
          <div className="mt-12">
            <SectionHeading title={t.communesTitle} />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {communes.map((commune) => (
                <Link
                  key={commune.slug}
                  href={`/${locale}/antennes/${canton.slug}/${commune.slug}`}
                  className="rounded-xl border border-stone-200 bg-cream-50 p-4 transition-colors hover:border-ivy-400"
                >
                  <p className="font-medium text-ink-900">{commune.name}</p>
                  <p className="mt-1 text-xs text-ink-500">{formatNumber(commune.averagePricePerSqm, locale)} CHF/m²</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {properties.length > 0 ? (
          <div className="mt-12">
            <SectionHeading title={t.propertiesTitle} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => (
                <PropertyCard key={p.slug} property={p} locale={locale} availabilityLabels={dict.properties.availability} />
              ))}
            </div>
          </div>
        ) : null}

        {testimonials.length > 0 ? (
          <div className="mt-12">
            <SectionHeading title={dict.home.testimonials.title} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.slug}
                  testimonial={testimonial}
                  locale={locale}
                  verifiedLabel={dict.home.testimonials.verifiedBadge}
                  frenchNotice={dict.common.contentInFrench}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12 max-w-2xl">
          <SectionHeading title={t.faqTitle} />
          <div className="mt-6">
            <FaqAccordion items={faq} />
          </div>
        </div>
      </Container>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-xl text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{label}</p>
    </div>
  );
}
