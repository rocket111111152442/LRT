/**
 * Regroupe les milliers avec une apostrophe fixe (convention suisse),
 * plutôt que de déléguer le séparateur à `Intl.NumberFormat` : le glyphe
 * utilisé par les locales "fr-CH"/"en-CH" (apostrophe simple vs typographique)
 * peut différer entre le moteur ICU du serveur (Node) et celui du
 * navigateur, ce qui provoque une erreur d'hydratation React. Un
 * formatage manuel garantit un résultat identique des deux côtés.
 */
function groupThousands(value: number): string {
  const rounded = Math.round(value);
  const negative = rounded < 0;
  const digits = Math.abs(rounded).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return negative ? `-${grouped}` : grouped;
}

export function formatCHF(value: number, locale: "fr" | "en" = "fr"): string {
  const amount = groupThousands(value);
  return locale === "fr" ? `CHF ${amount}.-` : `CHF ${amount}`;
}

export function formatNumber(value: number, locale: "fr" | "en" = "fr"): string {
  void locale; // réservé pour une future variation par locale ; le regroupement des milliers est déjà fixe (voir groupThousands).
  return groupThousands(value);
}

export function formatDate(iso: string, locale: "fr" | "en" = "fr"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CH" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
