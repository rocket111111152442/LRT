import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

type ActivationResult =
  | { ok: true; slug: string | null }
  | { ok: false; reason: "missing-account" | "not-paid" };

function getStringField(record: unknown, field: string) {
  if (typeof record !== "object" || record === null) {
    return null;
  }

  const value = (record as Record<string, unknown>)[field];
  return typeof value === "string" ? value : null;
}

export async function activatePaidCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<ActivationResult> {
  const proAccountId = session.metadata?.proAccountId;

  if (!proAccountId) {
    return { ok: false, reason: "missing-account" };
  }

  if (session.payment_status !== "paid") {
    return { ok: false, reason: "not-paid" };
  }

  const proAccount = await prisma.proAccount.update({
    where: { id: proAccountId },
    data: {
      paymentStatus: "PAID",
      stripeSessionId: session.id,
    },
  });

  return { ok: true, slug: getStringField(proAccount, "slug") };
}
