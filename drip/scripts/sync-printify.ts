/**
 * Synchronisation manuelle du catalogue Printify vers la base.
 *
 *   npm run printify:sync
 *
 * La même opération est disponible depuis l'administration
 * (/admin/produits > « Synchroniser Printify »).
 */

import "dotenv/config";
import { syncPrintifyCatalog } from "../src/lib/printify";

async function main() {
  if (!process.env.PRINTIFY_API_KEY) {
    throw new Error(
      "PRINTIFY_API_KEY manquante. Créez un jeton privé dans Printify > My profile > Connections.",
    );
  }

  console.log("Synchronisation du catalogue Printify…");

  const report = await syncPrintifyCatalog();

  console.log(`→ ${report.created} pièce(s) créée(s)`);
  console.log(`→ ${report.updated} pièce(s) mise(s) à jour`);
  console.log(`→ ${report.variants} variante(s) traitée(s)`);

  if (report.skipped.length > 0) {
    console.log("→ Ignorées :");
    for (const line of report.skipped) console.log(`   • ${line}`);
  }

  console.log(
    "\nLes nouvelles pièces arrivent hors ligne : complétez leur fiche dans l'administration, puis publiez-les.",
  );
}

main().catch((error) => {
  console.error("Échec de la synchronisation :", error);
  process.exitCode = 1;
});
