import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signOAuthState } from "@/lib/pro/stripeConnectOAuth";

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

// POST : renvoie l'URL OAuth « Se connecter avec Stripe » (Connect Standard).
// La boutique relie son compte Stripe existant en se connectant chez Stripe,
// sans ressaisir ses informations.
export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  if (!admin.user.proAccountId) {
    return NextResponse.json({ error: "Aucun compte pro." }, { status: 400 });
  }

  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "Connexion Stripe non configurée côté serveur (identifiant Connect manquant). Ajoutez STRIPE_CONNECT_CLIENT_ID sur Vercel.",
      },
      { status: 503 },
    );
  }

  const account = await prisma.proAccount.findUnique({
    where: { id: admin.user.proAccountId },
    select: { ownerEmail: true },
  });

  const state = signOAuthState(admin.user.proAccountId);
  const redirectUri = `${getAppUrl(request)}/api/admin/stripe-connect/callback`;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    redirect_uri: redirectUri,
    state,
  });
  if (account?.ownerEmail) {
    params.set("stripe_user[email]", account.ownerEmail);
  }

  return NextResponse.json({
    url: `https://connect.stripe.com/oauth/authorize?${params.toString()}`,
  });
}
