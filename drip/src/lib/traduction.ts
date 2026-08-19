/**
 * Traduction des libellés venus de Printify.
 *
 * L'API renvoie les couleurs et les tailles en anglais — « Black », « One
 * size », « Heather Grey ». Affichés tels quels à côté de textes français, ils
 * font bricolage. La traduction se fait à l'import, une fois, plutôt qu'à
 * chaque affichage.
 *
 * Un libellé inconnu est laissé intact : mieux vaut un mot anglais qu'un mot
 * effacé, et la boutique peut toujours le corriger à la main.
 */

const COULEURS: Record<string, string> = {
  black: "Noir",
  white: "Blanc",
  "off white": "Blanc cassé",
  cream: "Crème",
  ivory: "Ivoire",
  natural: "Naturel",
  grey: "Gris",
  gray: "Gris",
  "light grey": "Gris clair",
  "light gray": "Gris clair",
  "dark grey": "Gris foncé",
  "dark gray": "Gris foncé",
  "heather grey": "Gris chiné",
  "heather gray": "Gris chiné",
  "sport grey": "Gris sport",
  charcoal: "Anthracite",
  graphite: "Graphite",
  silver: "Argent",
  navy: "Bleu marine",
  "navy blue": "Bleu marine",
  blue: "Bleu",
  "light blue": "Bleu clair",
  "royal blue": "Bleu roi",
  "sky blue": "Bleu ciel",
  teal: "Bleu canard",
  turquoise: "Turquoise",
  green: "Vert",
  "dark green": "Vert foncé",
  "forest green": "Vert forêt",
  "military green": "Vert militaire",
  olive: "Olive",
  khaki: "Kaki",
  "army green": "Vert armée",
  red: "Rouge",
  "dark red": "Rouge foncé",
  maroon: "Bordeaux",
  burgundy: "Bordeaux",
  wine: "Lie de vin",
  pink: "Rose",
  "light pink": "Rose clair",
  "hot pink": "Rose vif",
  purple: "Violet",
  lavender: "Lavande",
  orange: "Orange",
  yellow: "Jaune",
  gold: "Doré",
  mustard: "Moutarde",
  beige: "Beige",
  sand: "Sable",
  stone: "Pierre",
  brown: "Marron",
  chocolate: "Chocolat",
  tan: "Camel",
  camel: "Camel",
};

const TAILLES: Record<string, string> = {
  "one size": "Taille unique",
  "one size fits all": "Taille unique",
  "os": "Taille unique",
  small: "S",
  medium: "M",
  large: "L",
  "x-large": "XL",
  "xx-large": "2XL",
  "xxx-large": "3XL",
};

/** Normalise pour la comparaison : casse, accents et espaces multiples. */
function cle(valeur: string) {
  return valeur
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function traduire(table: Record<string, string>, valeur: string | null) {
  if (!valeur) return valeur;
  return table[cle(valeur)] ?? valeur;
}

export function traduireCouleur(valeur: string | null) {
  return traduire(COULEURS, valeur);
}

export function traduireTaille(valeur: string | null) {
  if (!valeur) return valeur;

  const traduite = traduire(TAILLES, valeur);
  // « XL », « 2XL », « 38 » : déjà universels, on ne les touche pas.
  return traduite;
}

/* --------------------------------------------------------------------------
 * Nom des pièces
 * ------------------------------------------------------------------------ */

/**
 * Les gabarits Printify s'appellent « Unisex Heavy Blend Hooded Sweatshirt » :
 * un titre anglais, avec l'ordre anglais (adjectif avant le nom). Traduire mot
 * à mot donnerait « Unisexe Épais Sweat à capuche » — pire que l'anglais.
 *
 * On reconstruit donc la phrase : le vêtement d'abord, puis la matière, puis
 * les adjectifs accordés, puis le public. Les mots inconnus — nom de
 * collection, marque du blanc — sont conservés tels quels, juste après le nom
 * du vêtement.
 *
 * Si aucun vêtement n'est reconnu, le titre est renvoyé intact : un titre déjà
 * rédigé en français n'est jamais touché.
 */

type Genre = "m" | "f";
type Nombre = "s" | "p";

type Vetement = { fr: string; genre: Genre; nombre: Nombre };

const VETEMENTS: [string, Vetement][] = [
  // Les expressions longues d'abord : « hooded sweatshirt » avant « sweatshirt ».
  ["hooded sweatshirt", { fr: "Sweat à capuche", genre: "m", nombre: "s" }],
  ["pullover hoodie", { fr: "Sweat à capuche", genre: "m", nombre: "s" }],
  ["zip up hoodie", { fr: "Sweat à capuche zippé", genre: "m", nombre: "s" }],
  ["zip-up hoodie", { fr: "Sweat à capuche zippé", genre: "m", nombre: "s" }],
  ["crew neck sweatshirt", { fr: "Sweat col rond", genre: "m", nombre: "s" }],
  ["crewneck sweatshirt", { fr: "Sweat col rond", genre: "m", nombre: "s" }],
  ["long sleeve t-shirt", { fr: "T-shirt manches longues", genre: "m", nombre: "s" }],
  ["long sleeve tee", { fr: "T-shirt manches longues", genre: "m", nombre: "s" }],
  ["long sleeve shirt", { fr: "T-shirt manches longues", genre: "m", nombre: "s" }],
  ["tank top", { fr: "Débardeur", genre: "m", nombre: "s" }],
  ["muscle shirt", { fr: "Débardeur", genre: "m", nombre: "s" }],
  ["crop top", { fr: "Crop top", genre: "m", nombre: "s" }],
  ["sports bra", { fr: "Brassière de sport", genre: "f", nombre: "s" }],
  ["sport bra", { fr: "Brassière de sport", genre: "f", nombre: "s" }],
  ["rash guard", { fr: "Rashguard", genre: "m", nombre: "s" }],
  ["dad hat", { fr: "Casquette", genre: "f", nombre: "s" }],
  ["trucker cap", { fr: "Casquette trucker", genre: "f", nombre: "s" }],
  ["trucker hat", { fr: "Casquette trucker", genre: "f", nombre: "s" }],
  ["snapback hat", { fr: "Casquette snapback", genre: "f", nombre: "s" }],
  ["baseball cap", { fr: "Casquette", genre: "f", nombre: "s" }],
  ["bucket hat", { fr: "Bob", genre: "m", nombre: "s" }],
  ["knit beanie", { fr: "Bonnet", genre: "m", nombre: "s" }],
  ["tote bag", { fr: "Tote bag", genre: "m", nombre: "s" }],
  ["gym bag", { fr: "Sac de sport", genre: "m", nombre: "s" }],
  ["duffle bag", { fr: "Sac de sport", genre: "m", nombre: "s" }],
  ["drawstring bag", { fr: "Sac à cordon", genre: "m", nombre: "s" }],
  ["water bottle", { fr: "Gourde", genre: "f", nombre: "s" }],
  ["phone case", { fr: "Coque de téléphone", genre: "f", nombre: "s" }],
  ["mouse pad", { fr: "Tapis de souris", genre: "m", nombre: "s" }],
  ["bomber jacket", { fr: "Bomber", genre: "m", nombre: "s" }],
  ["sweatpants", { fr: "Bas de jogging", genre: "m", nombre: "s" }],
  ["sweatshirt", { fr: "Sweat", genre: "m", nombre: "s" }],
  ["hoodie", { fr: "Sweat à capuche", genre: "m", nombre: "s" }],
  ["joggers", { fr: "Jogging", genre: "m", nombre: "s" }],
  ["leggings", { fr: "Legging", genre: "m", nombre: "s" }],
  ["windbreaker", { fr: "Coupe-vent", genre: "m", nombre: "s" }],
  ["backpack", { fr: "Sac à dos", genre: "m", nombre: "s" }],
  ["t-shirt", { fr: "T-shirt", genre: "m", nombre: "s" }],
  ["tshirt", { fr: "T-shirt", genre: "m", nombre: "s" }],
  ["tee", { fr: "T-shirt", genre: "m", nombre: "s" }],
  ["shorts", { fr: "Short", genre: "m", nombre: "s" }],
  ["jacket", { fr: "Veste", genre: "f", nombre: "s" }],
  ["beanie", { fr: "Bonnet", genre: "m", nombre: "s" }],
  ["socks", { fr: "Chaussettes", genre: "f", nombre: "p" }],
  ["towel", { fr: "Serviette", genre: "f", nombre: "s" }],
  ["apron", { fr: "Tablier", genre: "m", nombre: "s" }],
  ["poster", { fr: "Affiche", genre: "f", nombre: "s" }],
  ["sticker", { fr: "Sticker", genre: "m", nombre: "s" }],
  ["blanket", { fr: "Plaid", genre: "m", nombre: "s" }],
  ["pillow", { fr: "Coussin", genre: "m", nombre: "s" }],
  ["mug", { fr: "Mug", genre: "m", nombre: "s" }],
  ["cap", { fr: "Casquette", genre: "f", nombre: "s" }],
  ["hat", { fr: "Casquette", genre: "f", nombre: "s" }],
];

/** Quatre formes : masculin/féminin × singulier/pluriel. */
type Adjectif = [string, string, string, string];

const ADJECTIFS: [string, Adjectif][] = [
  ["heavyweight", ["épais", "épaisse", "épais", "épaisses"]],
  ["lightweight", ["léger", "légère", "légers", "légères"]],
  ["oversized", ["oversize", "oversize", "oversize", "oversize"]],
  ["embroidered", ["brodé", "brodée", "brodés", "brodées"]],
  ["printed", ["imprimé", "imprimée", "imprimés", "imprimées"]],
  ["recycled", ["recyclé", "recyclée", "recyclés", "recyclées"]],
  ["organic", ["bio", "bio", "bio", "bio"]],
  ["premium", ["premium", "premium", "premium", "premium"]],
  ["classic", ["classique", "classique", "classiques", "classiques"]],
  ["sleeveless", ["sans manches", "sans manches", "sans manches", "sans manches"]],
  ["fitted", ["ajusté", "ajustée", "ajustés", "ajustées"]],
  ["relaxed", ["ample", "ample", "amples", "amples"]],
];

const MATIERES: [string, string][] = [
  ["organic cotton", "coton bio"],
  ["cotton", "coton"],
  ["fleece", "molleton"],
  ["french terry", "molleton français"],
  ["jersey", "jersey"],
  ["polyester", "polyester"],
];

/** Termes de public : noms en apposition, invariables. */
const PUBLICS: [string, string][] = [
  ["unisex", "unisexe"],
  ["men's", "homme"],
  ["mens", "homme"],
  ["women's", "femme"],
  ["womens", "femme"],
  ["kids", "enfant"],
  ["youth", "enfant"],
  ["toddler", "enfant"],
];

/**
 * À qui ce gabarit Printify s'adresse.
 *
 * Le titre le dit presque toujours — « Men's Tank Top », « Women's Leggings ».
 * Le déduire à l'import évite de classer une centaine de pièces à la main ;
 * l'administration garde le dernier mot.
 */
export function deduirePublic(titre: string): "HOMME" | "FEMME" | "ENFANT" | "UNISEXE" {
  const texte = cle(titre);

  const contient = (terme: string) =>
    new RegExp(`(^|[^\\p{L}\\p{N}])${terme}(?![\\p{L}\\p{N}])`, "u").test(texte);

  if (contient("women's") || contient("womens") || contient("ladies")) return "FEMME";
  if (contient("men's") || contient("mens")) return "HOMME";
  if (contient("kids") || contient("youth") || contient("toddler") || contient("baby")) {
    return "ENFANT";
  }

  return "UNISEXE";
}

/** Mots vides du jargon Printify : ils n'apportent rien en français. */
const BRUIT = new Set(["the", "a", "an", "for", "with", "and", "of"]);

function echapper(valeur: string) {
  return valeur.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Motif qui isole `terme` sans couper à l'intérieur d'un mot. */
function motif(terme: string) {
  return new RegExp(
    `(^|[^\\p{L}\\p{N}])${echapper(terme)}(?![\\p{L}\\p{N}])`,
    "iu",
  );
}

/**
 * Retire la première occurrence de `terme` et renvoie le texte restant, ou
 * `null` si le terme est absent.
 */
function retirer(texte: string, terme: string) {
  const found = motif(terme).exec(texte);
  if (!found) return null;

  const debut = found.index + found[1].length;
  return texte.slice(0, debut) + texte.slice(debut + terme.length);
}

function accorder(formes: Adjectif, genre: Genre, nombre: Nombre) {
  if (nombre === "s") return genre === "m" ? formes[0] : formes[1];
  return genre === "m" ? formes[2] : formes[3];
}

export function traduireNomProduit(titre: string) {
  let reste = titre;

  const vetement = VETEMENTS.find(([anglais]) => {
    const sans = retirer(reste, anglais);
    if (sans === null) return false;
    reste = sans;
    return true;
  })?.[1];

  // Aucun vêtement reconnu : le titre est probablement déjà rédigé à la main,
  // on n'y touche pas.
  if (!vetement) return titre;

  const adjectifs: string[] = [];
  for (const [anglais, formes] of ADJECTIFS) {
    const sans = retirer(reste, anglais);
    if (sans === null) continue;
    reste = sans;
    adjectifs.push(accorder(formes, vetement.genre, vetement.nombre));
  }

  let matiere: string | null = null;
  for (const [anglais, francais] of MATIERES) {
    const sans = retirer(reste, anglais);
    if (sans === null) continue;
    reste = sans;
    if (!matiere) matiere = francais;
  }

  const publics: string[] = [];
  for (const [anglais, francais] of PUBLICS) {
    const sans = retirer(reste, anglais);
    if (sans === null) continue;
    reste = sans;
    if (!publics.includes(francais)) publics.push(francais);
  }

  // Ce qui reste appartient à la boutique : nom de collection, marque du
  // blanc, référence. On le garde mot pour mot, en jetant seulement les
  // liaisons anglaises et la ponctuation orpheline.
  const conserve = reste
    .split(/\s+/)
    .map((mot) => mot.replace(/^[-–—|,:;]+|[-–—|,:;]+$/g, ""))
    .filter((mot) => mot.length > 0 && !BRUIT.has(mot.toLowerCase()))
    .join(" ")
    .trim();

  return [
    vetement.fr,
    conserve,
    matiere ? `en ${matiere}` : "",
    adjectifs.join(" "),
    publics.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
