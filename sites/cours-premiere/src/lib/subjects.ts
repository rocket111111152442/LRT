export type Subject = {
  slug: string;
  name: string;
};

// Matières communes à tous les élèves de Première générale, quelle que
// soit la spécialité choisie.
export const TRONC_COMMUN: Subject[] = [
  { slug: "francais", name: "Français" },
  { slug: "histoire-geo-emc", name: "Histoire-Géographie / EMC" },
  { slug: "lv-a", name: "Langue vivante A" },
  { slug: "lv-b", name: "Langue vivante B" },
  { slug: "enseignement-scientifique", name: "Enseignement scientifique" },
  { slug: "eps", name: "Éducation physique et sportive" },
];

// Catalogue des spécialités de Première générale (réforme du lycée).
// Un élève en choisit 3 en Première.
export const SPECIALITES: Subject[] = [
  { slug: "mathematiques", name: "Mathématiques" },
  { slug: "physique-chimie", name: "Physique-Chimie" },
  { slug: "svt", name: "SVT" },
  { slug: "ses", name: "SES (Sciences Économiques et Sociales)" },
  { slug: "hggsp", name: "HGGSP (Histoire-Géo, Géopolitique, Sciences Po)" },
  { slug: "llcer", name: "LLCER (Langues, littératures et cultures étrangères)" },
  { slug: "humanites-litterature-philosophie", name: "Humanités, Littérature et Philosophie" },
  { slug: "nsi", name: "NSI (Numérique et Sciences Informatiques)" },
  { slug: "si", name: "Sciences de l'Ingénieur" },
  { slug: "cinema-audiovisuel", name: "Cinéma-Audiovisuel" },
  { slug: "arts-plastiques", name: "Arts Plastiques" },
  { slug: "theatre", name: "Théâtre" },
  { slug: "musique", name: "Musique" },
  { slug: "danse", name: "Danse" },
  { slug: "histoire-des-arts", name: "Histoire des Arts" },
  { slug: "lca", name: "Littératures et LCA (Latin, Grec)" },
  { slug: "biologie-ecologie", name: "Biologie-Écologie" },
  { slug: "eppcs", name: "Éducation Physique, Pratiques et Culture Sportives" },
];

const SPECIALITES_BY_SLUG = new Map(SPECIALITES.map((s) => [s.slug, s]));

export const MAX_SPECIALITES = 3;

export function isValidSpecialtySlug(slug: string): boolean {
  return SPECIALITES_BY_SLUG.has(slug);
}

export function getSubjectName(slug: string): string {
  const tronc = TRONC_COMMUN.find((s) => s.slug === slug);
  if (tronc) return tronc.name;
  const specialite = SPECIALITES_BY_SLUG.get(slug);
  if (specialite) return specialite.name;
  return slug;
}

/** Les matières effectives d'un élève : tronc commun + ses spécialités choisies. */
export function getUserSubjects(specialtySlugs: string[]): Subject[] {
  const chosen = specialtySlugs
    .map((slug) => SPECIALITES_BY_SLUG.get(slug))
    .filter((s): s is Subject => Boolean(s));
  return [...TRONC_COMMUN, ...chosen];
}

export function isValidUserSubjectSlug(specialtySlugs: string[], slug: string): boolean {
  return getUserSubjects(specialtySlugs).some((s) => s.slug === slug);
}
