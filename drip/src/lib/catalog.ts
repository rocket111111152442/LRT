import { prisma, safeQuery } from "@/lib/prisma";

export type SortKey = "nouveautes" | "prix-croissant" | "prix-decroissant" | "populaires";

export const SORT_LABELS: Record<SortKey, string> = {
  nouveautes: "Nouveautés",
  populaires: "Les plus aimées",
  "prix-croissant": "Prix croissant",
  "prix-decroissant": "Prix décroissant",
};

export function parseSort(value: string | undefined): SortKey {
  return value && value in SORT_LABELS ? (value as SortKey) : "nouveautes";
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
} as const;

type ProductList = Awaited<ReturnType<typeof prisma.product.findMany<{ select: typeof listSelect }>>>;

export type ProductCardData = ProductList[number];

export async function listProducts(
  options: {
    category?: string;
    sort?: SortKey;
    search?: string;
    take?: number;
  } = {},
) {
  const { category, sort = "nouveautes", search, take } = options;

  const where = {
    active: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { subtitle: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
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
          : [{ createdAt: "desc" as const }];

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

export async function getProductBySlug(slug: string) {
  return safeQuery(
    () =>
      prisma.product.findFirst({
        where: { slug, active: true },
        include: {
          category: { select: { slug: true, name: true } },
          images: { orderBy: { position: "asc" } },
          variants: { orderBy: { position: "asc" } },
        },
      }),
    null,
    "chargement de la fiche produit",
  );
}

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

export async function getFeaturedProducts(take = 4) {
  return safeQuery(
    async () => {
      const products = await prisma.product.findMany({
        where: { active: true, featured: true },
        orderBy: { position: "asc" },
        take,
        select: listSelect,
      });

      if (products.length >= take) return products;

      // Pas assez de pièces mises en avant : on complète avec les plus récentes
      // pour que la page d'accueil ne paraisse jamais dégarnie.
      const fillers = await prisma.product.findMany({
        where: { active: true, id: { notIn: products.map((product) => product.id) } },
        orderBy: { createdAt: "desc" },
        take: take - products.length,
        select: listSelect,
      });

      return [...products, ...fillers];
    },
    [] as ProductList,
    "sélection de la page d'accueil",
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
