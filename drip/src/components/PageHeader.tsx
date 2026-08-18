/** En-tête de page éditoriale : surtitre en petites capitales, titre massif. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="shell pb-14 pt-16 lg:pt-24">
      <p className="label reveal mb-6 text-[color:var(--color-smoke)]">({eyebrow})</p>

      <h1 className="display-xl reveal-mask max-w-[18ch]">
        <span>{title}</span>
      </h1>

      {intro && (
        <p className="reveal mt-8 max-w-[58ch] text-pretty text-base leading-relaxed text-[color:var(--color-ink-soft)]">
          {intro}
        </p>
      )}

      {children}
    </header>
  );
}

/** Corps de page légale : colonne étroite, hiérarchie sobre. */
export function LegalBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell pb-24">
      <div className="hairline max-w-[70ch] space-y-10 pt-12 [&_a]:underline [&_h2]:display-lg [&_h2]:mb-4 [&_h3]:label [&_h3]:mb-3 [&_li]:mb-2 [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-sm">
        {children}
      </div>
    </div>
  );
}
