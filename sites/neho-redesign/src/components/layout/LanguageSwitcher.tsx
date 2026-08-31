"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales, localeLabels, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/format";

function pathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/");
  segments.splice(1, 1);
  const rest = segments.join("/");
  return rest === "" ? "/" : rest;
}

export function LanguageSwitcher({ locale, label, dark }: { locale: Locale; label: string; dark?: boolean }) {
  const pathname = usePathname();
  const rest = pathWithoutLocale(pathname);

  return (
    <div className="relative inline-flex items-center gap-1 text-sm" aria-label={label}>
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest === "/" ? "" : rest}`}
          hrefLang={l}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 font-medium transition-colors",
            l === locale
              ? dark
                ? "bg-cream-50 text-ink-900"
                : "bg-ink-900 text-cream-50"
              : dark
                ? "text-cream-50/70 hover:text-cream-50"
                : "text-ink-500 hover:text-ink-900",
          )}
        >
          {localeLabels[l].slice(0, 2).toUpperCase()}
          <span className="sr-only"> — {localeLabels[l]}</span>
        </Link>
      ))}
    </div>
  );
}
