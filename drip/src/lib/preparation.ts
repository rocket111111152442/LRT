import { prisma, safeQuery } from "@/lib/prisma";
import { databaseUrl } from "@/lib/services";
import { stripeEnabled } from "@/lib/stripe";
import { printifyEnabled, printifyWebhookSecret } from "@/lib/printify";

/**
 * De quoi répondre à « est-ce que je peux vendre ? » sans avoir à demander.
 *
 * Chaque point est vérifié pour de vrai — une variable posée, une table
 * remplie — et porte la marche à suivre quand il manque. Une boutique qui
 * s'ouvre a besoin d'une liste, pas d'un ressenti.
 */

export type PointPreparation = {
  cle: string;
  titre: string;
  ok: boolean;
  /** Sans lui, aucune vente n'est possible. */
  bloquant: boolean;
  detail: string;
  lien?: { href: string; libelle: string };
};

export async function verifierPreparation(): Promise<PointPreparation[]> {
  const [produitsEnLigne, suiviColis] = await Promise.all([
    safeQuery(
      () => prisma.product.count({ where: { active: true } }),
      0,
      "pièces en ligne",
    ),
    printifyEnabled()
      ? printifyWebhookSecret().catch(() => null)
      : Promise.resolve(null),
  ]);

  const webhookStripe = Boolean(process.env.STRIPE_WEBHOOK_SECRET);

  return [
    {
      cle: "base",
      titre: "Base de données",
      ok: Boolean(databaseUrl()),
      bloquant: true,
      detail:
        "Elle garde les commandes, les clients et le catalogue. Sans elle, rien ne s'enregistre.",
    },
    {
      cle: "stripe",
      titre: "Encaissement Stripe",
      ok: stripeEnabled(),
      bloquant: true,
      detail: stripeEnabled()
        ? "La caisse est ouverte : les clients peuvent payer."
        : "Renseignez STRIPE_SECRET_KEY dans les variables d'environnement de l'hébergeur. Sans elle, le bouton de paiement refuse toute commande.",
    },
    {
      cle: "stripe-webhook",
      titre: "Confirmation de paiement (webhook Stripe)",
      ok: webhookStripe,
      bloquant: false,
      detail: webhookStripe
        ? "Stripe prévient la boutique dès qu'un paiement aboutit : la commande passe en payée et part en fabrication toute seule."
        : "STRIPE_WEBHOOK_SECRET n'est pas renseignée. Les commandes se confirment encore au retour du client sur la page de remerciement, mais un client qui ferme l'onglet trop tôt laisse sa commande en attente. À créer dans Stripe > Développeurs > Webhooks, sur l'adresse /api/stripe/webhook.",
    },
    {
      cle: "printify",
      titre: "Fabrication Printify",
      ok: printifyEnabled(),
      bloquant: false,
      detail: printifyEnabled()
        ? "Les commandes payées partent automatiquement en fabrication."
        : "Renseignez PRINTIFY_API_KEY. Sans elle, chaque commande devra être ressaisie à la main dans Printify.",
    },
    {
      cle: "printify-suivi",
      titre: "Suivi des colis",
      ok: Boolean(suiviColis),
      bloquant: false,
      detail: suiviColis
        ? "Printify prévient la boutique à chaque expédition : le numéro de suivi arrive tout seul dans le compte du client."
        : "Sans lui, une commande expédiée reste affichée « en fabrication » et le client n'a pas de numéro de suivi.",
      lien: { href: "/admin/commandes", libelle: "Activer le suivi" },
    },
    {
      cle: "catalogue",
      titre: "Pièces en vente",
      ok: produitsEnLigne > 0,
      bloquant: true,
      detail:
        produitsEnLigne > 0
          ? `${produitsEnLigne} pièce${produitsEnLigne > 1 ? "s" : ""} en ligne.`
          : "Aucune pièce n'est visible sur la boutique. Synchronisez Printify, puis publiez les fiches.",
      lien: { href: "/admin/produits", libelle: "Voir le catalogue" },
    },
  ];
}
