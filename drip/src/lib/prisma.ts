import { unstable_rethrow } from "next/navigation";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL manquante. Renseignez la variable d'environnement pour connecter la boutique à sa base.",
    );
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
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
