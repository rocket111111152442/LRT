/**
 * Synchronisation manuelle du catalogue Printful vers la base.
 *
 *   npm run printful:sync
 *
 * La même opération est disponible depuis l'administration
 * (/admin/produits > « Synchroniser Printful »).
 */

import "dotenv/config";
import { syncPrintfulCatalog } from "../src/lib/printful";

async function main() {
  if (!process.env.PRINTFUL_API_KEY) {
    throw new Error(
      "PRINTFUL_API_KEY manquante. Créez un jeton privé dans Printful > Paramètres > Développeurs.",
    );
  }

  console.log("Synchronisation du catalogue Printful…");

  const report = await syncPrintfulCatalog();

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
