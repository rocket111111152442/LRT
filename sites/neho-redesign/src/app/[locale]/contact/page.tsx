import type { Metadata } from "next";
import { Clock, MapPin } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactForm } from "@/components/forms/ContactForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/contact", title: dict.contact.hero.title, description: dict.contact.hero.description });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const t = dict.contact;

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: dict.common.breadcrumbHome, href: "" }, { label: dict.nav.contact }]} />
        <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">{t.hero.title}</h1>
            <p className="mt-3 max-w-md text-ink-500">{t.hero.description}</p>

            <div className="mt-8 rounded-2xl border border-stone-200 bg-cream-100/50 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-900">{t.info.title}</h2>
              <div className="mt-4 flex items-start gap-2 text-sm text-ink-700">
                <MapPin size={16} className="mt-0.5 shrink-0 text-ivy-600" aria-hidden="true" />
                {t.info.addressNote}
              </div>
              <div className="mt-3 flex items-start gap-2 text-sm text-ink-700">
                <Clock size={16} className="mt-0.5 shrink-0 text-ivy-600" aria-hidden="true" />
                <div>
                  <p className="font-medium">{t.info.hoursTitle}</p>
                  <p>{t.info.hours}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-cream-50 p-6 sm:p-8">
            <ContactForm dict={dict} />
          </div>
        </div>
      </Container>
    </div>
  );
}
