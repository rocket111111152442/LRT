/**
 * Intégration Printful (API v1, https://api.printful.com).
 *
 * Deux usages :
 *  1. Synchroniser le catalogue Printful vers la base (produits, variantes,
 *     visuels) — déclenché depuis l'admin ou par `npm run printful:sync`.
 *  2. Envoyer la commande en production après confirmation du paiement Stripe.
 *
 * Authentification : jeton privé créé dans Printful > Paramètres > Développeurs,
 * transmis en `Authorization: Bearer`. Si le compte gère plusieurs boutiques,
 * `PRINTFUL_STORE_ID` cible celle à utiliser.
 */

import { prisma } from "@/lib/prisma";
import { parseDecimalToCents } from "@/lib/money";

const PRINTFUL_API = "https://api.printful.com";

export function printfulEnabled() {
  return Boolean(process.env.PRINTFUL_API_KEY);
}

type PrintfulResponse<T> = {
  code: number;
  result: T;
  error?: { reason: string; message: string };
  paging?: { total: number; offset: number; limit: number };
};

async function printfulRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<PrintfulResponse<T>> {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    throw new Error(
      "PRINTFUL_API_KEY manquante : impossible de contacter Printful.",
    );
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("Content-Type", "application/json");

  if (process.env.PRINTFUL_STORE_ID) {
    headers.set("X-PF-Store-Id", process.env.PRINTFUL_STORE_ID);
  }

  const response = await fetch(`${PRINTFUL_API}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | PrintfulResponse<T>
    | null;

  if (!response.ok || !payload) {
    const reason =
      payload?.error?.message ?? payload?.error?.reason ?? response.statusText;
    throw new Error(`Printful (${response.status}) : ${reason}`);
  }

  return payload;
}

type SyncProductSummary = {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  thumbnail_url: string;
};

type SyncVariant = {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  retail_price: string | null;
  currency: string | null;
  sku: string | null;
  availability_status?: string;
  is_ignored?: boolean;
  product?: { variant_id: number; product_id: number; image: string; name: string };
  files?: Array<{ type: string; preview_url?: string; url?: string }>;
};

type SyncProductDetail = {
  sync_product: SyncProductSummary & { is_ignored?: boolean };
  sync_variants: SyncVariant[];
};

export async function listPrintfulProducts() {
  const products: SyncProductSummary[] = [];
  let offset = 0;
  const limit = 100;

  // L'API pagine par 100 : on boucle jusqu'à avoir tout récupéré.
  for (;;) {
    const page = await printfulRequest<SyncProductSummary[]>(
      `/store/products?offset=${offset}&limit=${limit}`,
    );
    products.push(...page.result);

    const total = page.paging?.total ?? page.result.length;
    offset += limit;
    if (products.length >= total || page.result.length === 0) break;
  }

  return products;
}

export async function getPrintfulProduct(id: number) {
  const response = await printfulRequest<SyncProductDetail>(`/store/products/${id}`);
  return response.result;
}

const COLOR_HEX: Record<string, string> = {
  black: "#111111",
  white: "#F5F5F0",
  "off white": "#EDEAE3",
  cream: "#E8E2D5",
  grey: "#8A8A8A",
  gray: "#8A8A8A",
  "dark grey": "#4A4A4A",
  "heather grey": "#9B9B9B",
  charcoal: "#36454F",
  navy: "#1B2432",
  beige: "#D8CFC0",
  khaki: "#8F8B6D",
  sand: "#D6C9B4",
  stone: "#C4BDB1",
};

function colorToHex(color: string | null) {
  if (!color) return null;
  return COLOR_HEX[color.trim().toLowerCase()] ?? null;
}

/**
 * Printful ne renvoie pas la couleur et la taille dans des champs séparés :
 * elles sont concaténées dans le nom (« Casquette DRIP - Black / One size »).
 * On extrait ce qui suit le dernier tiret, puis on coupe sur « / ».
 */
export function parseVariantName(variantName: string, productName: string) {
  let rest = variantName;

  if (variantName.startsWith(productName)) {
    rest = variantName.slice(productName.length);
  }

  rest = rest.replace(/^\s*[-–—]\s*/, "").trim();

  if (!rest) {
    const match = variantName.match(/\(([^)]+)\)\s*$/);
    rest = match ? match[1] : "";
  }

  const parts = rest
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { label: "Taille unique", color: null, size: null };
  }

  if (parts.length === 1) {
    // Une seule valeur : on devine s'il s'agit d'une taille ou d'une couleur.
    const value = parts[0];
    const looksLikeSize = /^(one size|taille unique|xxs|xs|s|m|l|xl|2xl|3xl|4xl|\d+(\.\d+)?("|cm)?)$/i.test(
      value,
    );
    return {
      label: value,
      color: looksLikeSize ? null : value,
      size: looksLikeSize ? value : null,
    };
  }

  return { label: parts.join(" / "), color: parts[0], size: parts[1] };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function uniqueSlug(base: string, printfulProductId: string) {
  const root = base || "produit";
  let candidate = root;
  let suffix = 2;

  for (;;) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { printfulProductId: true },
    });

    if (!existing || existing.printfulProductId === printfulProductId) {
      return candidate;
    }

    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
}

export type SyncReport = {
  created: number;
  updated: number;
  variants: number;
  skipped: string[];
};

/**
 * Importe (ou met à jour) le catalogue Printful dans la base locale.
 * Les produits déjà connus gardent leur slug, leur description rédigée à la
 * main et leur mise en avant : seuls le prix, les variantes et les visuels sont
 * rafraîchis. Les produits retirés de Printful sont désactivés, jamais
 * supprimés, pour ne pas casser l'historique des commandes.
 */
export async function syncPrintfulCatalog(): Promise<SyncReport> {
  const report: SyncReport = { created: 0, updated: 0, variants: 0, skipped: [] };
  const summaries = await listPrintfulProducts();
  const seenIds: string[] = [];

  for (const summary of summaries) {
    let detail: SyncProductDetail;

    try {
      detail = await getPrintfulProduct(summary.id);
    } catch (error) {
      report.skipped.push(
        `${summary.name} : ${error instanceof Error ? error.message : "erreur inconnue"}`,
      );
      continue;
    }

    const printfulProductId = String(detail.sync_product.id);
    const variants = (detail.sync_variants ?? []).filter(
      (variant) => !variant.is_ignored,
    );

    if (variants.length === 0) {
      report.skipped.push(`${summary.name} : aucune variante synchronisée`);
      continue;
    }

    seenIds.push(printfulProductId);

    const prices = variants.map((variant) => parseDecimalToCents(variant.retail_price));
    const basePrice = Math.min(...prices.filter((price) => price > 0)) || 0;

    const existing = await prisma.product.findUnique({
      where: { printfulProductId },
    });

    const slug =
      existing?.slug ?? (await uniqueSlug(slugify(detail.sync_product.name), printfulProductId));

    const product = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: { name: detail.sync_product.name, basePrice, active: true },
        })
      : await prisma.product.create({
          data: {
            slug,
            name: detail.sync_product.name,
            description:
              "Description à compléter depuis l'administration DRIP.",
            basePrice,
            printfulProductId,
            active: false, // un nouveau produit reste hors ligne tant qu'il n'est pas rédigé
          },
        });

    if (existing) report.updated += 1;
    else report.created += 1;

    const keptVariantIds: string[] = [];

    for (const [index, variant] of variants.entries()) {
      const parsed = parseVariantName(variant.name, detail.sync_product.name);
      const preview =
        variant.files?.find((file) => file.type === "preview")?.preview_url ??
        variant.product?.image ??
        null;

      const data = {
        productId: product.id,
        name: parsed.label,
        color: parsed.color,
        colorHex: colorToHex(parsed.color),
        size: parsed.size,
        sku: variant.sku ?? null,
        price: parseDecimalToCents(variant.retail_price),
        available: (variant.availability_status ?? "active") === "active",
        position: index,
        imageUrl: preview,
      };

      const saved = await prisma.variant.upsert({
        where: { printfulVariantId: String(variant.id) },
        create: { ...data, printfulVariantId: String(variant.id) },
        update: data,
      });

      keptVariantIds.push(saved.id);
      report.variants += 1;
    }

    // Les variantes disparues de Printful sont retirées de la vente mais
    // conservées : des commandes passées y font référence.
    await prisma.variant.updateMany({
      where: { productId: product.id, id: { notIn: keptVariantIds } },
      data: { available: false },
    });

    const gallery = Array.from(
      new Set(
        variants
          .map(
            (variant) =>
              variant.files?.find((file) => file.type === "preview")?.preview_url ??
              variant.product?.image,
          )
          .filter((url): url is string => Boolean(url)),
      ),
    ).slice(0, 8);

    if (gallery.length > 0) {
      const current = await prisma.productImage.findMany({
        where: { productId: product.id },
        select: { url: true },
      });
      const currentUrls = new Set(current.map((image) => image.url));

      // On n'écrase pas les visuels ajoutés à la main dans l'admin : on ajoute
      // seulement les mockups Printful encore absents.
      const missing = gallery.filter((url) => !currentUrls.has(url));

      if (missing.length > 0) {
        await prisma.productImage.createMany({
          data: missing.map((url, index) => ({
            productId: product.id,
            url,
            alt: product.name,
            position: current.length + index,
          })),
        });
      }
    }
  }

  if (seenIds.length > 0) {
    await prisma.product.updateMany({
      where: { printfulProductId: { notIn: seenIds, not: null } },
      data: { active: false },
    });
  }

  return report;
}

type PrintfulOrderResult = { id: number; external_id: string; status: string };

/**
 * Transmet une commande payée à Printful. `confirm=true` lance directement la
 * production ; laisser `PRINTFUL_AUTO_CONFIRM=false` permet de valider les
 * commandes à la main dans Printful pendant le lancement de la marque.
 */
export async function createPrintfulOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new Error("Commande introuvable.");
  if (order.printfulOrderId) return order.printfulOrderId;

  const items = order.items
    .filter((item) => item.printfulVariantId)
    .map((item) => ({
      sync_variant_id: Number(item.printfulVariantId),
      quantity: item.quantity,
      retail_price: (item.unitPrice / 100).toFixed(2),
    }));

  if (items.length === 0) {
    throw new Error(
      "Aucun article de cette commande n'est relié à une variante Printful.",
    );
  }

  const confirm = process.env.PRINTFUL_AUTO_CONFIRM !== "false";

  const response = await printfulRequest<PrintfulOrderResult>(
    `/orders?confirm=${confirm ? "true" : "false"}`,
    {
      method: "POST",
      body: JSON.stringify({
        external_id: order.number,
        recipient: {
          name: order.shippingName ?? "",
          address1: order.shippingLine1 ?? "",
          address2: order.shippingLine2 ?? undefined,
          city: order.shippingCity ?? "",
          zip: order.shippingPostalCode ?? "",
          country_code: order.shippingCountry ?? "FR",
          email: order.email,
          phone: order.shippingPhone ?? undefined,
        },
        items,
        retail_costs: {
          currency: order.currency,
          subtotal: (order.subtotal / 100).toFixed(2),
          discount: (order.discount / 100).toFixed(2),
          shipping: (order.shipping / 100).toFixed(2),
          total: (order.total / 100).toFixed(2),
        },
      }),
    },
  );

  const printfulOrderId = String(response.result.id);

  await prisma.order.update({
    where: { id: order.id },
    data: { printfulOrderId, status: "IN_PRODUCTION" },
  });

  return printfulOrderId;
}
