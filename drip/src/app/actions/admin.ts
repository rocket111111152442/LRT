"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { fieldErrors } from "@/lib/validation";
import { syncPrintifyCatalog, createPrintifyOrder, printifyEnabled } from "@/lib/printify";
import type { FormState } from "@/app/actions/auth";

/** Toute action d'administration commence par revérifier le rôle côté serveur. */
async function guard() {
  return requireAdmin();
}

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Nom requis.").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Slug requis.")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Uniquement des minuscules, chiffres et tirets."),
  subtitle: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().min(1, "Description requise.").max(6000),
  composition: z.string().trim().max(3000).optional().or(z.literal("")),
  badge: z.string().trim().max(40).optional().or(z.literal("")),
  basePrice: z.coerce.number().int().min(0).max(1_000_000),
  compareAtPrice: z.coerce.number().int().min(0).max(1_000_000).optional(),
  categoryId: z.string().trim().optional().or(z.literal("")),
  position: z.coerce.number().int().min(0).max(999).default(0),
  seoTitle: z.string().trim().max(120).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function updateProductAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await guard();

  const parsed = productSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    subtitle: formData.get("subtitle") ?? "",
    description: formData.get("description"),
    composition: formData.get("composition") ?? "",
    badge: formData.get("badge") ?? "",
    // Les prix sont saisis en euros dans l'admin et stockés en centimes.
    basePrice: Math.round(Number(formData.get("basePrice") ?? 0) * 100),
    compareAtPrice: formData.get("compareAtPrice")
      ? Math.round(Number(formData.get("compareAtPrice")) * 100)
      : undefined,
    categoryId: formData.get("categoryId") ?? "",
    position: formData.get("position") ?? 0,
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const duplicate = await prisma.product.findFirst({
    where: { slug: parsed.data.slug, id: { not: parsed.data.id } },
    select: { id: true },
  });

  if (duplicate) {
    return { errors: { slug: "Ce slug est déjà utilisé par une autre pièce." } };
  }

  await prisma.product.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      subtitle: parsed.data.subtitle || null,
      description: parsed.data.description,
      composition: parsed.data.composition || null,
      badge: parsed.data.badge || null,
      basePrice: parsed.data.basePrice,
      compareAtPrice: parsed.data.compareAtPrice || null,
      categoryId: parsed.data.categoryId || null,
      position: parsed.data.position,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
    },
  });

  revalidatePath("/admin/produits");
  revalidatePath(`/produit/${parsed.data.slug}`);
  revalidatePath("/boutique");
  revalidatePath("/");

  return { success: true, message: "Pièce enregistrée." };
}

export async function toggleProductFlagAction(formData: FormData) {
  await guard();

  const id = formData.get("productId");
  const flag = formData.get("flag");

  if (typeof id !== "string" || (flag !== "active" && flag !== "featured")) return;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { active: true, featured: true, slug: true },
  });

  if (!product) return;

  await prisma.product.update({
    where: { id },
    data: { [flag]: !product[flag] },
  });

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  revalidatePath("/");
  revalidatePath(`/produit/${product.slug}`);
}

export async function addProductImageAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await guard();

  const productId = formData.get("productId");
  const rawUrl = formData.get("url");

  if (typeof productId !== "string" || typeof rawUrl !== "string") {
    return { errors: { form: "Requête invalide." } };
  }

  const url = rawUrl.trim();

  // Seules les URL https sont acceptées : un lien http ou javascript: dans une
  // balise <img> exposerait le site à du contenu mixte ou à une injection.
  if (!/^https:\/\/\S+$/i.test(url)) {
    return { errors: { url: "L'adresse doit commencer par https://" } };
  }

  const count = await prisma.productImage.count({ where: { productId } });

  await prisma.productImage.create({
    data: {
      productId,
      url,
      alt: (formData.get("alt") as string)?.slice(0, 160) || null,
      position: count,
    },
  });

  revalidatePath("/admin/produits");
  return { success: true, message: "Visuel ajouté." };
}

export async function deleteProductImageAction(formData: FormData) {
  await guard();

  const imageId = formData.get("imageId");
  if (typeof imageId !== "string") return;

  await prisma.productImage.delete({ where: { id: imageId } }).catch(() => null);
  revalidatePath("/admin/produits");
}

const variantSchema = z.object({
  id: z.string().min(1),
  price: z.coerce.number().int().min(0).max(1_000_000),
  available: z.boolean(),
});

export async function updateVariantAction(formData: FormData) {
  await guard();

  const parsed = variantSchema.safeParse({
    id: formData.get("variantId"),
    price: Math.round(Number(formData.get("price") ?? 0) * 100),
    available: formData.get("available") === "on",
  });

  if (!parsed.success) return;

  await prisma.variant.update({
    where: { id: parsed.data.id },
    data: { price: parsed.data.price, available: parsed.data.available },
  });

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
}

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "IN_PRODUCTION",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
  "REFUNDED",
] as const;

export async function updateOrderAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await guard();

  const schema = z.object({
    orderId: z.string().min(1),
    status: z.enum(ORDER_STATUSES),
    trackingNumber: z.string().trim().max(120).optional().or(z.literal("")),
    trackingUrl: z
      .string()
      .trim()
      .max(500)
      .refine((value) => !value || /^https:\/\//i.test(value), {
        message: "Le lien de suivi doit commencer par https://",
      })
      .optional()
      .or(z.literal("")),
  });

  const parsed = schema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    trackingNumber: formData.get("trackingNumber") ?? "",
    trackingUrl: formData.get("trackingUrl") ?? "",
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const now = new Date();

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: {
      status: parsed.data.status,
      trackingNumber: parsed.data.trackingNumber || null,
      trackingUrl: parsed.data.trackingUrl || null,
      // Les horodatages sont posés au premier passage dans l'état, jamais
      // écrasés par une correction ultérieure.
      ...(parsed.data.status === "SHIPPED" ? { shippedAt: now } : {}),
      ...(parsed.data.status === "DELIVERED" ? { deliveredAt: now } : {}),
      ...(parsed.data.status === "CANCELED" ? { canceledAt: now } : {}),
    },
  });

  revalidatePath("/admin/commandes");
  return { success: true, message: "Commande mise à jour." };
}

export async function pushOrderToPrintifyAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await guard();

  const orderId = formData.get("orderId");
  if (typeof orderId !== "string") return { errors: { form: "Requête invalide." } };

  if (!printifyEnabled()) {
    return { errors: { form: "PRINTIFY_API_KEY n'est pas configurée." } };
  }

  try {
    const podOrderId = await createPrintifyOrder(orderId);
    revalidatePath("/admin/commandes");
    return { success: true, message: `Commande transmise à Printify (#${podOrderId}).` };
  } catch (error) {
    return {
      errors: {
        form: error instanceof Error ? error.message : "Envoi impossible.",
      },
    };
  }
}

export async function moderateReviewAction(formData: FormData) {
  await guard();

  const reviewId = formData.get("reviewId");
  const decision = formData.get("decision");

  if (typeof reviewId !== "string") return;
  if (decision !== "APPROVED" && decision !== "REJECTED" && decision !== "PENDING") return;

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: decision },
  });

  revalidatePath("/admin/avis");
  revalidatePath("/avis");
  revalidatePath("/");
}

export async function replyToReviewAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await guard();

  const reviewId = formData.get("reviewId");
  const reply = formData.get("reply");

  if (typeof reviewId !== "string" || typeof reply !== "string") {
    return { errors: { form: "Requête invalide." } };
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { reply: reply.trim().slice(0, 2000) || null },
  });

  revalidatePath("/admin/avis");
  revalidatePath("/avis");

  return { success: true, message: "Réponse enregistrée." };
}

export async function syncPrintifyAction(
  _prev: FormState,
  _formData: FormData,
): Promise<FormState> {
  await guard();

  if (!printifyEnabled()) {
    return {
      errors: {
        form: "PRINTIFY_API_KEY n'est pas configurée. Ajoutez-la dans les variables d'environnement.",
      },
    };
  }

  try {
    const report = await syncPrintifyCatalog();

    revalidatePath("/admin/produits");
    revalidatePath("/boutique");
    revalidatePath("/");

    const details = [
      `${report.created} pièce(s) créée(s)`,
      `${report.updated} mise(s) à jour`,
      `${report.variants} variante(s)`,
    ].join(", ");

    return {
      success: true,
      message:
        report.skipped.length > 0
          ? `${details}. Ignorées : ${report.skipped.join(" ; ")}`
          : `${details}. Les nouvelles pièces sont hors ligne : rédigez leur fiche puis publiez-les.`,
    };
  } catch (error) {
    return {
      errors: {
        form: error instanceof Error ? error.message : "Synchronisation impossible.",
      },
    };
  }
}

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "3 caractères minimum.")
    .max(40)
    .regex(/^[A-Z0-9-]+$/, "Lettres majuscules, chiffres et tirets uniquement."),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().int().min(1),
  minSubtotal: z.coerce.number().int().min(0),
  maxUses: z.coerce.number().int().min(0).optional(),
  expiresAt: z.string().optional().or(z.literal("")),
});

export async function createCouponAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await guard();

  const type = formData.get("type") === "FIXED" ? "FIXED" : "PERCENT";
  const rawValue = Number(formData.get("value") ?? 0);

  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    type,
    // Un pourcentage reste tel quel, un montant fixe passe en centimes.
    value: type === "PERCENT" ? Math.round(rawValue) : Math.round(rawValue * 100),
    minSubtotal: Math.round(Number(formData.get("minSubtotal") ?? 0) * 100),
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : undefined,
    expiresAt: formData.get("expiresAt") ?? "",
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  if (parsed.data.type === "PERCENT" && parsed.data.value > 100) {
    return { errors: { value: "Un pourcentage ne peut pas dépasser 100." } };
  }

  const existing = await prisma.coupon.findUnique({
    where: { code: parsed.data.code },
    select: { id: true },
  });

  if (existing) {
    return { errors: { code: "Ce code existe déjà." } };
  }

  await prisma.coupon.create({
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      minSubtotal: parsed.data.minSubtotal,
      maxUses: parsed.data.maxUses || null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  revalidatePath("/admin/codes-promo");
  return { success: true, message: `Code ${parsed.data.code} créé.` };
}

export async function toggleCouponAction(formData: FormData) {
  await guard();

  const couponId = formData.get("couponId");
  if (typeof couponId !== "string") return;

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
    select: { active: true },
  });

  if (!coupon) return;

  await prisma.coupon.update({
    where: { id: couponId },
    data: { active: !coupon.active },
  });

  revalidatePath("/admin/codes-promo");
}

export async function markMessageHandledAction(formData: FormData) {
  await guard();

  const messageId = formData.get("messageId");
  if (typeof messageId !== "string") return;

  const message = await prisma.contactMessage.findUnique({
    where: { id: messageId },
    select: { handled: true },
  });

  if (!message) return;

  await prisma.contactMessage.update({
    where: { id: messageId },
    data: { handled: !message.handled },
  });

  revalidatePath("/admin/messages");
}

const categorySchema = z.object({
  name: z.string().trim().min(1, "Nom requis.").max(80),
  slug: z
    .string()
    .trim()
    .min(1, "Slug requis.")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Uniquement des minuscules, chiffres et tirets."),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function createCategoryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await guard();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    tagline: formData.get("tagline") ?? "",
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const existing = await prisma.category.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  });

  if (existing) {
    return { errors: { slug: "Ce rayon existe déjà." } };
  }

  const count = await prisma.category.count();

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      tagline: parsed.data.tagline || null,
      position: count,
    },
  });

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");

  return { success: true, message: `Rayon ${parsed.data.name} créé.` };
}
