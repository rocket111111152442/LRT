export type BlogCategory = "vendre" | "acheter" | "marche" | "financement" | "outils";

export const blogCategories: { slug: BlogCategory; label: string }[] = [
  { slug: "vendre", label: "Vendre" },
  { slug: "acheter", label: "Acheter" },
  { slug: "marche", label: "Marché immobilier" },
  { slug: "financement", label: "Financement" },
  { slug: "outils", label: "Outils digitaux" },
];

export type RichTextBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; cite?: string };

export interface BlogAuthor {
  name: string;
  role: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  author: BlogAuthor;
  publishedAt: string;
  readTimeMinutes: number;
  illustration: "villa" | "chalet" | "appartement" | "immeuble" | "terrain";
  blocks: RichTextBlock[];
}

/**
 * Articles de démonstration, réécrits pour ce concept (aucun contenu
 * copié depuis un site tiers). Contenu structuré en blocs typés plutôt
 * qu'en fichiers MDX bruts : cette forme est directement prête à être
 * alimentée par un CMS headless (chaque bloc correspond à un composant),
 * conformément au choix documenté dans src/lib/data/README.md.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "comment-fonctionne-forfait-fixe-immobilier",
    title: "Comment fonctionne un forfait fixe en immobilier ?",
    excerpt:
      "Le courtage traditionnel facture un pourcentage du prix de vente. Le modèle à forfait fixe fonctionne différemment — explications.",
    category: "vendre",
    author: { name: "Rédaction Ného Concept", role: "Contenu de démonstration" },
    publishedAt: "2026-08-20",
    readTimeMinutes: 6,
    illustration: "villa",
    blocks: [
      { type: "paragraph", text: "En Suisse, la commission d'un courtage traditionnel se situe généralement entre 2% et 5% du prix de vente. Sur un bien à CHF 1'500'000, cela représente rapidement plusieurs dizaines de milliers de francs. Le modèle à forfait fixe propose une autre logique." },
      { type: "heading", level: 2, text: "Un montant connu à l'avance", id: "montant-connu" },
      { type: "paragraph", text: "Avec un forfait fixe, le prix de la prestation est déterminé avant la mise en vente, en fonction du type de bien, de sa localisation et de la formule choisie. Il ne varie pas si le bien se vend plus cher que prévu — c'est précisément l'intérêt du modèle pour les biens de valeur." },
      { type: "heading", level: 2, text: "Ce que couvre généralement le forfait", id: "ce-que-couvre" },
      { type: "list", items: ["Estimation professionnelle du bien", "Mise en valeur (photos, plans, parfois visite virtuelle)", "Diffusion sur les portails immobiliers", "Organisation des visites", "Négociation et accompagnement jusqu'au notaire"] },
      { type: "paragraph", text: "Le détail exact varie d'une formule à l'autre — voir notre page Offres pour une comparaison prestation par prestation." },
      { type: "heading", level: 2, text: "Dans quels cas est-ce avantageux ?", id: "cas-avantageux" },
      { type: "paragraph", text: "Plus le prix de vente est élevé, plus l'écart avec une commission proportionnelle se creuse en faveur du forfait fixe. À l'inverse, sur un bien à faible valeur, l'écart peut être plus limité, voire inversé selon les formules — d'où l'intérêt de comparer avec un calculateur avant de se décider." },
      { type: "quote", text: "Le bon réflexe : comparer le montant total, pas seulement le principe, en tenant compte de ce qui est réellement inclus dans chaque offre.", cite: "Rédaction Ného Concept" },
    ],
  },
  {
    slug: "prix-m2-suisse-romande-2026",
    title: "Prix au m² en Suisse romande : où en est le marché en 2026 ?",
    excerpt: "Tour d'horizon (démonstration) des tendances de prix par canton, du Léman au Jura.",
    category: "marche",
    author: { name: "Rédaction Ného Concept", role: "Contenu de démonstration" },
    publishedAt: "2026-08-10",
    readTimeMinutes: 7,
    illustration: "immeuble",
    blocks: [
      { type: "paragraph", text: "Les chiffres présentés ici sont ceux du jeu de données de démonstration de ce concept (voir src/lib/data/cantons.ts) et ne reflètent pas des statistiques de marché réelles et à jour. Ils illustrent le type de contenu qu'une vraie page marché pourrait présenter." },
      { type: "heading", level: 2, text: "Genève et Vaud, marchés sous tension", id: "geneve-vaud" },
      { type: "paragraph", text: "Sans surprise, l'arc lémanique reste la région la plus chère de Suisse romande, portée par une demande structurellement supérieure à l'offre disponible, notamment sur les biens familiaux bien situés." },
      { type: "heading", level: 2, text: "Fribourg et Neuchâtel, des alternatives crédibles", id: "fribourg-neuchatel" },
      { type: "paragraph", text: "Ces deux cantons offrent un rapport qualité-prix plus favorable, avec un accès facilité aux bassins d'emploi lémaniques pour les communes les mieux desservies." },
      { type: "heading", level: 2, text: "Valais et Jura, deux profils très différents", id: "valais-jura" },
      { type: "paragraph", text: "Le Valais combine un marché de résidences principales plus abordable en plaine et un marché de résidences secondaires très dynamique en station. Le Jura reste le canton le plus accessible de Suisse romande." },
      { type: "list", items: ["Toujours croiser plusieurs sources avant une décision d'achat ou de vente", "Le prix au m² varie fortement selon l'état du bien et son étage/exposition", "Une estimation professionnelle reste indispensable pour un chiffre fiable"] },
    ],
  },
  {
    slug: "vendre-sans-commission-mythe-ou-realite",
    title: "Vendre « sans commission » : mythe ou réalité ?",
    excerpt: "L'expression est accrocheuse — que signifie-t-elle concrètement pour un vendeur ?",
    category: "vendre",
    author: { name: "Rédaction Ného Concept", role: "Contenu de démonstration" },
    publishedAt: "2026-07-25",
    readTimeMinutes: 5,
    illustration: "appartement",
    blocks: [
      { type: "paragraph", text: "« Sans commission » ne signifie pas « sans coût » : cela signifie que le coût n'est pas calculé en pourcentage du prix de vente, mais fixé à l'avance sous forme de forfait." },
      { type: "heading", level: 2, text: "Pourquoi la nuance compte", id: "nuance" },
      { type: "paragraph", text: "Pour un vendeur, la vraie question n'est pas « y a-t-il un coût ? » — il y en a toujours un — mais « quel est le montant total, et que couvre-t-il précisément ? ». Un forfait fixe qui n'inclut pas la diffusion sur les portails, par exemple, peut au final coûter plus cher qu'annoncé." },
      { type: "heading", level: 2, text: "Les questions à poser avant de signer", id: "questions" },
      { type: "list", items: ["Le montant est-il vraiment fixe, ou évolue-t-il selon des conditions ?", "Que se passe-t-il si le bien ne se vend pas dans le délai prévu ?", "Quelles prestations sont incluses, lesquelles sont en option ?", "Quel est l'engagement de durée du mandat ?"] },
      { type: "paragraph", text: "Ces questions permettent de comparer objectivement une offre à forfait fixe et une commission traditionnelle, plutôt que de se fier au seul slogan commercial." },
    ],
  },
  {
    slug: "calculer-capacite-achat-immobilier-suisse",
    title: "Calculer sa capacité d'achat immobilier en Suisse",
    excerpt: "Les règles usuelles du marché suisse, expliquées simplement avant de se lancer dans une recherche.",
    category: "financement",
    author: { name: "Rédaction Ného Concept", role: "Contenu de démonstration" },
    publishedAt: "2026-06-30",
    readTimeMinutes: 8,
    illustration: "chalet",
    blocks: [
      { type: "paragraph", text: "Avant toute recherche sérieuse, il est utile de cadrer son budget. Le marché suisse applique deux règles largement utilisées par les banques et les courtiers en financement." },
      { type: "heading", level: 2, text: "La règle des fonds propres (≥ 20%)", id: "fonds-propres" },
      { type: "paragraph", text: "En général, un acquéreur doit apporter au moins 20% de la valeur du bien en fonds propres, dont au moins 10% hors capital de prévoyance (2e pilier)." },
      { type: "heading", level: 2, text: "La règle de la charge (≤ 33% du revenu)", id: "charge" },
      { type: "paragraph", text: "Les charges théoriques du bien (intérêts calculés à un taux prudent, amortissement, entretien) ne doivent en principe pas dépasser un tiers du revenu brut du ménage." },
      { type: "heading", level: 2, text: "Un calcul indicatif, pas un accord de prêt", id: "indicatif" },
      { type: "paragraph", text: "Notre calculateur de capacité d'achat applique une version simplifiée de ces règles pour donner un ordre de grandeur. Seul un conseiller en financement peut confirmer un montant réellement finançable, après étude complète du dossier." },
    ],
  },
  {
    slug: "visite-virtuelle-360-a-quoi-sattendre",
    title: "Visite virtuelle 360° : à quoi s'attendre ?",
    excerpt: "Un outil de plus en plus courant dans les annonces haut de gamme — comment ça marche, et pour qui ?",
    category: "outils",
    author: { name: "Rédaction Ného Concept", role: "Contenu de démonstration" },
    publishedAt: "2026-06-05",
    readTimeMinutes: 4,
    illustration: "appartement",
    blocks: [
      { type: "paragraph", text: "La visite virtuelle 360° permet à un acheteur potentiel de se déplacer librement dans un bien depuis son ordinateur ou son téléphone, avant même une première visite physique." },
      { type: "heading", level: 2, text: "Pour l'acheteur", id: "acheteur" },
      { type: "paragraph", text: "Elle permet de présélectionner les biens qui correspondent vraiment, et d'éviter des déplacements pour des biens qui, en réalité, ne conviennent pas." },
      { type: "heading", level: 2, text: "Pour le vendeur", id: "vendeur" },
      { type: "paragraph", text: "Elle réduit le nombre de visites « touristiques » et concentre les rendez-vous physiques sur des acheteurs réellement intéressés — un vrai gain de temps et de sérénité." },
      { type: "list", items: ["Disponible généralement dans les formules intermédiaires et supérieures", "Complète les photos, ne les remplace pas", "Particulièrement utile pour les acheteurs à distance"] },
    ],
  },
  {
    slug: "comment-se-deroule-estimation-en-ligne",
    title: "Comment se déroule une estimation immobilière en ligne ?",
    excerpt: "Ce que le formulaire demande, ce qu'il ne peut pas remplacer, et ce qui se passe ensuite.",
    category: "vendre",
    author: { name: "Rédaction Ného Concept", role: "Contenu de démonstration" },
    publishedAt: "2026-05-12",
    readTimeMinutes: 5,
    illustration: "villa",
    blocks: [
      { type: "paragraph", text: "Une estimation en ligne repose sur les informations déclarées par le propriétaire : adresse, type de bien, surface, nombre de pièces, année de construction, état général, terrain et stationnement." },
      { type: "heading", level: 2, text: "Ce qu'elle peut donner", id: "ce-quelle-donne" },
      { type: "paragraph", text: "Un premier ordre de grandeur, utile pour se situer par rapport au marché local, en quelques minutes et sans engagement." },
      { type: "heading", level: 2, text: "Ce qu'elle ne remplace pas", id: "ce-quelle-remplace-pas" },
      { type: "paragraph", text: "Aucun algorithme ne voit l'état réel d'une toiture, la qualité d'une rénovation ou le calme d'un quartier un dimanche matin. C'est pourquoi une visite par un courtier local reste indispensable avant toute mise en vente." },
      { type: "quote", text: "Dans ce concept de démonstration, le formulaire d'estimation se termine volontairement par une simple confirmation de demande, jamais par un chiffre inventé.", cite: "Voir docs/neho-audit.md" },
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return getAllPosts()
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, limit);
}

export function getTableOfContents(post: BlogPost) {
  return post.blocks.filter((b): b is Extract<RichTextBlock, { type: "heading" }> => b.type === "heading");
}
