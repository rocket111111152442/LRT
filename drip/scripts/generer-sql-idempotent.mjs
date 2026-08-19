/**
 * Rend le script SQL rejouable.
 *
 * Le script brut sorti de `prisma migrate diff` suppose une base vierge : si
 * une premiere execution s'arrete en cours de route, la relancer echoue des la
 * premiere ligne (« le type Role existe deja »). Or c'est exactement ce qu'on
 * fait faire a quelqu'un qui colle du SQL dans un editeur web.
 *
 * On rend donc chaque instruction sans effet si son objet existe deja. Aucune
 * suppression : le script ne detruit jamais de donnees, il complete ce qui
 * manque.
 *
 *   node scripts/generer-sql-idempotent.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = "prisma/sql/.brut.sql";
const CIBLE = "prisma/sql/01-creer-les-tables.sql";

let sql = readFileSync(SOURCE, "utf8");

// CREATE TYPE n'accepte pas IF NOT EXISTS : on rattrape l'exception.
sql = sql.replace(
  /^CREATE TYPE (.+);$/gm,
  (_m, corps) =>
    `DO $$ BEGIN\n  CREATE TYPE ${corps};\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$;`,
);

sql = sql.replace(/^CREATE TABLE /gm, "CREATE TABLE IF NOT EXISTS ");
sql = sql.replace(/^CREATE UNIQUE INDEX /gm, "CREATE UNIQUE INDEX IF NOT EXISTS ");
sql = sql.replace(/^CREATE INDEX /gm, "CREATE INDEX IF NOT EXISTS ");

// Idem pour les cles etrangeres.
sql = sql.replace(
  /^ALTER TABLE (.+);$/gm,
  (_m, corps) =>
    `DO $$ BEGIN\n  ALTER TABLE ${corps};\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$;`,
);

/**
 * Colonnes ajoutees apres coup.
 *
 * `CREATE TABLE IF NOT EXISTS` ne fait rien sur une table qui existe deja : une
 * base installee avant l'ajout d'un champ ne le verrait jamais arriver. On
 * repete donc chaque colonne en `ADD COLUMN IF NOT EXISTS`, ce qui complete les
 * tables anciennes sans toucher aux donnees.
 *
 * Seules les colonnes sures sont reprises : nullables, ou pourvues d'un
 * DEFAULT. Ajouter un NOT NULL sans valeur par defaut a une table deja remplie
 * echouerait — cette decision-la se prend a la main.
 */
function colonnesRattrapees(source) {
  const lignes = [];
  const tables = source.matchAll(
    /^CREATE TABLE IF NOT EXISTS "([^"]+)" \(([\s\S]*?)^\);$/gm,
  );

  for (const [, table, corps] of tables) {
    for (const brut of corps.split("\n")) {
      const colonne = brut.trim().replace(/,$/, "");

      if (!colonne.startsWith('"')) continue; // CONSTRAINT, ligne vide…

      const obligatoire = /\bNOT NULL\b/.test(colonne);
      const parDefaut = /\bDEFAULT\b/.test(colonne);
      if (obligatoire && !parDefaut) continue;

      lignes.push(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS ${colonne};`,
      );
    }
  }

  return lignes.length === 0
    ? ""
    : [
        "",
        "-- Colonnes ajoutees apres la premiere installation.",
        "-- Sans effet sur une base a jour.",
        ...lignes,
        "",
      ].join("\n");
}

sql += colonnesRattrapees(sql);

const entete = `-- NATURAL BRUTAL — création des tables de la boutique.
--
-- À coller dans Supabase > SQL Editor, puis « Run ». Une seule fois suffit,
-- mais le script peut être relancé sans risque : il ne crée que ce qui manque
-- et ne supprime jamais rien.
--
-- Généré depuis prisma/schema.prisma — ne pas modifier à la main.
-- Régénérer avec : npm run sql:generer

`;

writeFileSync(CIBLE, entete + sql);
console.log(`${CIBLE} écrit (${sql.split("\n").length} lignes).`);

// Le meme SQL, embarque comme module : la page d'installation doit pouvoir le
// jouer depuis le serveur, or un fichier .sql du depot n'est pas inclus dans le
// paquet deploye sur Vercel.
const MODULE = "src/lib/schemaSql.ts";
writeFileSync(
  MODULE,
  `/**
 * Schéma complet de la boutique, en SQL rejouable.
 *
 * Généré depuis prisma/schema.prisma — ne pas modifier à la main.
 * Régénérer avec : npm run sql:generer
 */

export const SCHEMA_SQL = ${JSON.stringify(sql)};
`,
);
console.log(`${MODULE} écrit.`);
