export function formatCHF(value: number, locale: "fr" | "en" = "fr"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CH" : "en-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, locale: "fr" | "en" = "fr"): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CH" : "en-CH").format(value);
}

export function formatDate(iso: string, locale: "fr" | "en" = "fr"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CH" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
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
