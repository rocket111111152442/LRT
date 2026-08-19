import { NextResponse } from "next/server";
import { applyCoupon } from "@/lib/orders";
import { readCart } from "@/lib/cart";
import { limitByIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Limite volontairement basse : sans elle, ce point d'entrée permettrait de
  // deviner les codes promo par force brute.
  const limit = await limitByIp("coupon", 12, 300);

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Trop d'essais. Réessayez dans quelques minutes." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.slice(0, 40) : "";

  if (!code) {
    return NextResponse.json({ error: "Code manquant." }, { status: 400 });
  }

  const cart = await readCart();
  const result = await applyCoupon(code, cart.subtotal);

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    code: result.code,
    discount: result.discount,
    freeShipping: result.freeShipping,
  });
}
