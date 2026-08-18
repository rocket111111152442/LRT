/**
 * Intégration Printify (API v1, https://api.printify.com/v1).
 *
 * Deux usages :
 *  1. Importer le catalogue Printify dans la base (produits, variantes,
 *     visuels) — depuis l'administration ou `npm run printify:sync`.
 *  2. Envoyer la commande en production dès que Stripe confirme le paiement.
 *
 * Sur l'argent : Printify ne prélève rien sur l'encaissement Stripe. Le client
 * paie 100 % sur le compte Stripe de la boutique, puis Printify facture à part
 * la fabrication et le port sur le moyen de paiement enregistré dans le compte
 * Printify. La marge est la différence entre `price` (prix de vente) et `cost`
 * (coût de fabrication), deux champs que l'API renvoie pour chaque variante.
 *
 * Authentification : jeton créé dans Printify > My profile > Connections,
 * transmis en `Authorization: Bearer`. `PRINTIFY_SHOP_ID` désigne la boutique
 * à utiliser ; sans lui, la première boutique du compte est retenue.
 */

import { prisma } from "@/lib/prisma";
import { PRINTIFY_SHOP_KEY, readSetting } from "@/lib/settings";

// Surchargeable pour les tests ; en production, l'API publique de Printify.
const PRINTIFY_API = process.env.PRINTIFY_API_URL ?? "https://api.printify.com/v1";

export function printifyEnabled() {
  return Boolean(process.env.PRINTIFY_API_KEY);
}

async function printifyRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const apiKey = process.env.PRINTIFY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "PRINTIFY_API_KEY manquante : impossible de contacter Printify.",
    );
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("Content-Type", "application/json");
  // Printify demande un User-Agent identifiable sur chaque appel.
  headers.set("User-Agent", "NATURAL BRUTAL (boutique)");

  const response = await fetch(`${PRINTIFY_API}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const reason =
      (payload as { message?: string; error?: string } | null)?.message ??
      (payload as { error?: string } | null)?.error ??
      response.statusText;
    throw new Error(`Printify (${response.status}) : ${reason}`);
  }

  return payload as T;
}

type PrintifyShop = { id: number; title: string; sales_channel: string };

export async function listPrintifyShops() {
  return printifyRequest<PrintifyShop[]>("/shops.json");
}

/**
 * Identifiant de la boutique à utiliser, par ordre de priorité :
 *
 *  1. `PRINTIFY_SHOP_ID`, si l'exploitant tient à le figer sur l'hébergeur ;
 *  2. le choix fait dans l'administration, rangé en base ;
 *  3. à défaut, la première boutique du compte — un choix arbitraire, signalé
 *     comme tel dans le rapport de synchronisation.
 */
export async function resolveShopId() {
  const configured = process.env.PRINTIFY_SHOP_ID;
  if (configured) return configured;

  const choisie = await readSetting(PRINTIFY_SHOP_KEY);
  if (choisie) return choisie;

  const shops = await listPrintifyShops();

  if (shops.length === 0) {
    throw new Error(
      "Aucune boutique dans ce compte Printify. Créez-en une depuis Printify.",
    );
  }

  return String(shops[0].id);
}

type PrintifyOptionValue = { id: number; title: string; colors?: string[] };
type PrintifyOption = {
  name: string;
  type: string; // "size", "color", "depth"…
  values: PrintifyOptionValue[];
};

type PrintifyVariant = {
  id: number;
  sku: string | null;
  cost: number; // centimes facturés par Printify
  price: number; // centimes demandés au client
  title: string;
  grams?: number;
  is_enabled: boolean;
  is_default?: boolean;
  is_available: boolean;
  options: number[]; // renvoie vers PrintifyOptionValue.id
};

type PrintifyImage = {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
};

export type PrintifyProduct = {
  id: string;
  title: string;
  description: string | null;
  options: PrintifyOption[];
  variants: PrintifyVariant[];
  images: PrintifyImage[];
  visible?: boolean;
};

type Paginated<T> = { current_page: number; data: T[]; last_page: number };

export async function listPrintifyProducts() {
  const shops = await listPrintifyShops();
  const designee =
    process.env.PRINTIFY_SHOP_ID ?? (await readSetting(PRINTIFY_SHOP_KEY)) ?? null;
  const shopId = designee ?? (await resolveShopId());
  const shop = shops.find((candidate) => String(candidate.id) === String(shopId));

  const products: PrintifyProduct[] = [];
  let page = 1;

  // L'API pagine ; on suit `last_page` plutôt que de deviner.
  for (;;) {
    const response = await printifyRequest<Paginated<PrintifyProduct>>(
      `/shops/${shopId}/products.json?page=${page}&limit=50`,
    );

    products.push(...response.data);

    if (page >= response.last_page || response.data.length === 0) break;
    page += 1;
  }

  return {
    products,
    shopId,
    shopName: shop?.title ?? `boutique ${shopId}`,
    shopCount: shops.length,
    shopChoisieAutomatiquement: !designee && shops.length > 1,
  };
}

/**
 * Printify structure ses options : chaque variante référence des identifiants
 * de valeurs, regroupées par type (« color », « size »…). Contrairement à
 * d'autres plateformes, il n'y a donc rien à deviner dans le nom de la
 * variante — cette table de correspondance suffit.
 */
function buildOptionIndex(options: PrintifyOption[]) {
  const index = new Map<number, { type: string; title: string; hex: string | null }>();

  for (const option of options) {
    for (const value of option.values) {
      index.set(value.id, {
        type: option.type.toLowerCase(),
        title: value.title,
        hex: value.colors?.[0] ?? null,
      });
    }
  }

  return index;
}

function describeVariant(
  variant: PrintifyVariant,
  index: ReturnType<typeof buildOptionIndex>,
) {
  let color: string | null = null;
  let colorHex: string | null = null;
  let size: string | null = null;
  const others: string[] = [];

  for (const optionId of variant.options) {
    const value = index.get(optionId);
    if (!value) continue;

    if (value.type === "color") {
      color = value.title;
      colorHex = value.hex;
    } else if (value.type === "size") {
      size = value.title;
    } else {
      others.push(value.title);
    }
  }

  const label =
    [color, size, ...others].filter(Boolean).join(" / ") ||
    variant.title ||
    "Taille unique";

  return { label, color, colorHex, size };
}

/** La description Printify arrive en HTML : on la ramène à du texte lisible. */
function htmlToText(html: string | null) {
  if (!html) return "";

  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

async function uniqueSlug(base: string, podProductId: string) {
  const root = base || "produit";
  let candidate = root;
  let suffix = 2;

  for (;;) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { podProductId: true },
    });

    if (!existing || existing.podProductId === podProductId) return candidate;

    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
}

export type SyncReport = {
  created: number;
  updated: number;
  variants: number;
  skipped: string[];
  /** Nombre de produits réellement renvoyés par l'API, avant tout filtrage. */
  remoteCount: number;
  shopName: string;
  shopId: string;
  shopCount: number;
  /** Vrai si le compte a plusieurs boutiques et qu'aucune n'a été désignée. */
  shopChoisieAutomatiquement: boolean;
};

/**
 * Importe (ou rafraîchit) le catalogue Printify.
 *
 * Un produit déjà connu garde son slug, sa description rédigée à la main, sa
 * mise en avant et ses visuels ajoutés depuis l'administration : seuls le prix,
 * les variantes et les mockups manquants sont mis à jour. Un produit retiré de
 * Printify est désactivé, jamais supprimé — des commandes le référencent.
 */
export async function syncPrintifyCatalog(): Promise<SyncReport> {
  const source = await listPrintifyProducts();
  const products = source.products;

  const report: SyncReport = {
    created: 0,
    updated: 0,
    variants: 0,
    skipped: [],
    remoteCount: products.length,
    shopName: source.shopName,
    shopId: source.shopId,
    shopCount: source.shopCount,
    shopChoisieAutomatiquement: source.shopChoisieAutomatiquement,
  };

  const seenIds: string[] = [];

  for (const remote of products) {
    const podProductId = String(remote.id);

    // Une variante desactivee dans Printify ne peut pas etre commandee.
    const variants = (remote.variants ?? []).filter((variant) => variant.is_enabled);

    if (variants.length === 0) {
      report.skipped.push(`${remote.title} : aucune variante activée`);
      continue;
    }

    seenIds.push(podProductId);

    const index = buildOptionIndex(remote.options ?? []);
    const prices = variants.map((variant) => variant.price).filter((price) => price > 0);
    const basePrice = prices.length > 0 ? Math.min(...prices) : 0;

    const existing = await prisma.product.findUnique({ where: { podProductId } });
    const slug =
      existing?.slug ?? (await uniqueSlug(slugify(remote.title), podProductId));

    const product = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          // `active` n'est pas touché : remettre en ligne une pièce que la
          // boutique a volontairement retirée serait une mauvaise surprise.
          data: { name: remote.title, basePrice },
        })
      : await prisma.product.create({
          data: {
            slug,
            name: remote.title,
            description:
              htmlToText(remote.description) ||
              "Description à compléter depuis l'administration NATURAL BRUTAL.",
            basePrice,
            podProductId,
            // Un nouveau produit reste hors ligne : il faut relire le texte et
            // choisir les visuels avant de le montrer.
            active: false,
          },
        });

    if (existing) report.updated += 1;
    else report.created += 1;

    const keptVariantIds: string[] = [];

    for (const [position, variant] of variants.entries()) {
      const described = describeVariant(variant, index);
      const mockup =
        remote.images?.find((image) => image.variant_ids.includes(variant.id))?.src ??
        remote.images?.find((image) => image.is_default)?.src ??
        null;

      const data = {
        productId: product.id,
        name: described.label,
        color: described.color,
        colorHex: described.colorHex,
        size: described.size,
        sku: variant.sku || null,
        price: variant.price,
        available: variant.is_available,
        position,
        imageUrl: mockup,
      };

      const saved = await prisma.variant.upsert({
        where: { podVariantId: String(variant.id) },
        create: { ...data, podVariantId: String(variant.id) },
        update: data,
      });

      keptVariantIds.push(saved.id);
      report.variants += 1;
    }

    await prisma.variant.updateMany({
      where: { productId: product.id, id: { notIn: keptVariantIds } },
      data: { available: false },
    });

    // Galerie : les mockups par défaut d'abord, puis les autres angles.
    const gallery = Array.from(
      new Set(
        [...(remote.images ?? [])]
          .sort((a, b) => Number(b.is_default) - Number(a.is_default))
          .map((image) => image.src),
      ),
    ).slice(0, 8);

    if (gallery.length > 0) {
      const current = await prisma.productImage.findMany({
        where: { productId: product.id },
        select: { url: true },
      });
      const currentUrls = new Set(current.map((image) => image.url));
      const missing = gallery.filter((url) => !currentUrls.has(url));

      if (missing.length > 0) {
        await prisma.productImage.createMany({
          data: missing.map((url, offset) => ({
            productId: product.id,
            url,
            alt: product.name,
            position: current.length + offset,
          })),
        });
      }
    }
  }

  if (seenIds.length > 0) {
    await prisma.product.updateMany({
      where: { podProductId: { notIn: seenIds, not: null } },
      data: { active: false },
    });
  }

  return report;
}

type PrintifyOrderCreated = { id: string };

/**
 * Découpe le nom du destinataire. Printify veut un prénom et un nom séparés,
 * là où Stripe ne renvoie qu'une seule chaîne.
 */
function splitName(fullName: string | null) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return { first: "Client", last: "-" };
  if (parts.length === 1) return { first: parts[0], last: "-" };

  return { first: parts[0], last: parts.slice(1).join(" ") };
}

/**
 * Transmet une commande payée à Printify, puis la lance en production.
 *
 * `PRINTIFY_AUTO_PRODUCTION=false` permet de garder la main pendant le
 * lancement : la commande arrive dans Printify mais attend une validation
 * manuelle. Par défaut, tout part directement en fabrication.
 */
export async function createPrintifyOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new Error("Commande introuvable.");
  if (order.podOrderId) return order.podOrderId; // déjà transmise

  const shopId = await resolveShopId();

  const lineItems = order.items
    .filter((item) => item.podVariantId)
    .map((item) => ({
      product_id: item.podProductId,
      variant_id: Number(item.podVariantId),
      quantity: item.quantity,
    }))
    .filter((item) => item.product_id);

  if (lineItems.length === 0) {
    throw new Error(
      "Aucun article de cette commande n'est relié à une variante Printify.",
    );
  }

  const { first, last } = splitName(order.shippingName);

  const created = await printifyRequest<PrintifyOrderCreated>(
    `/shops/${shopId}/orders.json`,
    {
      method: "POST",
      body: JSON.stringify({
        external_id: order.number,
        label: order.number,
        line_items: lineItems,
        shipping_method: 1, // 1 = standard
        is_printify_express: false,
        // Printify n'écrit pas au client : la boutique reste le seul
        // interlocuteur, avec ses propres e-mails.
        send_shipping_notification: false,
        address_to: {
          first_name: first,
          last_name: last,
          email: order.email,
          phone: order.shippingPhone ?? "",
          country: order.shippingCountry ?? "FR",
          region: "",
          address1: order.shippingLine1 ?? "",
          address2: order.shippingLine2 ?? "",
          city: order.shippingCity ?? "",
          zip: order.shippingPostalCode ?? "",
        },
      }),
    },
  );

  const podOrderId = String(created.id);

  await prisma.order.update({
    where: { id: order.id },
    data: { podOrderId, status: "IN_PRODUCTION" },
  });

  if (process.env.PRINTIFY_AUTO_PRODUCTION !== "false") {
    // Étape distincte chez Printify : créer la commande ne la lance pas.
    // Un échec ici n'annule pas la commande — elle attend simplement dans
    // Printify et reste lançable à la main depuis l'administration.
    try {
      await printifyRequest(
        `/shops/${shopId}/orders/${podOrderId}/send_to_production.json`,
        { method: "POST" },
      );
    } catch (error) {
      console.error(
        `[printify] commande ${order.number} créée (${podOrderId}) mais non lancée en production :`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return podOrderId;
}
