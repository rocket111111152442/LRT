import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  computeEnterpriseQuote,
  normalizeSelection,
  type EnterpriseSelection,
} from "@/lib/enterpriseQuote";

function getAppUrl(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return new URL(request.url).origin;
}

function getStripeErrorMessage(error: unknown) {
  if (
    error instanceof Stripe.errors.StripeAuthenticationError ||
    (error instanceof Error && error.message.includes("Invalid API Key"))
  ) {
    return "Clé secrète Stripe invalide ou non configurée.";
  }
  if (error instanceof Stripe.errors.StripeConnectionError) {
    return "Connexion à Stripe impossible. Réessayez dans quelques instants.";
  }
  return "Paiement impossible pour le moment.";
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  if (!admin.user.proAccountId) {
    return NextResponse.json({ error: "Compte pro introuvable." }, { status: 404 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Paiement Stripe non configuré pour le moment." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // On recalcule TOUT côté serveur à partir de la sélection : on ne fait jamais
  // confiance au prix envoyé par le navigateur.
  const selection: EnterpriseSelection = normalizeSelection(
    (body ?? {}) as Partial<EnterpriseSelection>,
  );
  const quote = computeEnterpriseQuote(selection);

  const proAccount = await prisma.proAccount.findUnique({
    where: { id: admin.user.proAccountId },
    select: { id: true, companyName: true, ownerEmail: true, slug: true },
  });
  if (!proAccount) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }

  const appUrl = getAppUrl(request);
  const intervalLabel = quote.recurringInterval === "year" ? "an" : "mois";

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: "eur",
        product_data: {
          name: "Qoravo — Offre entreprise sur mesure",
          description: `Abonnement entreprise pour ${proAccount.companyName} (par ${intervalLabel}).`,
        },
        unit_amount: Math.round(quote.recurringAmount * 100),
        recurring: { interval: quote.recurringInterval },
      },
      quantity: 1,
    },
  ];

  // Frais ponctuels (migration, formation…) : facturés une seule fois sur la
  // première facture de l'abonnement.
  if (quote.oneTimeTotal > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: "Qoravo — Mise en place (services ponctuels)",
          description: quote.oneTimeLines.map((l) => l.label).join(", "),
        },
        unit_amount: Math.round(quote.oneTimeTotal * 100),
      },
      quantity: 1,
    });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: proAccount.ownerEmail,
      line_items: lineItems,
      metadata: {
        enterprise: "1",
        proAccountId: proAccount.id,
        companyName: proAccount.companyName,
        shops: String(selection.shops),
        seats: String(selection.seats),
        storageGb: String(selection.storageGb),
        volume: selection.volume,
        billing: selection.billing,
        monthlyOptions: selection.monthlyOptions.join(","),
        oneTimeOptions: selection.oneTimeOptions.join(","),
      },
      success_url: `${appUrl}/admin/offre-entreprise?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/admin/offre-entreprise?paid=cancel`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Session Stripe impossible à créer." },
        { status: 500 },
      );
    }

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    return NextResponse.json({ error: getStripeErrorMessage(error) }, { status: 500 });
  }
}
