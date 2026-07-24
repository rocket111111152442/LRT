import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPublicAppUrl } from "@/lib/appUrl";
import { requireAdminApi } from "@/lib/auth";
import { getPlanOption } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

function getStripeErrorMessage(error: unknown) {
  if (
    error instanceof Stripe.errors.StripeAuthenticationError ||
    (error instanceof Error && error.message.includes("Invalid API Key"))
  ) {
    return "Cle secrete Stripe invalide ou non configuree.";
  }
  if (error instanceof Stripe.errors.StripeConnectionError) {
    return "Connexion a Stripe impossible. Reessayez dans quelques instants.";
  }
  return "Paiement impossible pour le moment.";
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Paiement non configure sur ce serveur." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const optionId =
    typeof body === "object" && body !== null && "optionId" in body
      ? String((body as Record<string, unknown>).optionId)
      : "";

  const option = getPlanOption(optionId);

  if (!option) {
    return NextResponse.json({ error: "Offre introuvable." }, { status: 400 });
  }

  if (option.kind === "custom" || option.priceYearly === null) {
    return NextResponse.json(
      { error: "Cette offre necessite un devis personnalise." },
      { status: 400 },
    );
  }

  const proAccountId = admin.user.proAccountId;

  if (!proAccountId) {
    return NextResponse.json(
      { error: "Aucun compte pro associe a cet admin." },
      { status: 400 },
    );
  }

  const proAccount = await prisma.proAccount.findUnique({
    where: { id: proAccountId },
    select: { id: true, companyName: true, ownerEmail: true, slug: true },
  });

  if (!proAccount) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }

  const priceCents = Math.round(option.priceYearly * 100);
  const appUrl = getPublicAppUrl();

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: proAccount.ownerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Qoravo — ${option.name}`,
              description: option.tagline,
            },
            unit_amount: priceCents,
            recurring: { interval: "year" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        planUpgrade: "1",
        optionId: option.id,
        proAccountId,
        companyName: proAccount.companyName,
      },
      success_url: `${appUrl}/admin/offres?upgrade=success&offre=${option.id}`,
      cancel_url: `${appUrl}/admin/offres?upgrade=cancel`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Session Stripe impossible a creer." },
        { status: 500 },
      );
    }

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: getStripeErrorMessage(error) },
      { status: 500 },
    );
  }
}
