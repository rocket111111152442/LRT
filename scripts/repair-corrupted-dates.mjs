/**
 * Répare les champs date corrompus dans Firestore.
 *
 * Contexte : avant le garde-fou ajouté dans src/lib/prisma.ts, les objets Date
 * passaient par un `Object.entries(...)` qui les transformait en objet vide {}.
 * Résultat : soldAt, spentAt, createdAt, etc. valent {} et sont rejetés par les
 * filtres de période (la compta affiche "rien", les factures affichent "-").
 *
 * Cette migration parcourt les collections concernées et remplace chaque champ
 * date corrompu ({}) par l'horodatage réel du document (createTime / updateTime
 * fournis par Firestore), qui est la meilleure approximation disponible.
 *
 * Lancement :   node scripts/repair-corrupted-dates.mjs
 * Simulation :  node scripts/repair-corrupted-dates.mjs --dry-run
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const DRY_RUN = process.argv.includes("--dry-run");
const backup = [];

const raw = readFileSync(new URL("../.env", import.meta.url), "utf8").replace(/^﻿/, "");
const env = {};
let buffer = "";
for (const line of raw.split(/\r?\n/)) {
  if (/^[A-Z0-9_]+=/.test(line)) {
    if (buffer) { const eq = buffer.indexOf("="); env[buffer.slice(0, eq)] = buffer.slice(eq + 1).replace(/^"|"$/g, ""); }
    buffer = line;
  } else buffer += "\n" + line;
}
if (buffer) { const eq = buffer.indexOf("="); env[buffer.slice(0, eq)] = buffer.slice(eq + 1).replace(/^"|"$/g, ""); }

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();

// Collections et leurs champs date. "updatedAt" est restauré depuis updateTime,
// tous les autres champs date depuis createTime (meilleure approximation).
const COLLECTIONS = [
  "accountingSales",
  "accountingExpenses",
  "accountingPayrollEntries",
  "accountingSettings",
  "repairs",
  "repairEvents",
  "inventoryItems",
  "publicReviews",
  "setupAppointments",
  "pendingProSignups",
  "proAccounts",
  "users",
  "emailSettings",
  "emailVerificationCodes",
];

// Un champ est "date corrompu" s'il est un objet non-null, non-Timestamp et
// sans propriétés utiles (le spread d'une Date donne {}).
function isCorruptedDate(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !(value instanceof Timestamp) &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}

function looksLikeDateField(key) {
  return /(^|[a-z])At$|Start$|End$|Until$|soldAt|spentAt/.test(key);
}

// Champs qui représentent un moment passé proche de la création : on peut les
// restaurer avec l'horodatage Firestore du document.
const PAST_FIELDS = new Set([
  "createdAt",
  "soldAt",
  "spentAt",
  "periodStart",
  "quoteSentAt",
  "quoteRespondedAt",
  "reviewRespondedAt",
  "respondedAt",
  "verifiedAt",
  "paidAt",
  "archivedAt",
]);

// Champs orientés futur (échéances) : createTime serait faux, on remet null.
// (trialEndsAt, warrantyUntil, expectedPickupAt, periodEnd, expiresAt...)
function resolveValue(key, doc) {
  if (key === "updatedAt") {
    return doc.updateTime ?? doc.createTime;
  }
  if (PAST_FIELDS.has(key)) {
    return doc.createTime;
  }
  return null;
}

let totalDocsFixed = 0;
let totalFieldsFixed = 0;

for (const coll of COLLECTIONS) {
  let snap;
  try {
    snap = await db.collection(coll).get();
  } catch (e) {
    console.log(`(skip ${coll}: ${e?.message ?? e})`);
    continue;
  }

  let collDocs = 0;
  let collFields = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const patch = {};

    for (const [key, value] of Object.entries(data)) {
      if (looksLikeDateField(key) && isCorruptedDate(value)) {
        patch[key] = resolveValue(key, doc);
      }
    }

    const keys = Object.keys(patch);
    if (keys.length > 0) {
      collDocs += 1;
      collFields += keys.length;
      backup.push({
        collection: coll,
        id: doc.id,
        corruptedFields: keys,
        previousValues: Object.fromEntries(keys.map((k) => [k, data[k]])),
        createTime: doc.createTime?.toDate().toISOString() ?? null,
        updateTime: doc.updateTime?.toDate().toISOString() ?? null,
      });
      if (!DRY_RUN) {
        await doc.ref.set(patch, { merge: true });
      }
    }
  }

  if (collDocs > 0) {
    console.log(
      `${coll}: ${collDocs} doc(s), ${collFields} champ(s) date réparé(s)${DRY_RUN ? " [dry-run]" : ""}`,
    );
  }
  totalDocsFixed += collDocs;
  totalFieldsFixed += collFields;
}

if (backup.length > 0) {
  mkdirSync(new URL("../backups", import.meta.url), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = new URL(`../backups/corrupted-dates-${stamp}.json`, import.meta.url);
  writeFileSync(file, JSON.stringify(backup, null, 2), "utf8");
  console.log(`\nSauvegarde écrite : backups/corrupted-dates-${stamp}.json`);
}

console.log(
  `\n${DRY_RUN ? "[DRY-RUN] " : ""}Terminé : ${totalDocsFixed} document(s), ${totalFieldsFixed} champ(s) date réparé(s).`,
);
process.exit(0);
