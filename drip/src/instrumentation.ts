/**
 * Code exécuté une fois au démarrage du serveur, avant la première requête.
 *
 * C'est le seul endroit qui garantit cet ordre : une mise à niveau lancée
 * depuis une page arrive trop tard, puisque Next rend la mise en page et la
 * page en parallèle. Une colonne ajoutée au schéma manquait alors à la
 * première visite — et le panier, qui lit le produit entier, revenait vide.
 */
export async function register() {
  // `pg` n'existe pas sur le runtime edge. Les pages et les routes qui lisent
  // la base tournent côté Node : c'est là que la mise à niveau compte.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { rattraperSchema } = await import("@/lib/install");
  await rattraperSchema();
}
