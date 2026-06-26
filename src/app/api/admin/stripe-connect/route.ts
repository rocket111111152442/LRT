import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getAppUrl(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return new URL(request.url).origin;
}

// GET : renvoie l'état de connexion Stripe de l'atelier.
export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  if (!admin.user.proAccountId) {
    return NextResponse.json({ connected: false, onboarded: false });
  }

  const account = await prisma.proAccount.findUnique({
    where: { id: admin.user.proAccountId },
    select: { stripeAccountId: true, stripeOnboarded: true },
  });

  let onboarded = account?.stripeOnboarded ?? false;

  // Si un compte existe mais pas encore marqué actif, on revérifie chez Stripe.
  if (account?.stripeAccountId && !onboarded && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const acct = await stripe.accounts.retrieve(account.stripeAccountId);
      if (acct.charges_enabled) {
        onboarded = true;
        await prisma.proAccount.update({
          where: { id: admin.user.proAccountId },
          data: { stripeOnboarded: true },
        });
      }
    } catch {
      /* ignore */
    }
  }

  return NextResponse.json({
    connected: Boolean(account?.stripeAccountId),
    onboarded,
  });
}

// POST : crée le compte connecté si besoin et renvoie le lien d'onboarding.
export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Paiement non configuré." }, { status: 503 });
  }
  if (!admin.user.proAccountId) {
    return NextResponse.json({ error: "Aucun compte pro." }, { status: 400 });
  }

  const account = await prisma.proAccount.findUnique({
    where: { id: admin.user.proAccountId },
    select: { stripeAccountId: true, ownerEmail: true, companyName: true },
  });
  if (!account) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let accountId = account.stripeAccountId;

    if (!accountId) {
      const created = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email: account.ownerEmail,
        business_type: "individual",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: { name: account.companyName },
      });
      accountId = created.id;
      await prisma.proAccount.update({
        where: { id: admin.user.proAccountId },
        data: { stripeAccountId: accountId },
      });
    }

    const appUrl = getAppUrl(request);
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/admin/paiements?refresh=1`,
      return_url: `${appUrl}/admin/paiements?done=1`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: link.url });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError && error.message.includes("Connect")
        ? "Stripe Connect n'est pas activé sur votre compte Stripe. Activez-le dans le dashboard Stripe (Settings > Connect)."
        : "Connexion Stripe impossible pour le moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
