import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  type EnterpriseSelection,
  normalizeSelection,
  summarizeSelection,
} from "@/lib/enterpriseQuote";

type EnterpriseMeta = Stripe.Metadata | null | undefined;

function csv(value: string | undefined): string[] {
  return value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

export function selectionFromMetadata(meta: EnterpriseMeta): EnterpriseSelection {
  return normalizeSelection({
    shops: Number(meta?.shops ?? 1),
    seats: Number(meta?.seats ?? 2),
    storageGb: Number(meta?.storageGb ?? 10),
    volume: meta?.volume,
    billing: meta?.billing === "monthly" ? "monthly" : "annual",
    monthlyOptions: csv(meta?.monthlyOptions),
    oneTimeOptions: csv(meta?.oneTimeOptions),
  });
}

// Active l'offre entreprise après un paiement Stripe confirmé : passe le compte
// en PAYÉ, applique le plan entreprise, le support, le stockage demandé et
// enregistre le détail de ce que le client a choisi.
export async function activateEnterpriseCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<{ ok: boolean; slug?: string | null }> {
  if (session.metadata?.enterprise !== "1") return { ok: false };
  if (session.payment_status !== "paid") return { ok: false };

  const proAccountId = session.metadata?.proAccountId;
  if (!proAccountId) return { ok: false };

  const selection = selectionFromMetadata(session.metadata);
  const details = JSON.stringify({
    selection,
    summary: summarizeSelection(selection),
    activatedAt: new Date().toISOString(),
    stripeSessionId: session.id,
  });

  try {
    const account = await prisma.proAccount.update({
      where: { id: proAccountId },
      data: {
        paymentStatus: "PAID",
        plan: "enterprise",
        supportIncluded: true,
        storageAddonGb: selection.storageGb,
        enterprisePlanDetails: details,
        stripeSessionId: session.id,
      },
    });
    return { ok: true, slug: (account as { slug?: string | null }).slug ?? null };
  } catch {
    return { ok: false };
  }
}
