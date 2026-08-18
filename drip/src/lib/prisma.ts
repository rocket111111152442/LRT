import { unstable_rethrow } from "next/navigation";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { databaseUrl } from "@/lib/services";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

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
function normalizeDatabaseUrl(raw: string) {
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

function createPrismaClient() {
  const connectionString = databaseUrl();

  if (!connectionString) {
    throw new Error(
      "Base de données non configurée : renseignez DATABASE_URL (ou laissez " +
        "l'intégration Supabase poser POSTGRES_PRISMA_URL) sur l'hébergeur.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: normalizeDatabaseUrl(connectionString) }),
  });
}

function getClient() {
  // En développement, Next recharge les modules à chaque édition : ce cache
  // global évite d'ouvrir un pool de connexions par rechargement.
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

/**
 * Client Prisma instancié à la première utilisation.
 *
 * L'initialisation paresseuse est volontaire : si `DATABASE_URL` est absente,
 * l'erreur survient au moment de la requête (où elle peut être rattrapée par
 * `safeQuery`) et non à l'import du module, ce qui ferait tomber toute
 * l'application, y compris les pages qui n'ont pas besoin de la base.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getClient() as object, property, receiver);
  },
  has(_target, property) {
    return Reflect.has(getClient() as object, property);
  },
});

/**
 * Exécute une requête en repliant sur une valeur par défaut si la base n'est
 * pas joignable. Utilisé sur les pages publiques : une base momentanément
 * indisponible dégrade l'affichage, elle ne renvoie pas une erreur 500.
 */
export async function safeQuery<T>(
  run: () => Promise<T>,
  fallback: T,
  context = "requête",
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    // Next.js signale par une exception qu'une page doit basculer en rendu
    // dynamique (lecture de `cookies`, de `headers`…). Sans ce renvoi, ce filet
    // l'avalerait et la page serait figée au build avec un panier vide.
    unstable_rethrow(error);

    console.error(
      `[db] ${context} impossible :`,
      error instanceof Error ? error.message : error,
    );
    return fallback;
  }
}

export * from "../../generated/prisma/client";
