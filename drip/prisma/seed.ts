/**
 * Amorce la base : compte administrateur, rayons et quelques pièces de
 * démonstration pour que la boutique ne soit jamais vide avant la première
 * synchronisation Printful.
 *
 * Le script est idempotent : on peut le relancer sans créer de doublon.
 *
 *   npm run prisma:seed
 */

import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL manquante : impossible d'amorcer la base.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const CATEGORIES = [
  {
    slug: "casquettes",
    name: "Casquettes",
    tagline: "La forme de base, travaillée jusqu'à la couture.",
    position: 0,
  },
  {
    slug: "bonnets",
    name: "Bonnets",
    tagline: "Pour les mois où la visière ne suffit plus.",
    position: 1,
  },
  {
    slug: "accessoires",
    name: "Accessoires",
    tagline: "Le reste de la panoplie, en noir et blanc.",
    position: 2,
  },
];

const PRODUCTS = [
  {
    slug: "drip-classic-noir",
    name: "DRIP Classic",
    subtitle: "Coton lourd, visière structurée",
    category: "casquettes",
    basePrice: 3900,
    featured: true,
    badge: "SÉRIE 01",
    position: 0,
    description: `La pièce de départ. Une six-panneaux en coton lourd, visière préformée et broderie DRIP au fil ton sur ton — visible de près, discrète de loin.

Fermeture métal ajustable à l'arrière, doublure intérieure ceinturée pour que la forme tienne après plusieurs saisons. Fabriquée à la commande dans nos ateliers partenaires européens.`,
    composition:
      "100 % coton lourd (280 g/m²). Broderie fil polyester. Fermeture métal ajustable. Tour de tête 55 à 61 cm. Lavage à la main à l'eau froide, séchage à l'air libre.",
    variants: [
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "Taille unique", price: 3900 },
      { name: "Blanc", color: "Blanc", colorHex: "#F5F5F0", size: "Taille unique", price: 3900 },
    ],
  },
  {
    slug: "drip-trucker",
    name: "DRIP Trucker",
    subtitle: "Filet respirant, visière plate",
    category: "casquettes",
    basePrice: 3500,
    featured: true,
    position: 1,
    description: `Une trucker sans la nostalgie américaine : façade en twill, arrière en filet, visière plate et logo brodé au centre.

Plus légère que la Classic, pensée pour les mois chauds et les journées où l'on ne quitte pas sa casquette.`,
    composition:
      "Façade 65 % polyester / 35 % coton, arrière 100 % polyester filet. Fermeture pression réglable. Taille unique.",
    variants: [
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "Taille unique", price: 3500 },
      { name: "Blanc", color: "Blanc", colorHex: "#F5F5F0", size: "Taille unique", price: 3500 },
    ],
  },
  {
    slug: "drip-dad-cap",
    name: "DRIP Dad Cap",
    subtitle: "Coupe basse, coton lavé",
    category: "casquettes",
    basePrice: 3200,
    featured: true,
    position: 2,
    description: `Calotte basse, visière incurvée, coton lavé qui se patine à l'usage. La casquette qu'on met sans y penser et qu'on ne quitte plus.

Broderie plate au point serré, boucle métal à l'arrière.`,
    composition:
      "100 % coton lavé (250 g/m²). Boucle métal réglable. Tour de tête 54 à 60 cm.",
    variants: [
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "Taille unique", price: 3200 },
      { name: "Blanc", color: "Blanc", colorHex: "#F5F5F0", size: "Taille unique", price: 3200 },
    ],
  },
  {
    slug: "drip-beanie",
    name: "DRIP Beanie",
    subtitle: "Maille côtelée, revers brodé",
    category: "bonnets",
    basePrice: 2900,
    featured: true,
    position: 3,
    description: `Bonnet en maille côtelée avec revers, étiquette brodée sur le repli. Assez serré pour tenir, assez souple pour ne pas marquer le front.`,
    composition: "100 % acrylique doux. Maille côtelée. Taille unique.",
    variants: [
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "Taille unique", price: 2900 },
      { name: "Blanc", color: "Blanc", colorHex: "#F5F5F0", size: "Taille unique", price: 2900 },
    ],
  },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "→ ADMIN_EMAIL / ADMIN_PASSWORD non définis : aucun administrateur créé.",
    );
    return;
  }

  if (password.length < 10) {
    throw new Error("ADMIN_PASSWORD doit contenir au moins 10 caractères.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      firstName: "Studio",
      lastName: "DRIP",
      role: "ADMIN",
    },
    // Le mot de passe est réaligné sur la variable d'environnement à chaque
    // exécution : c'est la procédure de récupération d'accès.
    update: { passwordHash, role: "ADMIN", sessionsValidFrom: new Date() },
  });

  console.log(`→ Administrateur prêt : ${admin.email}`);
}

async function seedCatalogue() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: { name: category.name, tagline: category.tagline, position: category.position },
    });
  }

  console.log(`→ ${CATEGORIES.length} rayons en place.`);

  for (const item of PRODUCTS) {
    const category = await prisma.category.findUnique({
      where: { slug: item.category },
      select: { id: true },
    });

    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
      select: { id: true },
    });

    // Un produit déjà présent n'est pas réécrit : on ne veut pas effacer les
    // retouches faites depuis l'administration.
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        slug: item.slug,
        name: item.name,
        subtitle: item.subtitle,
        description: item.description,
        composition: item.composition,
        basePrice: item.basePrice,
        badge: "badge" in item ? (item.badge as string) : null,
        featured: item.featured,
        position: item.position,
        categoryId: category?.id ?? null,
        active: true,
      },
    });

    await prisma.variant.createMany({
      data: item.variants.map((variant, index) => ({
        productId: product.id,
        name: `${variant.color} / ${variant.size}`,
        color: variant.color,
        colorHex: variant.colorHex,
        size: variant.size,
        price: variant.price,
        position: index,
        available: true,
      })),
    });
  }

  const total = await prisma.product.count();
  console.log(`→ ${total} pièces au catalogue.`);
}

async function seedCoupon() {
  await prisma.coupon.upsert({
    where: { code: "BIENVENUE10" },
    create: {
      code: "BIENVENUE10",
      type: "PERCENT",
      value: 10,
      minSubtotal: 3000,
      active: true,
    },
    update: {},
  });

  console.log("→ Code promo BIENVENUE10 disponible.");
}

async function main() {
  await seedAdmin();
  await seedCatalogue();
  await seedCoupon();
}

main()
  .catch((error) => {
    console.error("Échec de l'amorçage :", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
