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
    return NextResponse.json(
      {
        error:
          "Le paiement n'est pas encore activé. Renseignez STRIPE_SECRET_KEY pour ouvrir la caisse.",
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
