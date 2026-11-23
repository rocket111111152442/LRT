/**
 * Contenus de marque Lullin Web.
 *
 * Les éléments marqués « PROVISOIRE » sont absents de lullin-web.com au
 * moment du relevé (téléphone, adresse, réseaux sociaux, chiffres clés) et
 * doivent être validés ou remplacés avant mise en ligne.
 */

export const site = {
  name: "Lullin Web",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lullin-web.com",
  email: "contact@lullin-web.com",
  area: "Partout en France et en Suisse romande",
  /** PROVISOIRE — aucun numéro n'est publié sur lullin-web.com. */
  phone: null as string | null,
  description:
    "Lullin Web conçoit, développe et fait vivre des sites internet sur mesure, des boutiques e-commerce et des contenus pour les entreprises, en France et en Suisse romande.",
};

export const hero = {
  presents: "Lullin Web présente",
  title: "Le Zootrope",
  subtitle: "Vingt-trois sites réels, qui tournent dans un mur.",
  enterSound: "Entrer avec le son",
  enterSilent: "Entrer en silence",
};

export const statements = [
  {
    title: "Chaque écran est un vrai site.",
    body: "Chaque panneau de ce mur est une page conçue et développée par Lullin Web : une boulangerie, un cabinet comptable, une agence d’enquêtes, une boutique en ligne.",
    side: "left" as const,
  },
  {
    title: "Faites défiler, ils défilent avec vous.",
    body: "Les pages avancent au rythme de votre lecture. Plus vous descendez, plus le mur se met à tourner.",
    side: "right" as const,
  },
  {
    title: "Décrochez-en un du mur.",
    body: "Cliquez sur un écran pour le rapprocher. Au fond du puits, neuf projets viennent à vous.",
    side: "left" as const,
  },
];

export const outro = {
  title: "Votre site, le prochain sur le mur.",
  body: "Lullin Web conçoit et développe des sites, des boutiques et des contenus qui donnent envie de rester.",
  cta: "Discuter d’un projet",
  secondary: "Demander un devis",
  services: "Explorer nos services",
  disclaimer:
    "Les écrans affichent des captures des sites réalisés par Lullin Web, relevées en novembre 2026. Certaines réalisations sont des maquettes de présentation, indiquées comme telles. Les marques citées appartiennent à leurs propriétaires respectifs.",
};

export type Service = {
  n: string;
  title: string;
  body: string;
  points: string[];
};

export const services: Service[] = [
  {
    n: "01",
    title: "Sites internet sur mesure",
    body: "Des sites vitrines dessinés pour votre activité, rapides, lisibles sur mobile et pensés pour convertir vos visiteurs en clients.",
    points: ["Design sur mesure", "Développement Next.js", "Mobile & performance"],
  },
  {
    n: "02",
    title: "Boutiques e-commerce",
    body: "Des boutiques en ligne claires et fiables : catalogue, paiement, commande et retrait, de la première fiche produit à l’expédition.",
    points: ["Catalogue & paiement", "Click & collect", "Suivi des commandes"],
  },
  {
    n: "03",
    title: "Maintenance & optimisation",
    body: "Hébergement, nom de domaine, mises à jour et suivi technique : votre site reste rapide, sécurisé et à jour.",
    points: ["Hébergement & domaine", "Mises à jour", "Suivi technique"],
  },
  {
    n: "04",
    title: "Référencement SEO & SEA",
    body: "Être trouvé sur Google : référencement naturel suivi chaque mois, campagnes sponsorisées et rapports lisibles.",
    points: ["SEO mensuel", "Campagnes Google Ads", "Rapports de suivi"],
  },
  {
    n: "05",
    title: "Réseaux sociaux & contenus",
    body: "Gestion de vos comptes, calendrier éditorial et création de publications cohérentes avec votre image.",
    points: ["Gestion des comptes", "Calendrier éditorial", "Création de contenus"],
  },
  {
    n: "06",
    title: "Photographie & vidéo",
    body: "Photos professionnelles et vidéos courtes pour montrer votre lieu, vos produits et votre équipe tels qu’ils sont.",
    points: ["Shooting sur place", "Vidéos courtes", "Formats réseaux sociaux"],
  },
  {
    n: "07",
    title: "Automatisation & IA",
    body: "Formulaires, devis, prises de rendez-vous et tâches répétitives automatisés, avec des outils d’intelligence artificielle là où ils font gagner du temps.",
    points: ["Automatisation de tâches", "Assistants IA", "Outils métier"],
  },
];

export const projectTypes = [
  "Site internet sur mesure",
  "Boutique e-commerce",
  "Maintenance / optimisation",
  "Référencement SEO / SEA",
  "Réseaux sociaux & contenus",
  "Photographie / vidéo",
  "Automatisation & IA",
  "Autre",
];
