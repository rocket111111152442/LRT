/**
 * Conversion du HTML riche en texte simple.
 *
 * Les descriptions Printify sortent d'un éditeur de texte enrichi : elles
 * arrivent en HTML, avec les caractères accentués et la ponctuation typographique
 * encodés en entités (`&eacute;`, `&rsquo;`…). Sans décodage, la fiche produit
 * affiche « L&rsquo;instinct ne s&rsquo;apprend pas » au lieu du texte.
 */

/**
 * Le jeu Latin-1 du HTML est contigu : les noms d'entités correspondent aux
 * points de code 160 à 255, dans l'ordre. Deux listes suffisent donc là où une
 * table de cent lignes serait à recopier — et à se tromper.
 */
const LATIN1_160 =
  "nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr deg plusmn sup2 sup3 acute micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest";

const LATIN1_192 =
  "Agrave Aacute Acirc Atilde Auml Aring AElig Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ETH Ntilde Ograve Oacute Ocirc Otilde Ouml times Oslash Ugrave Uacute Ucirc Uuml Yacute THORN szlig agrave aacute acirc atilde auml aring aelig ccedil egrave eacute ecirc euml igrave iacute icirc iuml eth ntilde ograve oacute ocirc otilde ouml divide oslash ugrave uacute ucirc uuml yacute thorn yuml";

const NAMED = new Map<string, string>([
  // Les trois qui ne sont pas dans le bloc Latin-1.
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
  // Ponctuation typographique, celle que produisent les éditeurs de texte.
  ["lsquo", "‘"],
  ["rsquo", "’"],
  ["sbquo", "‚"],
  ["ldquo", "“"],
  ["rdquo", "”"],
  ["bdquo", "„"],
  ["ndash", "–"],
  ["mdash", "—"],
  ["hellip", "…"],
  ["bull", "•"],
  ["dagger", "†"],
  ["Dagger", "‡"],
  ["permil", "‰"],
  ["prime", "′"],
  ["Prime", "″"],
  ["lsaquo", "‹"],
  ["rsaquo", "›"],
  ["oline", "‾"],
  ["frasl", "⁄"],
  ["euro", "€"],
  ["trade", "™"],
  ["OElig", "Œ"],
  ["oelig", "œ"],
  ["Scaron", "Š"],
  ["scaron", "š"],
  ["Yuml", "Ÿ"],
  ["fnof", "ƒ"],
  ["circ", "ˆ"],
  ["tilde", "˜"],
  ["ensp", " "],
  ["emsp", " "],
  ["thinsp", " "],
  ["zwnj", "‌"],
  ["zwj", "‍"],
  ["lrm", "‎"],
  ["rlm", "‏"],
]);

for (const [debut, noms] of [
  [160, LATIN1_160],
  [192, LATIN1_192],
] as const) {
  noms.split(" ").forEach((nom, index) => {
    NAMED.set(nom, String.fromCodePoint(debut + index));
  });
}

// Une seule passe : décoder en plusieurs fois ferait de `&amp;eacute;` un « é ».
const ENTITY = /&(#\d+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g;

export function decodeHtmlEntities(value: string) {
  return value.replace(ENTITY, (entier, corps: string) => {
    if (corps.startsWith("#")) {
      const hex = corps[1] === "x" || corps[1] === "X";
      const point = Number.parseInt(hex ? corps.slice(2) : corps.slice(1), hex ? 16 : 10);

      if (!Number.isFinite(point) || point < 1 || point > 0x10ffff) return entier;
      return String.fromCodePoint(point);
    }

    // Entité inconnue : on laisse le texte tel quel plutôt que de l'effacer.
    return NAMED.get(corps) ?? entier;
  });
}

/**
 * Le texte contient-il encore des entités ? Sert à repérer une description
 * importée avant la correction du décodage. Comparer au décodage évite l'écueil
 * d'un `RegExp` global, dont le `test()` est capricieux d'un appel à l'autre.
 */
export function looksEncoded(value: string) {
  return decodeHtmlEntities(value) !== value;
}

/** HTML riche vers texte simple : les sauts de paragraphe sont conservés. */
export function htmlToText(html: string | null | undefined) {
  if (!html) return "";

  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])\s*>/gi, "\n\n")
      .replace(/<li\b[^>]*>/gi, "— ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Champs texte d'un produit susceptibles de porter des entités mal décodées.
 * Un import antérieur à la correction du décodage a pu en laisser dans
 * n'importe lequel d'entre eux.
 */
export const CHAMPS_TEXTE = ["name", "subtitle", "description", "composition"] as const;

export type ChampTexte = (typeof CHAMPS_TEXTE)[number];

/** Renvoie les seuls champs à réécrire, ou `null` si le texte est déjà sain. */
export function repairFields<T extends Partial<Record<ChampTexte, string | null>>>(
  produit: T,
): Partial<Record<ChampTexte, string>> | null {
  const corrections: Partial<Record<ChampTexte, string>> = {};

  for (const champ of CHAMPS_TEXTE) {
    const valeur = produit[champ];
    if (typeof valeur !== "string" || !valeur) continue;

    const decode = decodeHtmlEntities(valeur);
    if (decode !== valeur) corrections[champ] = decode;
  }

  return Object.keys(corrections).length > 0 ? corrections : null;
}
