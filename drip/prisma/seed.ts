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
    slug: "combat",
    name: "Combat",
    tagline: "Rashguards, shorts et pièces qui encaissent les prises.",
    position: 0,
  },
  {
    slug: "entrainement",
    name: "Entraînement",
    tagline: "Ce qu'on met pour transpirer, trois fois par semaine.",
    position: 1,
  },
  {
    slug: "accessoires",
    name: "Accessoires",
    tagline: "Le reste du sac.",
    position: 2,
  },
];

const PRODUCTS = [
  {
    slug: "rashguard-panthere",
    name: "Rashguard Panthère",
    subtitle: "Manches longues, maille compressive",
    category: "combat",
    basePrice: 5900,
    featured: true,
    badge: "COLLECTION 01",
    position: 0,
    description: `La pièce qui ouvre la marque. Un rashguard manches longues en maille compressive, coutures plates surpiquées pour ne pas frotter sous le kimono, col renforcé qui ne se déforme pas quand on tire dessus.

Assez serré pour ne jamais remonter pendant un passage de garde, assez souple pour ne pas gêner l'épaule. Séchage rapide : il est sec avant le round suivant.`,
    composition:
      "82 % polyester recyclé, 18 % élasthanne. Maille compressive à séchage rapide. Coutures plates. Lavage à 30 °C sur l'envers, sans adoucissant. Ni sèche-linge ni repassage sur l'impression.",
    variants: [
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "S", price: 5900 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "M", price: 5900 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "L", price: 5900 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "XL", price: 5900 },
    ],
  },
  {
    slug: "short-de-combat",
    name: "Short de combat",
    subtitle: "Fentes latérales, ceinture à cordon",
    category: "combat",
    basePrice: 4900,
    featured: true,
    position: 1,
    description: `Un short taillé pour le sol comme pour le debout. Fentes latérales hautes qui libèrent la hanche, ceinture élastique doublée d'un cordon plat qui ne s'ouvre pas tout seul.

Tissu léger, traité pour sécher vite, sans doublure inutile qui garde la sueur.`,
    composition:
      "100 % polyester traité déperlant. Ceinture élastique et cordon plat. Fentes latérales renforcées. Lavage à 30 °C, séchage à l'air libre.",
    variants: [
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "S", price: 4900 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "M", price: 4900 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "L", price: 4900 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "XL", price: 4900 },
    ],
  },
  {
    slug: "tee-entrainement",
    name: "Tee d'entraînement",
    subtitle: "Coton lourd, coupe droite",
    category: "entrainement",
    basePrice: 3500,
    featured: true,
    position: 2,
    description: `Le t-shirt qu'on enfile pour aller à la salle et qu'on garde après. Coton lourd qui ne devient pas transparent à la première sueur, col côtelé qui tient sa forme.

Coupe droite, épaules nettes, longueur qui reste en place quand on lève les bras.`,
    composition:
      "100 % coton peigné (220 g/m²). Col côtelé renforcé. Lavage à 30 °C sur l'envers. Séchage à l'air libre recommandé.",
    variants: [
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "S", price: 3500 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "M", price: 3500 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "L", price: 3500 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "XL", price: 3500 },
    ],
  },
  {
    slug: "hoodie-atelier",
    name: "Hoodie Atelier",
    subtitle: "Molleton gratté, capuche doublée",
    category: "entrainement",
    basePrice: 7900,
    featured: true,
    position: 3,
    description: `Celui qu'on met avant et après la séance, quand le corps redescend. Molleton gratté à l'intérieur, capuche doublée qui ne s'affaisse pas, poche kangourou assez profonde pour être utile.

Coupe légèrement ample, sans être flottante.`,
    composition:
      "80 % coton, 20 % polyester (320 g/m²). Molleton gratté. Bords-côtes élasthanne aux poignets et à la taille. Lavage à 30 °C sur l'envers.",
    variants: [
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "S", price: 7900 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "M", price: 7900 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "L", price: 7900 },
      { name: "Noir", color: "Noir", colorHex: "#111111", size: "XL", price: 7900 },
    ],
  },
  {
    slug: "casquette-panthere",
    name: "Casquette Panthère",
    subtitle: "Coton lourd, broderie ton sur ton",
    category: "accessoires",
    basePrice: 3500,
    featured: false,
    position: 4,
    description: `Six panneaux en coton lourd, visière préformée, broderie ton sur ton — visible de près, discrète de loin. Fermeture métal ajustable.`,
    composition:
      "100 % coton lourd (280 g/m²). Broderie fil polyester. Fermeture métal ajustable. Tour de tête 55 à 61 cm. Lavage à la main à l'eau froide.",
    variants: [
      { name: "Noir / Taille unique", color: "Noir", colorHex: "#111111", size: "Taille unique", price: 3500 },
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
      firstName: "Atelier",
      lastName: "NATURAL BRUTAL",
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
