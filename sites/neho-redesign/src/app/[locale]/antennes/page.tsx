import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RegionsMapAnimated } from "@/components/home/RegionsMapAnimated";
import { cantons } from "@/lib/data/cantons";
import { getCommunesByCanton } from "@/lib/data/communes";
import { getAgentsByCanton } from "@/lib/data/agents";
import { formatNumber } from "@/lib/utils/format";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/antennes", title: dict.regions.hero.title, description: dict.regions.hero.description });
}

export default async function RegionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: dict.common.breadcrumbHome, href: "" }, { label: dict.nav.menu.discoverRegions }]} />
        <h1 className="mt-6 font-display text-3xl text-ink-900 sm:text-4xl">{dict.regions.hero.title}</h1>
        <p className="mt-3 max-w-2xl text-ink-500">{dict.regions.hero.description}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="aspect-square overflow-hidden rounded-3xl bg-night-900">
            <RegionsMapAnimated />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {cantons.map((canton) => {
              const communesCount = getCommunesByCanton(canton.slug).length;
              const agentsCount = getAgentsByCanton(canton.slug).length;
              return (
                <Link
                  key={canton.slug}
                  href={`/${locale}/antennes/${canton.slug}`}
                  className="group flex flex-col rounded-2xl border border-stone-200 bg-cream-50 p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg text-ink-900">{canton.name}</h2>
                    <ArrowUpRight size={16} className="text-ivy-600 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </div>
                  <p className="mt-1 text-xs text-ink-500">{canton.heroFact}</p>
                  <p className="mt-4 text-xs text-ink-500">
                    {agentsCount} {dict.home.regionsMap.statAgents} · {communesCount} {dict.regions.canton.communesTitle.toLowerCase()} · {formatNumber(canton.stats.averagePricePerSqm, locale)} CHF/m²
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
