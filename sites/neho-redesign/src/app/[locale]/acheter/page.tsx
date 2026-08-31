import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { BuyCapacityCalculator } from "@/components/home/BuyCapacityCalculator";
import { PropertiesPreview } from "@/components/home/PropertiesPreview";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/acheter", title: dict.buy.hero.title, description: dict.buy.hero.description });
}

export default async function BuyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const t = dict.buy;

  return (
    <div>
      <div className="bg-cream-100/60 py-14 sm:py-20">
        <Container>
          <Breadcrumbs locale={locale} items={[{ label: dict.common.breadcrumbHome, href: "" }, { label: dict.nav.buy }]} />
          <div className="mt-6 max-w-2xl">
            <SectionHeading eyebrow={t.hero.eyebrow} title={t.hero.title} description={t.hero.description} />
            <Button href={`/${locale}/biens`} size="lg" className="mt-6">
              {t.hero.cta}
            </Button>
          </div>
        </Container>
      </div>

      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading eyebrow={dict.nav.menu.buyCapacity} title={t.capacity.title} description={t.capacity.description} align="center" className="mx-auto" />
          <div className="mt-10">
            <BuyCapacityCalculator locale={locale} dict={dict} />
          </div>
        </Container>
      </section>

      <PropertiesPreview locale={locale} dict={dict} />

      <section className="bg-night-900 py-16 text-center text-cream-50 sm:py-24">
        <Container className="flex flex-col items-center">
          <h2 className="max-w-xl font-display text-3xl">{t.alerts.title}</h2>
          <p className="mt-3 max-w-lg text-cream-50/80">{t.alerts.description}</p>
          <Button href={`/${locale}/biens?alerte=1`} variant="outline-light" size="lg" className="mt-7">
            {t.alerts.cta}
          </Button>
        </Container>
      </section>
    </div>
  );
}
