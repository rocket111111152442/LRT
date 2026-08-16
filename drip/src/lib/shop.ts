/**
 * Configuration éditoriale et commerciale de la boutique.
 * C'est le seul fichier à modifier pour changer les infos légales, les frais de
 * port ou les liens sociaux — rien n'est codé en dur dans les pages.
 */

export const SHOP = {
  name: "DRIP",
  legalName: "DRIP",
  tagline: "Casquettes en édition limitée",
  description:
    "DRIP dessine des casquettes en noir et blanc, produites en petites séries et expédiées depuis l'Europe.",
  email: process.env.NEXT_PUBLIC_SHOP_EMAIL ?? "contact@drip-store.fr",
  phone: process.env.NEXT_PUBLIC_SHOP_PHONE ?? "",
  address: process.env.NEXT_PUBLIC_SHOP_ADDRESS ?? "",
  siret: process.env.NEXT_PUBLIC_SHOP_SIRET ?? "",
  vatNumber: process.env.NEXT_PUBLIC_SHOP_VAT ?? "",
  hostingProvider: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA",
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://tiktok.com",
  },
} as const;

/** Frais de port en centimes, par zone. */
export const SHIPPING = {
  freeThreshold: 6000,
  standard: 490,
  express: 990,
  zones: [
    { code: "FR", label: "France métropolitaine", price: 490, delay: "2 à 4 jours ouvrés" },
    { code: "EU", label: "Union européenne", price: 790, delay: "4 à 7 jours ouvrés" },
    { code: "WORLD", label: "Reste du monde", price: 1490, delay: "7 à 14 jours ouvrés" },
  ],
} as const;

/** Pays livrés, utilisés par Stripe Checkout et le formulaire d'adresse. */
export const SHIPPING_COUNTRIES = [
  "FR",
  "BE",
  "LU",
  "CH",
  "DE",
  "ES",
  "IT",
  "NL",
  "PT",
  "AT",
  "IE",
  "GB",
] as const;

export const RETURN_WINDOW_DAYS = 14;

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= SHIPPING.freeThreshold ? 0 : SHIPPING.standard;
}

export function amountUntilFreeShipping(subtotal: number) {
  return Math.max(0, SHIPPING.freeThreshold - subtotal);
}
