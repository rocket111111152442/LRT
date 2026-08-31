import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const f = dict.footer;
  const year = new Date().getFullYear();

  const columns = [f.columns.sell, f.columns.buy, f.columns.company, f.columns.legal];

  return (
    <footer className="relative overflow-hidden border-t border-night-line bg-night-900 text-cream-50">
      <div className="grain pointer-events-none absolute inset-0" />
      <Container className="relative py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <Logo size="md" />
              <span className="font-display text-lg font-medium text-cream-50/80">Concept</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-50/70">{f.tagline}</p>
            <div className="mt-6">
              <DemoBadge label={dict.meta.demoBadge} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-cream-50/50">{col.title}</h3>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={`/${locale}${link.href}`} className="text-sm text-cream-50/80 hover:text-cream-50">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-cream-50/15 bg-cream-50/5 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg">{f.newsletter.title}</p>
              <p className="mt-1 text-sm text-cream-50/65">{f.newsletter.description}</p>
            </div>
            <NewsletterForm placeholder={f.newsletter.placeholder} cta={f.newsletter.cta} />
          </div>
          <p className="mt-3 text-xs text-cream-50/65">{f.newsletter.disclaimer}</p>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-cream-50/10 pt-6 text-xs text-cream-50/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. {f.rights}
          </p>
          <p className="max-w-2xl">{f.disclaimer}</p>
        </div>
      </Container>
    </footer>
  );
}
