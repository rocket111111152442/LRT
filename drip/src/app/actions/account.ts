"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { addressSchema, fieldErrors, reviewSchema } from "@/lib/validation";
import { runFormAction, runSilentAction, type FormState } from "@/lib/formAction";

export async function saveAddressAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return runFormAction("enregistrement d'une adresse", formData, async () => {
    const user = await getCurrentUser();
    if (!user) return { errors: { form: "Session expirée." } };

    const parsed = addressSchema.safeParse({
      label: formData.get("label") ?? "",
      fullName: formData.get("fullName"),
      line1: formData.get("line1"),
      line2: formData.get("line2") ?? "",
      postalCode: formData.get("postalCode"),
      city: formData.get("city"),
      country: formData.get("country") ?? "FR",
      phone: formData.get("phone") ?? "",
      isDefault: formData.get("isDefault") === "on",
    });

    if (!parsed.success) {
      return { errors: fieldErrors(parsed.error) };
    }

    const addressId = formData.get("addressId");
    const data = {
      label: parsed.data.label || null,
      fullName: parsed.data.fullName,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      postalCode: parsed.data.postalCode,
      city: parsed.data.city,
      country: parsed.data.country,
      phone: parsed.data.phone || null,
      isDefault: Boolean(parsed.data.isDefault),
    };

    if (data.isDefault) {
      // Une seule adresse par défaut à la fois.
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    if (typeof addressId === "string" && addressId) {
      // updateMany filtré sur userId : impossible de modifier l'adresse d'autrui
      // en changeant l'identifiant du formulaire.
      await prisma.address.updateMany({
        where: { id: addressId, userId: user.id },
        data,
      });
    } else {
      await prisma.address.create({ data: { ...data, userId: user.id } });
    }

    revalidatePath("/compte/adresses");
    return { success: true, message: "Adresse enregistrée." };
  });
}

export async function deleteAddressAction(formData: FormData) {
  return runSilentAction("suppression d'une adresse", async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const addressId = formData.get("addressId");
    if (typeof addressId !== "string" || !addressId) return;

    await prisma.address.deleteMany({ where: { id: addressId, userId: user.id } });
    revalidatePath("/compte/adresses");
  });
}

export async function submitReviewAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return runFormAction("dépôt d'un avis", formData, async () => {
    const user = await getCurrentUser();
    if (!user) return { errors: { form: "Connectez-vous pour laisser un avis." } };

    const parsed = reviewSchema.safeParse({
      productId: formData.get("productId"),
      orderId: formData.get("orderId") ?? "",
      rating: formData.get("rating"),
      title: formData.get("title") ?? "",
      body: formData.get("body"),
    });

    if (!parsed.success) {
      return { errors: fieldErrors(parsed.error) };
    }

    const orderId = parsed.data.orderId || null;

    // Un avis n'est accepté que si le produit a réellement été acheté et payé par
    // ce compte : c'est ce qui rend la mention « achat vérifié » crédible.
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId: parsed.data.productId,
        order: {
          userId: user.id,
          status: { in: ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"] },
          ...(orderId ? { id: orderId } : {}),
        },
      },
      select: { orderId: true },
    });

    if (!purchase) {
      return {
        errors: {
          form: "Vous pouvez laisser un avis uniquement sur une pièce que vous avez commandée.",
        },
      };
    }

    const existing = await prisma.review.findFirst({
      where: {
        productId: parsed.data.productId,
        orderId: purchase.orderId,
      },
      select: { id: true },
    });

    if (existing) {
      return { errors: { form: "Vous avez déjà déposé un avis pour cette commande." } };
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { firstName: true, lastName: true },
    });

    const authorName = [profile?.firstName, profile?.lastName?.[0]]
      .filter(Boolean)
      .join(" ")
      .trim();

    await prisma.review.create({
      data: {
        productId: parsed.data.productId,
        userId: user.id,
        orderId: purchase.orderId,
        authorName: authorName || "Client vérifié",
        rating: parsed.data.rating,
        title: parsed.data.title || null,
        body: parsed.data.body,
        verifiedPurchase: true,
        // Modération avant publication : la boutique reste maîtresse de sa page
        // d'avis et les contenus injurieux ne s'affichent jamais.
        status: "PENDING",
      },
    });

    revalidatePath("/compte/avis");
    return {
      success: true,
      message: "Merci. Votre avis sera publié après relecture.",
    };
  });
}

export async function toggleWishlistAction(formData: FormData) {
  return runSilentAction("mise à jour des favoris", async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const productId = formData.get("productId");
    if (typeof productId !== "string" || !productId) return;

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
    } else {
      await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
    }

    revalidatePath("/compte/favoris");
  });
}
