/**
 * Constantes de marque et coordonnées. Faits sourcés dans
 * ../../../docs/courvoisier-audit.md — ne pas modifier sans mettre à jour
 * ce document.
 */

export const siteConfig = {
  name: "Courvoisier Immobilier",
  legalName: "Courvoisier Immobilier SA",
  shortName: "Courvoisier",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.courvoisier.immo",
  tagline: "Une maison immobilière sur l’arc lémanique",
  description:
    "Courtage, promotion, conseil et gérance : Courvoisier Immobilier accompagne propriétaires, acheteurs, promoteurs et investisseurs entre Lausanne, Rolle et Lonay.",
  phone: "+41 21 728 50 50",
  phoneHref: "tel:+41217285050",
  email: "info@courvoisier.immo",
  founded: 2020,
  founders: [
    {
      name: "Dimitri Courvoisier",
      role: "Fondateur — développement & courtage",
      bio: "Titulaire du brevet fédéral de développeur immobilier, Dimitri a fondé l’agence sur trois principes : l’indépendance, l’agilité et la proximité.",
    },
    {
      name: "Célia Courvoisier",
      role: "Fondatrice — administration & stratégie",
      bio: "Diplômée en économie en Suisse et au Canada, Célia a débuté dans le conseil aux entreprises avant de poser les bases administratives et stratégiques de l’agence.",
    },
  ],
  social: {
    instagram: "https://www.instagram.com/courvoisier_immobilier/",
    facebook: "https://www.facebook.com/100063961663007",
  },
} as const;

export const NAV_LINKS = [
  { label: "Acheter", href: "/acheter" },
  { label: "Louer", href: "/louer" },
  { label: "Vendre", href: "/vendre" },
  { label: "Services", href: "/services" },
  { label: "Courvoisier", href: "/a-propos" },
] as const;

export const FOOTER_SERVICE_LINKS = [
  { label: "Estimation", href: "/estimer" },
  { label: "Courtage", href: "/services#courtage" },
  { label: "Promotion", href: "/promotion" },
  { label: "Conseil & développement", href: "/conseil-developpement" },
  { label: "Gérance", href: "/gerance" },
] as const;
