export interface NavLink {
  href: string;
  labelKey: string;
  descKey?: string;
}

/**
 * Structure de navigation : trois parcours distincts (Vendre / Acheter /
 * Découvrir), conformément au brief. Les libellés viennent du dictionnaire
 * i18n (`nav.menu.*`), cette structure ne fait que fixer l'ordre et les
 * routes.
 */
export const navStructure = {
  sell: [
    { href: "/estimation", labelKey: "sellEstimate", descKey: "sellEstimateDesc" },
    { href: "/vendre", labelKey: "sellHow", descKey: "sellHowDesc" },
    { href: "/offres", labelKey: "sellPricing", descKey: "sellPricingDesc" },
  ] satisfies NavLink[],
  buy: [
    { href: "/biens", labelKey: "buySearch", descKey: "buySearchDesc" },
    { href: "/acheter#capacite", labelKey: "buyCapacity", descKey: "buyCapacityDesc" },
    { href: "/biens?alerte=1", labelKey: "buyAlerts", descKey: "buyAlertsDesc" },
  ] satisfies NavLink[],
  discover: [
    { href: "/a-propos", labelKey: "discoverAbout", descKey: "discoverAboutDesc" },
    { href: "/equipe", labelKey: "discoverAgents", descKey: "discoverAgentsDesc" },
    { href: "/antennes", labelKey: "discoverRegions", descKey: "discoverRegionsDesc" },
    { href: "/temoignages", labelKey: "discoverTestimonials", descKey: "discoverTestimonialsDesc" },
    { href: "/blog", labelKey: "discoverBlog", descKey: "discoverBlogDesc" },
    { href: "/neho-pro", labelKey: "discoverPro", descKey: "discoverProDesc" },
  ] satisfies NavLink[],
} as const;

export const footerLegalHrefs = {
  mentions: "/mentions-legales",
  privacy: "/confidentialite",
  cookies: "/cookies",
} as const;
