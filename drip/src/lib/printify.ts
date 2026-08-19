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
import {
  PRINTIFY_SHOP_KEY,
  PRINTIFY_WEBHOOK_KEY,
  readSetting,
  writeSetting,
} from "@/lib/settings";
import { htmlToText, looksEncoded } from "@/lib/html";
import {
  deduirePublic,
  traduireCouleur,
  traduireNomProduit,
  traduireTaille,
} from "@/lib/traduction";

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
    // Printify répond « Operation failed. » sur à peu près tout ; le motif
    // réel se trouve dans `errors`. Le taire condamnait à deviner.
    const corps = payload as {
      message?: string;
      error?: string;
      errors?: unknown;
    } | null;

    const detail =
      corps?.errors && typeof corps.errors === "object"
        ? Object.values(corps.errors as Record<string, unknown>)
            .flatMap((valeur) => (Array.isArray(valeur) ? valeur : [valeur]))
            .filter((valeur) => typeof valeur === "string")
            .join(" ")
        : "";

    const reason = [corps?.message ?? corps?.error ?? response.statusText, detail]
      .filter(Boolean)
      .join(" — ");

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

  // Les libellés Printify sont anglais : on les francise à l'import, pour que
  // la fiche produit ne mélange pas les deux langues.
  const couleurFr = traduireCouleur(color);
  const tailleFr = traduireTaille(size);

  const label =
    [couleurFr, tailleFr, ...others].filter(Boolean).join(" / ") ||
    variant.title ||
    "Taille unique";

  return { label, color: couleurFr, colorHex, size: tailleFr };
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

/**
 * Garde-fou : au-delà, ce n'est plus une fiche produit.
 *
 * Printify produit un mockup par coloris et par angle. Toutes les images sont
 * reprises — la boutique retire ensuite celles qu'elle ne veut pas, et son
 * choix tient — mais un plafond très haut protège d'une fiche aberrante.
 */
const MAX_VISUELS = 100;

/** Visuels Printify que la boutique a retirés à la main, par produit. */
export function cleVisuelsRetires(productId: string) {
  return `printify.visuelsRetires.${productId}`;
}

async function lireVisuelsRetires(productId: string) {
  const brut = await readSetting(cleVisuelsRetires(productId));
  if (!brut) return new Set<string>();

  try {
    const liste = JSON.parse(brut);
    return new Set<string>(Array.isArray(liste) ? liste : []);
  } catch {
    return new Set<string>();
  }
}

/**
 * Note qu'un visuel Printify a été retiré à la main.
 *
 * Sans cette mémoire, la synchronisation suivante le remettrait : on
 * supprimerait la même image indéfiniment.
 */
export async function memoriserVisuelRetire(productId: string, url: string) {
  if (!estMockupPrintify(url)) return;

  const retires = await lireVisuelsRetires(productId);
  retires.add(url);

  await writeSetting(
    cleVisuelsRetires(productId),
    JSON.stringify([...retires].slice(-MAX_VISUELS * 2)),
  );
}

/** Cette image vient-elle de Printify, ou la boutique l'a-t-elle ajoutée ? */
function estMockupPrintify(url: string) {
  try {
    return new URL(url).hostname.endsWith("printify.com");
  } catch {
    return false;
  }
}

/**
 * Aligne la galerie sur ce que Printify renvoie aujourd'hui.
 *
 * L'ancienne version se contentait d'ajouter les visuels absents. Changer un
 * design ne remplaçait donc rien : les mockups de l'ancien dessin restaient en
 * tête de galerie et les nouveaux s'entassaient derrière. La fiche montrait les
 * deux designs à la fois, l'ancien en premier.
 *
 * Les visuels ajoutés à la main depuis l'administration ne sont pas concernés :
 * ils gardent leur place, devant, et la synchronisation n'y touche pas.
 */
async function synchroniserGalerie(
  productId: string,
  productName: string,
  demandees: string[],
) {
  // Un visuel retiré à la main ne revient pas : la boutique choisit ce
  // qu'elle montre, la synchronisation ne le lui reprend pas.
  const retires = await lireVisuelsRetires(productId);
  const gallery = demandees.filter((url) => !retires.has(url));

  const existantes = await prisma.productImage.findMany({
    where: { productId },
    orderBy: { position: "asc" },
    select: { id: true, url: true },
  });

  const attendues = new Set(gallery);

  // Un mockup que Printify ne renvoie plus appartient à un design retiré.
  const perimees = existantes.filter(
    (image) => estMockupPrintify(image.url) && !attendues.has(image.url),
  );

  if (perimees.length > 0) {
    await prisma.productImage.deleteMany({
      where: { id: { in: perimees.map((image) => image.id) } },
    });
  }

  const conservees = existantes.filter((image) => !perimees.includes(image));
  const maison = conservees.filter((image) => !estMockupPrintify(image.url));
  const dejaLa = new Map(conservees.map((image) => [image.url, image.id]));

  // Ordre final : les visuels de la boutique d'abord, puis ceux de Printify
  // dans l'ordre où Printify les donne — le mockup principal en tête.
  const ordre = [...maison.map((image) => image.url), ...gallery];

  for (const [position, url] of ordre.entries()) {
    const id = dejaLa.get(url);

    if (id) {
      await prisma.productImage.update({ where: { id }, data: { position } });
      continue;
    }

    await prisma.productImage.create({
      data: { productId, url, alt: productName, position },
    });
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

    // Le titre Printify est anglais (« Unisex Heavy Blend Hooded Sweatshirt ») :
    // on le francise avant de l'enregistrer. Un titre déjà écrit en français
    // traverse la traduction sans changer.
    const titre = traduireNomProduit(remote.title);

    const existing = await prisma.product.findUnique({ where: { podProductId } });
    const slug = existing?.slug ?? (await uniqueSlug(slugify(titre), podProductId));

    const descriptionPrintify = htmlToText(remote.description);

    // La description suit Printify tant que personne ne l'a réécrite ici.
    //
    // `podDescription` garde le dernier texte reçu : si la description en base
    // lui est identique, elle vient de Printify et peut être remplacée sans
    // rien perdre. Dès que la boutique la modifie depuis l'administration, les
    // deux divergent et la synchronisation n'y touche plus.
    //
    // Deux cas s'y ajoutent : une fiche importée avant que ce témoin existe
    // (`podDescription` absent) et une description encore pleine d'entités HTML
    // — personne ne tape « &rsquo; » à la main, ces textes-là viennent
    // forcément de l'import.
    const descriptionReprise =
      existing !== null &&
      Boolean(descriptionPrintify) &&
      (existing.podDescription === null ||
        existing.description === existing.podDescription ||
        looksEncoded(existing.description));

    const product = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: titre,
            basePrice,
            // `active` n'est pas touché : remettre en ligne une pièce que la
            // boutique a volontairement retirée serait une mauvaise surprise.
            ...(descriptionPrintify ? { podDescription: descriptionPrintify } : {}),
            ...(descriptionReprise ? { description: descriptionPrintify } : {}),
          },
        })
      : await prisma.product.create({
          data: {
            slug,
            name: titre,
            description:
              descriptionPrintify ||
              "Description à compléter depuis l'administration NATURAL BRUTAL.",
            podDescription: descriptionPrintify || null,
            // Déduit du titre d'origine, et seulement à la création : le
            // classement fait à la main dans l'administration ne doit pas
            // sauter à la synchronisation suivante.
            audience: deduirePublic(remote.title),
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
    ).slice(0, MAX_VISUELS);

    await synchroniserGalerie(product.id, product.name, gallery);
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
        // Printify prévient le client dès que le colis part, avec son numéro
        // de suivi. Sans cela personne ne l'avertirait : la boutique n'envoie
        // aucun e-mail elle-même.
        send_shipping_notification: true,
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

/* --------------------------------------------------------------------------
 * Suivi des colis
 * ------------------------------------------------------------------------ */

/**
 * Printify prévient par webhook dès qu'un colis part. Sans cet abonnement, la
 * boutique ne saurait jamais qu'une commande a été expédiée : la fiche resterait
 * indéfiniment « en fabrication » et le client n'aurait aucun numéro de suivi à
 * consulter dans son compte.
 */
const WEBHOOK_TOPICS = [
  "order:shipment:created",
  "order:shipment:delivered",
] as const;

type PrintifyWebhook = {
  id: string;
  topic: string;
  url: string;
  secret?: string;
};

export function printifyWebhookUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/$/, "")}/api/printify/webhook`;
}

export async function listPrintifyWebhooks(shopId?: string) {
  const shop = shopId ?? (await resolveShopId());
  return printifyRequest<PrintifyWebhook[]>(`/shops/${shop}/webhooks.json`);
}

export type WebhookReport = {
  url: string;
  topics: string[];
  /** Sujets que Printify a refusés, avec son motif. */
  refuses: string[];
  remplaces: number;
  secretEnregistre: boolean;
};

/**
 * Abonne la boutique aux événements d'expédition et range le secret HMAC.
 *
 * L'opération est rejouable : les abonnements déjà posés sur la même adresse
 * sont retirés avant d'être recréés. C'est le seul moyen d'obtenir un secret
 * — Printify ne le renvoie qu'à la création.
 */
export async function ensurePrintifyWebhooks(baseUrl: string): Promise<WebhookReport> {
  const shopId = await resolveShopId();
  const url = printifyWebhookUrl(baseUrl);

  const existants = await listPrintifyWebhooks(shopId).catch(() => []);
  const aRemplacer = existants.filter((hook) => hook.url === url);

  for (const hook of aRemplacer) {
    // Un abonnement déjà disparu ne doit pas faire échouer la réinscription.
    await printifyRequest(`/shops/${shopId}/webhooks/${hook.id}.json`, {
      method: "DELETE",
    }).catch(() => undefined);
  }

  let secret: string | null = null;
  const poses: string[] = [];
  const refuses: string[] = [];

  // Chaque sujet est traité séparément : un sujet refusé — Printify en retire
  // parfois — ne doit pas emporter les autres avec lui.
  for (const topic of WEBHOOK_TOPICS) {
    try {
      const cree = await printifyRequest<PrintifyWebhook>(
        `/shops/${shopId}/webhooks.json`,
        { method: "POST", body: JSON.stringify({ topic, url }) },
      );

      poses.push(topic);
      if (cree.secret) secret = cree.secret;
    } catch (error) {
      refuses.push(
        `${topic} (${error instanceof Error ? error.message : "erreur inconnue"})`,
      );
    }
  }

  if (secret) await writeSetting(PRINTIFY_WEBHOOK_KEY, secret);

  if (poses.length === 0) {
    throw new Error(
      refuses.length > 0
        ? `Printify a refusé les abonnements : ${refuses.join(" ; ")}`
        : "Printify n'a créé aucun abonnement.",
    );
  }

  return {
    url,
    topics: poses,
    refuses,
    remplaces: aRemplacer.length,
    secretEnregistre: Boolean(secret),
  };
}

/** Le secret posé à la main sur l'hébergeur l'emporte sur celui rangé en base. */
export async function printifyWebhookSecret() {
  return (
    process.env.PRINTIFY_WEBHOOK_SECRET ||
    (await readSetting(PRINTIFY_WEBHOOK_KEY)) ||
    null
  );
}

type PrintifyEvent = {
  type?: string;
  resource?: {
    id?: string | number;
    data?: {
      shipped_at?: string;
      delivered_at?: string;
      carrier?: {
        code?: string;
        tracking_number?: string;
        tracking_url?: string;
      };
      shipments?: {
        carrier?: string;
        number?: string;
        url?: string;
        delivered_at?: string;
      }[];
    };
  };
};

/**
 * Applique un événement Printify à la commande correspondante.
 *
 * Le format exact du corps a bougé au fil des versions de l'API : on lit les
 * deux formes connues (`carrier` seul, ou tableau `shipments`) et on ignore en
 * silence un événement qui ne concerne aucune commande connue — un rejeu ou une
 * commande passée hors du site ne doit pas produire d'erreur.
 */
export async function applyPrintifyEvent(event: PrintifyEvent) {
  const podOrderId = event.resource?.id ? String(event.resource.id) : null;
  if (!podOrderId) return { traite: false, raison: "événement sans commande" };

  const order = await prisma.order.findFirst({ where: { podOrderId } });
  if (!order) return { traite: false, raison: "commande inconnue" };

  const data = event.resource?.data ?? {};
  const expedition = data.shipments?.[0];

  const trackingNumber =
    data.carrier?.tracking_number ?? expedition?.number ?? null;
  const trackingUrl = data.carrier?.tracking_url ?? expedition?.url ?? null;

  const livre =
    event.type === "order:shipment:delivered" ||
    Boolean(data.delivered_at ?? expedition?.delivered_at);

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: livre ? "DELIVERED" : "SHIPPED",
      shippedAt: order.shippedAt ?? new Date(data.shipped_at ?? Date.now()),
      ...(livre
        ? { deliveredAt: new Date(data.delivered_at ?? expedition?.delivered_at ?? Date.now()) }
        : {}),
      // Un rejeu sans numéro ne doit pas effacer celui déjà enregistré.
      ...(trackingNumber ? { trackingNumber } : {}),
      ...(trackingUrl ? { trackingUrl } : {}),
    },
  });

  return { traite: true, commande: order.number };
}
