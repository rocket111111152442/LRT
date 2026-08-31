import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n/config";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ locale, items }: { locale: Locale; items: Crumb[] }) {
  const withUrls = items.map((item) => ({
    name: item.label,
    url: item.href ? `${siteConfig.url}/${locale}${item.href}` : `${siteConfig.url}/${locale}`,
  }));

  return (
    <nav aria-label="Fil d'Ariane" className="text-sm text-ink-500">
      <JsonLd data={breadcrumbJsonLd(withUrls)} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? <ChevronRight size={13} aria-hidden="true" /> : null}
            {item.href && index !== items.length - 1 ? (
              <Link href={`/${locale}${item.href}`} className="hover:text-ink-900 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current={index === items.length - 1 ? "page" : undefined} className={index === items.length - 1 ? "text-ink-900" : ""}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
