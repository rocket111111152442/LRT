/**
 * Réalisations Lullin Web.
 *
 * Source : https://www.lullin-web.com/realisations (relevé du 23/11/2026).
 * Les visuels de public/screens/ sont des captures pleine page de chaque site
 * en ligne, prises à cette date. `headline` est le titre H1 réel de la page
 * d'accueil du site (aucun texte inventé). Quand le H1 se limite au nom de la
 * marque, `headline` est laissé vide.
 *
 * Exclu : votrecourtier.ch (https://votrecourtier-redesign.vercel.app/), dont
 * le lien renvoyait une page 404 au moment du relevé.
 */

export type Project = {
  slug: string;
  name: string;
  url: string;
  /** Type de réalisation, tel qu'indiqué sur lullin-web.com. */
  kind: string;
  /** Secteur / localisation, tel qu'indiqué sur lullin-web.com. */
  sector: string;
  /** H1 réel du site. */
  headline?: string;
  /** Couleur d'accent (bordure lumineuse, liseré du personnage). */
  accent: string;
};

export const projects: Project[] = [
  { slug: "bloomed", name: "BLOOMED", url: "https://bloomed-six-fours.vercel.app", kind: "Site vitrine", sector: "Barbier & coiffeur · Six-Fours-les-Plages", headline: "La tête dans les nuages", accent: "#f27db6" },
  { slug: "petrin-de-pepiole", name: "Le Pétrin de Pépiole", url: "https://petrin-de-pepiole.vercel.app", kind: "Site vitrine & commande en ligne", sector: "Boulangerie artisanale · Sanary & Six-Fours", accent: "#e9893c" },
  { slug: "maison-pastier", name: "Maison Pastier", url: "https://maison-pastier.vercel.app", kind: "Site vitrine", sector: "Pâtes fraîches artisanales · Six-Fours", headline: "Pâtes fraîches, façonnées chaque jour.", accent: "#d7b46a" },
  { slug: "instinct-vegetal", name: "Instinct Végétal", url: "https://instinct-vegetal.vercel.app", kind: "Site vitrine", sector: "Paysagiste · Six-Fours-les-Plages", headline: "Jardins qui poussent juste.", accent: "#ef6f35" },
  { slug: "taco-j", name: "Taco J", url: "https://tacoj-site.vercel.app", kind: "Site vitrine", sector: "Restauration", headline: "Bold tacos. Two moods. One Taco J", accent: "#ff3b2f" },
  { slug: "nerial", name: "NÉRIAL", url: "https://nerial.vercel.app", kind: "Boutique e-commerce", sector: "Bracelets & montres", headline: "Du caractère. Sans en faire trop.", accent: "#e9dcc0" },
  { slug: "nicolas-sarazin", name: "Nicolas & Sarazin", url: "https://nicolas-sarazin.vercel.app/", kind: "Site vitrine", sector: "Expertise comptable · Toulon & La Garde", headline: "Votre ambition. Notre horizon.", accent: "#6fc1d6" },
  { slug: "qoravo", name: "Qoravo", url: "https://www.qoravo.fr", kind: "Application métier", sector: "Logiciel pour ateliers de réparation", headline: "Qoravo, le logiciel tout-en-un des réparateurs.", accent: "#3d8bff" },
  { slug: "adimen", name: "Agence ADIMEN", url: "https://adimen-alpha.vercel.app/", kind: "Site vitrine", sector: "Enquêtes privées · Suisse romande", headline: "Établir les faits, sans jamais se faire remarquer", accent: "#cfa65a" },
  { slug: "biorythme", name: "Biorythme", url: "https://www.lrt.life", kind: "Site vitrine", sector: "Salles de sport · Six-Fours & Sanary", accent: "#c8f53a" },
  { slug: "empreinte-de-violettes", name: "Empreinte de Violettes", url: "https://empreinte-de-violettes.vercel.app", kind: "Site vitrine", sector: "Artisane fleuriste · Six-Fours", accent: "#b9a3d6" },
  { slug: "aei-cote-mer", name: "AEI Côté Mer", url: "https://aei-cote-mer.vercel.app", kind: "Site vitrine", sector: "Agence immobilière · Var", headline: "Real estate by the sea, with care.", accent: "#5b6cf0" },
  { slug: "fan-tour-zanzibar", name: "Fan Tour Zanzibar", url: "https://fan-tour-zanzibar.vercel.app", kind: "Site vitrine", sector: "Tourisme · Zanzibar", headline: "Découvrez Zanzibar autrement, avec des guides locaux francophones", accent: "#e2b05b" },
  { slug: "cf-coiffure", name: "CF Coiffure", url: "https://cf-coiffure-amber.vercel.app", kind: "Site vitrine", sector: "Salon de coiffure · Six-Fours", accent: "#e5463b" },
  { slug: "md-services", name: "MD Services", url: "https://md-services-ten.vercel.app", kind: "Site vitrine", sector: "Jardinier paysagiste · Six-Fours", headline: "Des jardins taillés pour le soleil du Var.", accent: "#9fd36a" },
  { slug: "delphine-pappalardo", name: "Delphine Pappalardo", url: "https://delphine-pappalardo-maquette.vercel.app/", kind: "Maquette · site vitrine", sector: "Bien-être · Six-Fours", headline: "Un voyage au plus près de vous.", accent: "#d9a26b" },
  { slug: "attitude-deco", name: "Attitude Déco", url: "https://attitude-deco-maquette.vercel.app/", kind: "Maquette · site vitrine", sector: "Décoration d'intérieur · Suisse romande", headline: "L’art de se sentir chez soi.", accent: "#c9785b" },
  { slug: "authentique", name: "Authentique", url: "https://authentique-agence-maquette.vercel.app/", kind: "Maquette · site vitrine", sector: "Événementiel · Lausanne & Genève", headline: "Vos plus beaux moments méritent l’exception.", accent: "#b4485a" },
  { slug: "dehay-gestion", name: "Dehay Gestion", url: "https://dehay-gestion.vercel.app", kind: "Application métier", sector: "Relocation & gestion immobilière · Genève", headline: "Trouver un logement ne devrait pas être un parcours du combattant.", accent: "#c0506a" },
  { slug: "allcx-patrimoine", name: "ALLCX Patrimoine", url: "https://www.allcx-patrimoine.com", kind: "Site vitrine", sector: "Immobilier", headline: "L’immobilier traité comme un dossier, pas comme une annonce.", accent: "#c2423f" },
  { slug: "eneo-immobilier", name: "énéo immobilier", url: "https://eneo-immobilier.vercel.app/", kind: "Site vitrine", sector: "Immobilier · Genève", headline: "Valoriser votre patrimoine immobilier à Genève", accent: "#c7b08a" },
  { slug: "suisse-conseils", name: "Suisse-Conseils Management", url: "https://suisse-conseils.vercel.app/", kind: "Site vitrine", sector: "Courtier en assurances · Genève", headline: "Votre confiance, notre responsabilité.", accent: "#3fd6a0" },
  { slug: "loryance", name: "Loryance", url: "https://loryance.ch", kind: "Site vitrine", sector: "Comparateur d'assurances · Suisse", headline: "Vos assurances, comparées et négociées par de vrais conseillers.", accent: "#d6334b" },
];

/** Les neuf projets « décrochés du mur », dans l'ordre de passage. */
export const featuredSlugs = [
  "bloomed",
  "petrin-de-pepiole",
  "maison-pastier",
  "instinct-vegetal",
  "taco-j",
  "nerial",
  "nicolas-sarazin",
  "qoravo",
  "adimen",
] as const;

export const projectBySlug = new Map(projects.map((p) => [p.slug, p]));

export const featured: Project[] = featuredSlugs.map((slug) => {
  const p = projectBySlug.get(slug);
  if (!p) throw new Error(`Projet inconnu : ${slug}`);
  return p;
});
