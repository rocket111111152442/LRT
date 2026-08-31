import type { Locale } from "@/lib/i18n/config";

/**
 * Enveloppe un contenu du jeu de données de démonstration (toujours rédigé
 * en français, voir src/lib/data). Sur les pages en anglais, marque le
 * texte avec `lang="fr"` (balisage correct plutôt qu'un mélange de langues
 * silencieux) et affiche une courte mention. Sur les pages en français,
 * ne change rien.
 */
export function FrenchContent({
  locale,
  notice,
  children,
  as: As = "div",
  className,
}: {
  locale: Locale;
  notice: string;
  children: React.ReactNode;
  as?: "div" | "span" | "p";
  className?: string;
}) {
  if (locale === "fr") {
    const Tag = As;
    return <Tag className={className}>{children}</Tag>;
  }

  const Tag = As;
  return (
    <Tag className={className}>
      <span lang="fr">{children}</span>
      <span className="mt-1 block text-xs italic text-ink-500">{notice}</span>
    </Tag>
  );
}
