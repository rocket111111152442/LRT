/**
 * Ce dont la boutique a besoin pour fonctionner vraiment.
 *
 * Les pages publiques savent se passer de la base : `safeQuery` replie sur un
 * catalogue vide et le site reste lisible. Les formulaires, eux, ne peuvent pas
 * mentir — créer un compte, passer commande ou déposer un avis suppose une base
 * accessible et un secret de session. Ce module centralise le diagnostic pour
 * que l'échec soit annoncé, jamais subi.
 */

/**
 * URL de la base, quel que soit le nom que lui donne l'hébergeur.
 *
 * L'intégration Supabase de Vercel n'injecte pas `DATABASE_URL` : elle pose
 * `POSTGRES_PRISMA_URL` (connexion mutualisée, celle qu'il faut en serverless)
 * et `POSTGRES_URL` (connexion directe). On accepte les trois, en donnant la
 * priorité à une valeur posée à la main.
 */
export function databaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    undefined
  );
}

/**
 * Corrige le mode SSL des URL Supabase.
 *
 * Supabase fournit une URL en `sslmode=require`. Depuis pg-connection-string
 * 2.9, `require` n'a plus le sens de libpq (« chiffre, ne vérifie pas le
 * certificat ») mais celui de `verify-full` : la chaîne de certificats de
 * Supabase est alors refusée et toute requête échoue sur
 * « self-signed certificate in certificate chain ».
 *
 * `uselibpqcompat=true` rétablit le sens historique. La connexion reste
 * chiffrée ; seule la vérification du certificat est relâchée, ce qui est la
 * configuration documentée pour le pooler Supabase.
 */
export function normalizeDatabaseUrl(raw: string) {
  try {
    const url = new URL(raw);
    const sslmode = url.searchParams.get("sslmode");

    if (
      (sslmode === "require" || sslmode === "prefer") &&
      !url.searchParams.has("uselibpqcompat")
    ) {
      url.searchParams.set("uselibpqcompat", "true");
    }

    return url.toString();
  } catch {
    // URL non analysable (format libpq « host=… »): on la laisse telle quelle.
    return raw;
  }
}

export type ServiceGap = {
  variable: string;
  raison: string;
};

const AUTH_SECRET_MIN_LENGTH = 32;

/** Variables manquantes qui empêchent tout écriture côté client. */
export function missingServices(): ServiceGap[] {
  const gaps: ServiceGap[] = [];

  if (!databaseUrl()) {
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
