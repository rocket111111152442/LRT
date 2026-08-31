import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DemoBadge } from "@/components/ui/Badge";
import { EstimationWizard } from "@/components/forms/EstimationWizard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/estimation", title: dict.estimation.hero.title, description: dict.estimation.hero.description });
}

export default async function EstimationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  return (
    <div className="bg-cream-100/40 py-12 sm:py-16">
      <Container narrow>
        <Breadcrumbs locale={locale} items={[{ label: dict.common.breadcrumbHome, href: "" }, { label: dict.nav.menu.sellEstimate }]} />
        <div className="mt-6 mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <DemoBadge label={dict.meta.demoBadge} />
          </div>
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">{dict.estimation.hero.title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-ink-500">{dict.estimation.hero.description}</p>
        </div>
        <EstimationWizard locale={locale} dict={dict} />
      </Container>
    </div>
  );
}
