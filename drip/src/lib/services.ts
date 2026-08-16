/**
 * Ce dont la boutique a besoin pour fonctionner vraiment.
 *
 * Les pages publiques savent se passer de la base : `safeQuery` replie sur un
 * catalogue vide et le site reste lisible. Les formulaires, eux, ne peuvent pas
 * mentir — créer un compte, passer commande ou déposer un avis suppose une base
 * accessible et un secret de session. Ce module centralise le diagnostic pour
 * que l'échec soit annoncé, jamais subi.
 */

export type ServiceGap = {
  variable: string;
  raison: string;
};

const AUTH_SECRET_MIN_LENGTH = 32;

/** Variables manquantes qui empêchent tout écriture côté client. */
export function missingServices(): ServiceGap[] {
  const gaps: ServiceGap[] = [];

  if (!process.env.DATABASE_URL) {
    gaps.push({
      variable: "DATABASE_URL",
      raison: "aucune base de données n'est reliée à la boutique",
    });
  }

  // En développement un secret de repli est utilisé (voir lib/auth). En
  // production il n'y a pas de repli possible : un secret connu permettrait de
  // forger la session de n'importe quel client.
  if (
    process.env.NODE_ENV === "production" &&
    (process.env.AUTH_SECRET ?? "").length < AUTH_SECRET_MIN_LENGTH
  ) {
    gaps.push({
      variable: "AUTH_SECRET",
      raison: `secret de session absent ou plus court que ${AUTH_SECRET_MIN_LENGTH} caractères`,
    });
  }

  return gaps;
}

export function servicesReady() {
  return missingServices().length === 0;
}

/**
 * Message renvoyé dans le formulaire. Il dit ce qui est arrivé à la saisie —
 * le bandeau au-dessus, lui, explique la situation. Les deux se complètent au
 * lieu de se répéter.
 */
export const SERVICE_UNAVAILABLE_MESSAGE =
  "Rien n'a été enregistré : les comptes ne sont pas encore ouverts.";

/** Message affiché quand une opération échoue pour une autre raison. */
export const OPERATION_FAILED_MESSAGE =
  "L'opération n'a pas pu aboutir. Réessayez dans un instant.";

/** Trace serveur : c'est elle qui dit à l'exploitant quoi renseigner. */
export function logMissingServices(context: string, gaps = missingServices()) {
  if (gaps.length === 0) return;

  console.error(
    `[config] ${context} impossible — ${gaps
      .map((gap) => `${gap.variable} (${gap.raison})`)
      .join(", ")}. Renseignez ces variables d'environnement sur l'hébergeur.`,
  );
}
