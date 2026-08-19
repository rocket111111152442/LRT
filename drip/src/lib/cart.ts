import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma, safeQuery } from "@/lib/prisma";
import { CART_COOKIE, expireCookie, getCurrentUser } from "@/lib/auth";
import { MAX_PAR_LIGNE, shippingFor } from "@/lib/shop";

const CART_MAX_AGE = 60 * 60 * 24 * 60; // 60 jours

export type CartLine = {
  id: string;
  quantity: number;
  variantId: string;
  variantName: string;
  size: string | null;
  color: string | null;
  unitPrice: number;
  lineTotal: number;
  available: boolean;
  product: {
    id: string;
    slug: string;
    name: string;
    imageUrl: string | null;
  };
};

export type CartView = {
  id: string | null;
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
};

export const EMPTY_CART: CartView = {
  id: null,
  lines: [],
  count: 0,
  subtotal: 0,
  shipping: 0,
  total: 0,
};

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      variant: {
        include: {
          product: {
            include: { images: { orderBy: { position: "asc" }, take: 1 } },
          },
        },
      },
    },
  },
} as const;

type CartWithItems = NonNullable<
  Awaited<ReturnType<typeof prisma.cart.findFirst<{ include: typeof cartInclude }>>>
>;

function toView(cart: CartWithItems | null): CartView {
  if (!cart) return EMPTY_CART;

  const lines: CartLine[] = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    variantId: item.variantId,
    variantName: item.variant.name,
    size: item.variant.size,
    color: item.variant.color,
    unitPrice: item.variant.price,
    lineTotal: item.variant.price * item.quantity,
    available: item.variant.available && item.variant.product.active,
    product: {
      id: item.variant.product.id,
      slug: item.variant.product.slug,
      name: item.variant.product.name,
      imageUrl:
        item.variant.imageUrl ?? item.variant.product.images[0]?.url ?? null,
    },
  }));

  const subtotal = lines
    .filter((line) => line.available)
    .reduce((sum, line) => sum + line.lineTotal, 0);
  const shipping = shippingFor(subtotal);

  return {
    id: cart.id,
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

/** Lecture seule : utilisable depuis n'importe quel composant serveur. */
export async function readCart(): Promise<CartView> {
  return safeQuery(
    async () => {
      const user = await getCurrentUser();
      const store = await cookies();
      const token = store.get(CART_COOKIE)?.value;

      if (user) {
        const cart = await prisma.cart.findFirst({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
          include: cartInclude,
        });
        if (cart) return toView(cart);
      }

      if (!token) return EMPTY_CART;

      const guestCart = await prisma.cart.findUnique({
        where: { token },
        include: cartInclude,
      });

      // Un panier invité rattaché à un autre compte ne doit jamais fuiter.
      if (guestCart?.userId && guestCart.userId !== user?.id) return EMPTY_CART;

      return toView(guestCart);
    },
    EMPTY_CART,
    "lecture du panier",
  );
}

/**
 * Récupère ou crée le panier courant. Écrit un cookie : à n'appeler que depuis
 * une Server Action ou un Route Handler.
 */
export async function getOrCreateCart() {
  const user = await getCurrentUser();
  const store = await cookies();
  let token = store.get(CART_COOKIE)?.value;

  if (user) {
    const existing = await prisma.cart.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) return existing;
  }

  if (token) {
    const guestCart = await prisma.cart.findUnique({ where: { token } });
    if (guestCart && (!guestCart.userId || guestCart.userId === user?.id)) {
      if (user && !guestCart.userId) {
        return prisma.cart.update({
          where: { id: guestCart.id },
          data: { userId: user.id },
        });
      }
      return guestCart;
    }
  }

  token = randomBytes(24).toString("base64url");
  store.set(CART_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_MAX_AGE,
  });

  return prisma.cart.create({ data: { token, userId: user?.id ?? null } });
}

export async function addToCart(variantId: string, quantity = 1) {
  const variant = await prisma.variant.findUnique({
    where: { id: variantId },
    include: { product: { select: { active: true } } },
  });

  if (!variant || !variant.available || !variant.product.active) {
    throw new Error("Ce modèle n'est plus disponible.");
  }

  const cart = await getOrCreateCart();
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  const nextQuantity = Math.min(
    MAX_PAR_LIGNE,
    (existing?.quantity ?? 0) + Math.max(1, quantity),
  );

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    create: { cartId: cart.id, variantId, quantity: nextQuantity },
    update: { quantity: nextQuantity },
  });

  await prisma.cart.update({
    where: { id: cart.id },
    data: { updatedAt: new Date() },
  });
}

export async function setCartItemQuantity(itemId: string, quantity: number) {
  const cart = await getOrCreateCart();
  // On filtre sur cartId : sans cela, n'importe qui pourrait modifier la ligne
  // du panier d'un autre client en devinant un identifiant.
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });
  if (!item) return;

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
    return;
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: Math.min(MAX_PAR_LIGNE, quantity) },
  });
}

export async function removeCartItem(itemId: string) {
  const cart = await getOrCreateCart();
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
}

export async function clearCart(cartId: string) {
  await prisma.cartItem.deleteMany({ where: { cartId } });
}

/**
 * À la connexion : le panier invité est fusionné dans celui du compte, puis
 * supprimé. Les quantités s'additionnent, plafonnées comme à l'ajout.
 */
export async function mergeGuestCartInto(userId: string) {
  const store = await cookies();
  const token = store.get(CART_COOKIE)?.value;
  if (!token) return;

  const guestCart = await prisma.cart.findUnique({
    where: { token },
    include: { items: true },
  });

  if (!guestCart || guestCart.userId === userId) return;
  if (guestCart.userId && guestCart.userId !== userId) return;

  const userCart = await prisma.cart.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  if (!userCart) {
    await prisma.cart.update({
      where: { id: guestCart.id },
      data: { userId },
    });
    return;
  }

  for (const item of guestCart.items) {
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
    });

    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
      create: {
        cartId: userCart.id,
        variantId: item.variantId,
        quantity: Math.min(MAX_PAR_LIGNE, item.quantity),
      },
      update: {
        quantity: Math.min(
          MAX_PAR_LIGNE,
          (existing?.quantity ?? 0) + item.quantity,
        ),
      },
    });
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });

  // Mêmes attributs qu'à la pose, sinon le préfixe `__Host-` fait rejeter la
  // suppression par le navigateur et le panier invité resterait accroché.
  await expireCookie(CART_COOKIE);
}
