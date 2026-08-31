export function formatPrice(value: number | null, options?: { perMonth?: boolean }): string {
  if (value === null) return "Prix sur demande";
  const formatted = new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(value);
  return options?.perMonth ? `${formatted} / mois` : formatted;
}

export function formatSurface(value: number): string {
  return `${new Intl.NumberFormat("fr-CH").format(value)} m²`;
}

export function formatRooms(value: number): string {
  if (!value) return "—";
  return `${new Intl.NumberFormat("fr-CH", { maximumFractionDigits: 1 }).format(value)} pièces`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
