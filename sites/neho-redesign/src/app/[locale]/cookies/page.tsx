import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { CookiePreferences } from "@/components/legal/CookiePreferences";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/cookies", title: dict.legal.cookies.title, description: dict.legal.cookies.title });
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const t = dict.legal.cookies;

  return (
    <LegalPageLayout locale={locale} homeLabel={dict.common.breadcrumbHome} title={t.title} updated={t.updated} sections={t.sections}>
      <CookiePreferences dict={dict} />
    </LegalPageLayout>
  );
}
