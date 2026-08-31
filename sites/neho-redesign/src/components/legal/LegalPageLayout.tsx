import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import type { Locale } from "@/lib/i18n/config";

export function LegalPageLayout({
  locale,
  homeLabel,
  title,
  updated,
  sections,
  children,
}: {
  locale: Locale;
  homeLabel: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
  children?: React.ReactNode;
}) {
  return (
    <div className="py-10 sm:py-14">
      <Container narrow>
        <Breadcrumbs locale={locale} items={[{ label: homeLabel, href: "" }, { label: title }]} />
        <h1 className="mt-6 font-display text-3xl text-ink-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-xs text-ink-500">{updated}</p>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl text-ink-900">{section.heading}</h2>
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {children}
      </Container>
    </div>
  );
}
