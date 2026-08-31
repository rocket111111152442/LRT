export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

/**
 * Langues réellement identifiées sur le site public de référence lors de
 * l'audit (fr / de / en, voir docs/neho-audit.md §1 et §2). L'architecture
 * de routage supporte l'ajout de `de` (et `it` si confirmé) en ajoutant un
 * fichier dictionnaire + des traductions de contenu, sans changer la
 * structure des routes. Seuls `fr` (complet) et `en` (démonstration) sont
 * livrés dans ce concept — voir README.md « Ce qui est réel vs démonstration ».
 */
export const localeLabels: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
