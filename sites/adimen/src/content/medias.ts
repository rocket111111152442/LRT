/**
 * Interventions de l'agence dans les médias.
 *
 * ── À LIRE AVANT DE COMPLÉTER ──────────────────────────────────────────────
 * Ce tableau est vide volontairement. L'audit n'a pas pu accéder à la page
 * « Médias » du site actuel (domaine bloqué par la politique réseau, voir
 * docs/adimen-audit.md § 0), et aucune source publique ne permet d'établir
 * qu'ADIMEN a participé à tel ou tel reportage.
 *
 * Deux sujets de la RTS traitent de la profession de détective privé à Genève.
 * Ils sont reproduits ci-dessous à titre de piste, **hors du site** : rien ne
 * démontre que l'agence y intervient, et les publier laisserait entendre une
 * participation non vérifiée.
 *
 *   • RTS Info — « Le badge de détective privé, un sésame qui attire toujours
 *     plus à Genève »
 *     https://www.rts.ch/info/suisse/6591365-le-badge-de-detective-prive-un-sesame-qui-attire-toujours-plus-a-geneve.html
 *
 *   • RTS, Temps Présent — « Détectives, des privés sans surveillance »
 *     https://www.rts.ch/play/tv/temps-present/video/detectives-des-prives-sans-surveillance?id=6594840
 *
 * Pour publier une intervention : ajouter une entrée dans `apparitions`
 * ci-dessous. La section « Médias » de la page d'accueil et la grille de la
 * page /medias/ apparaissent automatiquement dès la première entrée.
 * ──────────────────────────────────────────────────────────────────────────
 */

export type Apparition = {
  /** Média : « RTS », « Le Temps », « Léman Bleu »… */
  media: string;
  /** Émission ou rubrique, si elle existe. */
  emission?: string;
  titre: string;
  /** Année de diffusion, sur quatre chiffres. */
  annee: string;
  /** Lien vers le sujet en ligne. */
  url: string;
  /**
   * Identifiant de la vidéo RTS pour une intégration en lecteur.
   * Laisser vide pour un simple lien sortant.
   */
  videoRts?: string;
  /** Une ou deux phrases sur le sujet traité. */
  resume: string;
};

export const apparitions: readonly Apparition[] = [];

/** Vrai dès qu'au moins une intervention est publiable. */
export const aDesApparitions = apparitions.length > 0;
