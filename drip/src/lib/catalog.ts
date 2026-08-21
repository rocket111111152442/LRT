import { cache } from "react";
import { prisma, safeQuery } from "@/lib/prisma";

export type SortKey =
  | "rayon"
  | "nouveautes"
  | "prix-croissant"
  | "prix-decroissant"
  | "populaires";

export const SORT_LABELS: Record<SortKey, string> = {
  rayon: "Par rayon",
  nouveautes: "Nouveautés",
  populaires: "Les plus aimées",
  "prix-croissant": "Prix croissant",
  "prix-decroissant": "Prix décroissant",
};

export function parseSort(value: string | undefined): SortKey {
  // « Par rayon » par défaut : sans lui, « Tout » affichait le catalogue dans
  // l'ordre d'import, casquettes et sweats mélangés au hasard des
  // synchronisations.
  return value && value in SORT_LABELS ? (value as SortKey) : "rayon";
}

export const AUDIENCE_LABELS = {
  HOMME: "Homme",
  FEMME: "Femme",
  UNISEXE: "Unisexe",
  ENFANT: "Enfant",
} as const;

export type AudienceKey = keyof typeof AUDIENCE_LABELS;

export function parseAudience(value: string | undefined): AudienceKey | undefined {
  if (!value) return undefined;

  const cle = value.toUpperCase();
  return cle in AUDIENCE_LABELS ? (cle as AudienceKey) : undefined;
}

const listSelect = {
  id: true,
  slug: true,
  name: true,
  subtitle: true,
  basePrice: true,
  compareAtPrice: true,
  badge: true,
  featured: true,
  createdAt: true,
  images: { orderBy: { position: "asc" }, take: 2, select: { url: true, alt: true } },
  variants: {
    where: { available: true },
    orderBy: { position: "asc" },
    select: { id: true, color: true, colorHex: true, size: true, price: true },
  },
  category: { select: { slug: true, name: true } },
  audience: true,
} as const;

type ProductList = Awaited<ReturnType<typeof prisma.product.findMany<{ select: typeof listSelect }>>>;

export type ProductCardData = ProductList[number];

/**
 * Publics réellement présents au catalogue.
 *
 * Le filtre homme/femme n'a de sens que si la boutique vend des deux : proposer
 * un choix qui ne change rien encombre la page pour rien.
 */
export async function listAudiences() {
  return safeQuery(
    async () => {
      const lignes = await prisma.product.groupBy({
        by: ["audience"],
        where: { active: true },
      });

      return lignes.map((ligne) => ligne.audience);
    },
    [],
    "publics du catalogue",
  );
}

export async function listProducts(
  options: {
    category?: string;
    audience?: AudienceKey;
    sort?: SortKey;
    search?: string;
    take?: number;
  } = {},
) {
  const { category, audience, sort = "rayon", search, take } = options;

  const where = {
    active: true,
    ...(category ? { category: { slug: category } } : {}),
    // « Unisexe » recouvre le reste : une pièce unisexe a sa place dans le
    // rayon homme comme dans le rayon femme, ce serait absurde de la cacher.
    ...(audience
      ? audience === "UNISEXE"
        ? { audience: "UNISEXE" as const }
        : { audience: { in: [audience, "UNISEXE" as const] } }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { subtitle: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            // « accessoires », « combat » : on cherche aussi par rayon, sinon
            // le mot le plus naturel ne renvoie rien.
            { category: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "prix-croissant"
      ? [{ basePrice: "asc" as const }]
      : sort === "prix-decroissant"
        ? [{ basePrice: "desc" as const }]
        : sort === "populaires"
          ? [{ featured: "desc" as const }, { position: "asc" as const }]
          : sort === "nouveautes"
            ? [{ createdAt: "desc" as const }]
            : // Par rayon : les rayons dans l'ordre choisi en administration,
              // puis les pièces dans le leur. Les pièces sans rayon ferment la
              // marche, PostgreSQL plaçant les valeurs nulles en fin de tri
              // croissant.
              [
                { category: { position: "asc" as const } },
                { position: "asc" as const },
                { createdAt: "desc" as const },
              ];

  return safeQuery(
    async () => {
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          select: listSelect,
          ...(take ? { take } : {}),
        }),
        prisma.product.count({ where }),
      ]);

      return { products, total };
    },
    { products: [] as ProductList, total: 0 },
    "liste des produits",
  );
}

export async function listCategories() {
  return safeQuery(
    () =>
      prisma.category.findMany({
        orderBy: { position: "asc" },
        select: {
          slug: true,
          name: true,
          tagline: true,
          _count: { select: { products: { where: { active: true } } } },
        },
      }),
    [] as Awaited<
      ReturnType<
        typeof prisma.category.findMany<{
          select: {
            slug: true;
            name: true;
            tagline: true;
            _count: { select: { products: { where: { active: true } } } };
          };
        }>
      >
    >,
    "liste des rayons",
  );
}

// `cache()` : la fiche produit est lue une fois pour `generateMetadata` et une
// fois pour la page elle-même. Sans ce partage, chaque visite ferait deux
// allers-retours base de données identiques au lieu d'un seul.
export const getProductBySlug = cache(async (slug: string) => {
  return safeQuery(
    () =>
      prisma.product.findFirst({
        where: { slug, active: true },
        // `podDescription` ne sert qu'à la synchronisation. L'écarter garde la
        // boutique lisible même si la base n'a pas encore reçu la colonne.
        omit: { podDescription: true },
        include: {
          category: { select: { slug: true, name: true } },
          images: { orderBy: { position: "asc" } },
          variants: { orderBy: { position: "asc" } },
        },
      }),
    null,
    "chargement de la fiche produit",
  );
});

/** Note moyenne et répartition des étoiles pour un produit. */
export async function getProductRating(productId: string) {
  const empty = { average: 0, count: 0, breakdown: [0, 0, 0, 0, 0] };

  return safeQuery(
    async () => {
      const reviews = await prisma.review.findMany({
        where: { productId, status: "APPROVED" },
        select: { rating: true },
      });

      if (reviews.length === 0) return empty;

      const breakdown = [0, 0, 0, 0, 0];
      let sum = 0;

      for (const review of reviews) {
        sum += review.rating;
        const index = Math.min(4, Math.max(0, review.rating - 1));
        breakdown[index] += 1;
      }

      return {
        average: Math.round((sum / reviews.length) * 10) / 10,
        count: reviews.length,
        breakdown,
      };
    },
    empty,
    "note du produit",
  );
}

/** Notes agrégées pour une liste de produits, en une seule requête. */
export async function getRatingsFor(productIds: string[]) {
  const empty = new Map<string, { average: number; count: number }>();
  if (productIds.length === 0) return empty;

  return safeQuery(
    async () => {
      const grouped = await prisma.review.groupBy({
        by: ["productId"],
        where: { productId: { in: productIds }, status: "APPROVED" },
        _avg: { rating: true },
        _count: { rating: true },
      });

      return new Map(
        grouped.map((row) => [
          row.productId,
          {
            average: Math.round((row._avg.rating ?? 0) * 10) / 10,
            count: row._count.rating,
          },
        ]),
      );
    },
    empty,
    "notes agrégées",
  );
}

export async function getRelatedProducts(productId: string, categoryId: string | null) {
  return safeQuery(
    () =>
      prisma.product.findMany({
        where: {
          active: true,
          id: { not: productId },
          ...(categoryId ? { categoryId } : {}),
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 4,
        select: listSelect,
      }),
    [] as ProductList,
    "produits associés",
  );
}

/**
 * Les pièces préférées des clients : les plus vendues, départagées par la
 * meilleure note. Une commande ne compte que si elle a réellement abouti à
 * une vente (payée et non annulée/remboursée) — sinon un panier abandonné
 * ferait passer une pièce pour un best-seller.
 */
export async function getBestSellingProducts(take = 4) {
  return safeQuery(
    async () => {
      const [sales, ratings, products] = await Promise.all([
        prisma.orderItem.groupBy({
          by: ["productId"],
          where: {
            productId: { not: null },
            order: { status: { in: ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"] } },
          },
          _sum: { quantity: true },
        }),
        prisma.review.groupBy({
          by: ["productId"],
          where: { status: "APPROVED" },
          _avg: { rating: true },
          _count: { rating: true },
        }),
        prisma.product.findMany({ where: { active: true }, select: listSelect }),
      ]);

      const soldByProduct = new Map(
        sales
          .filter((row) => row.productId !== null)
          .map((row) => [row.productId as string, row._sum.quantity ?? 0]),
      );

      const ratingByProduct = new Map(
        ratings.map((row) => [
          row.productId,
          { average: row._avg.rating ?? 0, count: row._count.rating },
        ]),
      );

      const ranked = products
        .map((product) => ({
          product,
          sold: soldByProduct.get(product.id) ?? 0,
          rating: ratingByProduct.get(product.id) ?? { average: 0, count: 0 },
        }))
        .sort((a, b) => {
          if (b.sold !== a.sold) return b.sold - a.sold;
          if (b.rating.average !== a.rating.average) return b.rating.average - a.rating.average;
          if (b.rating.count !== a.rating.count) return b.rating.count - a.rating.count;
          return b.product.createdAt.getTime() - a.product.createdAt.getTime();
        });

      // Assez de pièces vendues pour remplir la sélection : on s'y tient
      // strictement, sans laisser une pièce jamais achetée s'y glisser.
      const withSales = ranked.filter((entry) => entry.sold > 0);
      const chosen = withSales.length >= take ? withSales : ranked;

      return chosen.slice(0, take).map((entry) => entry.product);
    },
    [] as ProductList,
    "pièces préférées des clients",
  );
}

const reviewSelect = {
  id: true,
  authorName: true,
  rating: true,
  title: true,
  body: true,
  createdAt: true,
  verifiedPurchase: true,
  reply: true,
  product: { select: { name: true, slug: true } },
} as const;

type ReviewList = Awaited<
  ReturnType<typeof prisma.review.findMany<{ select: typeof reviewSelect }>>
>;

/** Derniers avis validés, pour la fresque défilante de l'accueil. */
export async function getLatestReviews(take = 12) {
  return safeQuery(
    () =>
      prisma.review.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take,
        select: reviewSelect,
      }),
    [] as ReviewList,
    "derniers avis",
  );
}

export async function getGlobalRating() {
  return safeQuery(
    async () => {
      const result = await prisma.review.aggregate({
        where: { status: "APPROVED" },
        _avg: { rating: true },
        _count: { rating: true },
      });

      return {
        average: Math.round((result._avg.rating ?? 0) * 10) / 10,
        count: result._count.rating,
      };
    },
    { average: 0, count: 0 },
    "note globale",
  );
}

/** Nombre de pièces actuellement en vente. */
export async function countActiveProducts() {
  return safeQuery(
    () => prisma.product.count({ where: { active: true } }),
    0,
    "comptage des produits",
  );
}
