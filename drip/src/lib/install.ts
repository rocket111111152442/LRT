import { createHash, timingSafeEqual } from "node:crypto";
import { Client } from "pg";
import { prisma, safeQuery } from "@/lib/prisma";
import { SCHEMA_SQL } from "@/lib/schemaSql";
import { databaseUrl, normalizeDatabaseUrl } from "@/lib/services";
import { readSetting, writeSetting } from "@/lib/settings";

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

/** Réglage où l'on note quel schéma a été appliqué la dernière fois. */
const CLE_EMPREINTE = "schema.empreinte";

/**
 * Empreinte du schéma courant.
 *
 * La version précédente comparait une colonne témoin choisie à la main. Il a
 * suffi d'ajouter un champ sans penser à changer le témoin pour que la mise à
 * niveau se croie faite : la colonne manquait en base, et le catalogue est
 * revenu vide en production.
 *
 * L'empreinte, elle, ne s'oublie pas : toute modification du schéma change le
 * SQL, donc l'empreinte, donc déclenche le rattrapage.
 */
function empreinteSchema() {
  return createHash("sha256").update(SCHEMA_SQL).digest("hex").slice(0, 32);
}

/**
 * Complète la base si le schéma a bougé depuis la dernière application.
 *
 * Appelée au démarrage du serveur : mieux vaut une mise à niveau silencieuse
 * qu'une page cassée assortie d'une consigne à suivre. Un échec n'interrompt
 * rien — le site démarre et le bouton « Appliquer le schéma » garde le dernier
 * mot.
 */
export async function rattraperSchema() {
  try {
    const attendue = empreinteSchema();

    // `undefined` : la table des réglages n'existe pas encore. Le schéma n'a
    // alors jamais été appliqué, il faut le jouer.
    const posee = await readSetting(CLE_EMPREINTE);
    if (posee === attendue) return false;

    await runSchema();

    // Notée seulement après coup : un échec en cours de route doit laisser le
    // rattrapage se relancer au prochain démarrage.
    await writeSetting(CLE_EMPREINTE, attendue);
    return true;
  } catch (error) {
    console.error(
      "[install] mise à niveau automatique du schéma impossible :",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
