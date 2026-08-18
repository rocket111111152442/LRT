import { timingSafeEqual } from "node:crypto";
import { Client } from "pg";
import { prisma, safeQuery } from "@/lib/prisma";
import { SCHEMA_SQL } from "@/lib/schemaSql";
import { databaseUrl, normalizeDatabaseUrl } from "@/lib/services";

/**
 * Installation en un clic.
 *
 * Créer les tables et le premier administrateur demandait jusqu'ici de coller
 * du SQL dans l'éditeur Supabase — l'étape la plus intimidante de la mise en
 * route, et celle qui échouait le plus. La boutique sait maintenant le faire
 * elle-même.
 *
 * Deux verrous, parce qu'un installateur ouvert sur Internet est une porte
 * d'entrée vers le back-office :
 *
 *  1. Une clé, formée des dix premiers caractères d'AUTH_SECRET. Seul
 *     quelqu'un ayant accès à la configuration de l'hébergeur peut la lire ;
 *     elle n'est ni devinable ni exposée par le site.
 *  2. La page se ferme définitivement dès qu'un compte existe.
 */

const LONGUEUR_CLE = 10;

/** La clé attendue, ou `null` si AUTH_SECRET n'est pas encore renseigné. */
export function expectedInstallKey() {
  const secret = process.env.AUTH_SECRET ?? "";
  return secret.length >= 32 ? secret.slice(0, LONGUEUR_CLE) : null;
}

/** Comparaison à durée constante : une clé ne se devine pas caractère par caractère. */
export function checkInstallKey(fournie: string | undefined | null) {
  const attendue = expectedInstallKey();
  if (!attendue || !fournie) return false;

  const a = Buffer.from(attendue);
  const b = Buffer.from(fournie);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export type InstallState = {
  baseConfiguree: boolean;
  tablesCreees: boolean;
  comptesExistants: number;
  /** Faux dès qu'un compte existe : l'installation est alors terminée. */
  ouverte: boolean;
};

export async function readInstallState(): Promise<InstallState> {
  const baseConfiguree = Boolean(databaseUrl());

  if (!baseConfiguree) {
    return {
      baseConfiguree: false,
      tablesCreees: false,
      comptesExistants: 0,
      ouverte: true,
    };
  }

  // `null` distingue « table absente » de « table vide ».
  const comptes = await safeQuery(
    () => prisma.user.count(),
    null as number | null,
    "état de l'installation",
  );

  const tablesCreees = comptes !== null;

  return {
    baseConfiguree: true,
    tablesCreees,
    comptesExistants: comptes ?? 0,
    ouverte: (comptes ?? 0) === 0,
  };
}

/**
 * Joue le schéma. Le pilote `pg` est utilisé directement : le protocole simple
 * accepte plusieurs instructions dans une seule requête, là où Prisma n'en
 * accepte qu'une. Le script est rejouable, une exécution partielle se rattrape
 * en relançant.
 */
export async function runSchema() {
  const url = databaseUrl();
  if (!url) throw new Error("Base de données non configurée.");

  const client = new Client({ connectionString: normalizeDatabaseUrl(url) });

  try {
    await client.connect();
    await client.query(SCHEMA_SQL);
  } finally {
    await client.end().catch(() => undefined);
  }
}
