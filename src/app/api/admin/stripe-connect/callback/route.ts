import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyOAuthState } from "@/lib/pro/stripeConnectOAuth";

function getAppUrl(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return new URL(request.url).origin;
}

// GET : retour de Stripe après que la boutique a autorisé la connexion OAuth.
// On échange le code contre l'identifiant du compte connecté et on l'enregistre.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const base = getAppUrl(request);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(`${base}/admin/paiements?stripe=denied`);
  }
  if (!code) {
    return NextResponse.redirect(`${base}/admin/paiements?stripe=error`);
  }

  // Le state signé doit correspondre au compte pro de l'admin connecté.
  const admin = await getCurrentAdmin();
  const stateProAccountId = verifyOAuthState(state);
  if (
    !admin?.proAccountId ||
    !stateProAccountId ||
    stateProAccountId !== admin.proAccountId
  ) {
    return NextResponse.redirect(`${base}/admin/paiements?stripe=error`);
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(`${base}/admin/paiements?stripe=error`);
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const token = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });
    const connectedAccountId = token.stripe_user_id;
    if (!connectedAccountId) {
      return NextResponse.redirect(`${base}/admin/paiements?stripe=error`);
    }

    // On vérifie si le compte peut déjà encaisser ; sinon il reste « connecté »
    // mais pas encore actif.
    let onboarded = true;
    try {
      const acct = await stripe.accounts.retrieve(connectedAccountId);
      onboarded = Boolean(acct.charges_enabled);
    } catch {
      /* on garde onboarded=true : le compte est lié, le statut sera revérifié */
    }

    await prisma.proAccount.update({
      where: { id: admin.proAccountId },
      data: { stripeAccountId: connectedAccountId, stripeOnboarded: onboarded },
    });

    return NextResponse.redirect(`${base}/admin/paiements?done=1`);
  } catch {
    return NextResponse.redirect(`${base}/admin/paiements?stripe=error`);
  }
}
