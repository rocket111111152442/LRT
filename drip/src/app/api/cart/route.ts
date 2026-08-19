import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addToCart,
  readCart,
  removeCartItem,
  setCartItemQuantity,
} from "@/lib/cart";
import { limitByIp } from "@/lib/rateLimit";
import { MAX_PAR_LIGNE } from "@/lib/shop";

export const dynamic = "force-dynamic";

const payloadSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("add"),
    variantId: z.string().min(1).max(60),
    quantity: z.coerce.number().int().min(1).max(MAX_PAR_LIGNE).default(1),
  }),
  z.object({
    action: z.literal("set"),
    itemId: z.string().min(1).max(60),
    quantity: z.coerce.number().int().min(0).max(MAX_PAR_LIGNE),
  }),
  z.object({
    action: z.literal("remove"),
    itemId: z.string().min(1).max(60),
  }),
]);

export async function GET() {
  const cart = await readCart();
  return NextResponse.json({ cart });
}

export async function POST(request: Request) {
  const limit = await limitByIp("cart", 60, 60);

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Trop de requêtes. Patientez quelques secondes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    // Le message compte : le panier refusait toute quantité supérieure à dix
    // en répondant « Requête invalide », que le navigateur avalait en silence.
    // Le client cliquait, rien ne bougeait, et rien ne disait pourquoi.
    return NextResponse.json(
      { error: `Quantité invalide : maximum ${MAX_PAR_LIGNE} par référence.` },
      { status: 400 },
    );
  }

  try {
    if (parsed.data.action === "add") {
      await addToCart(parsed.data.variantId, parsed.data.quantity);
    } else if (parsed.data.action === "set") {
      await setCartItemQuantity(parsed.data.itemId, parsed.data.quantity);
    } else {
      await removeCartItem(parsed.data.itemId);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Action impossible sur le panier.",
      },
      { status: 400 },
    );
  }

  const cart = await readCart();
  return NextResponse.json({ cart });
}
