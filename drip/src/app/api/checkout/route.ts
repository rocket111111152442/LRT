import { NextResponse } from "next/server";
import { ErreurBoutique, createCheckoutSession } from "@/lib/orders";
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
    // Seuls nos propres messages sont montrables : une erreur Stripe arrive en
    // anglais et parle de paramètres d'API (« You may only specify one of these
    // parameters… »). Le client n'en fera rien, la trace serveur si.
    if (error instanceof ErreurBoutique) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(
      "[paiement] session Stripe impossible :",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      {
        error:
          "Le paiement n'a pas pu être lancé. Réessayez dans un instant ; " +
          "si cela recommence, écrivez-nous.",
      },
      { status: 400 },
    );
  }
}
