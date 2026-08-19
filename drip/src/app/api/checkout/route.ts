import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/orders";
import { stripeEnabled } from "@/lib/stripe";
import { limitByIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = await limitByIp("checkout", 10, 60);

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans une minute." },
      { status: 429 },
    );
  }

  if (!stripeEnabled()) {
    // Le client n'a que faire du nom de la variable : il lui faut une phrase
    // qui lui dise quoi faire. Le détail technique va dans la trace serveur,
    // là où la boutique le lira.
    console.error(
      "[paiement] STRIPE_SECRET_KEY manquante : la caisse refuse toute " +
        "commande. Renseignez-la dans les variables d'environnement.",
    );

    return NextResponse.json(
      {
        error:
          "La caisse n'est pas encore ouverte. Écrivez-nous et nous " +
          "enregistrerons votre commande à la main.",
      },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const couponCode =
    typeof body?.coupon === "string" ? body.coupon.slice(0, 40) : undefined;

  try {
    const session = await createCheckoutSession(couponCode);
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Le paiement n'a pas pu être lancé.",
      },
      { status: 400 },
    );
  }
}
