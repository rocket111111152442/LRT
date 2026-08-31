import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DemoBadge } from "@/components/ui/Badge";
import { PropertySearchClient } from "@/components/properties/PropertySearchClient";
import { properties } from "@/lib/data/properties";
import { parseFiltersFromSearchParams } from "@/lib/search/filter-properties";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/biens", title: dict.properties.hero.title, description: dict.properties.hero.description });
}

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const sp = await searchParams;
  const initialFilters = parseFiltersFromSearchParams(sp);
  const openAlertOnLoad = sp.alerte === "1";
  const debugForceError = sp.forceError === "1";

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: dict.common.breadcrumbHome, href: "" }, { label: dict.nav.buy }]} />
        <div className="mb-8 mt-6 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">{dict.properties.hero.title}</h1>
          <DemoBadge label={dict.meta.demoBadge} />
        </div>
        <p className="mb-8 max-w-2xl text-ink-500">{dict.properties.hero.description}</p>

        <PropertySearchClient
          locale={locale}
          dict={dict}
          allProperties={properties}
          initialFilters={initialFilters}
          openAlertOnLoad={openAlertOnLoad}
          debugForceError={debugForceError}
        />
      </Container>
    </div>
  );
}
