import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { getRatingsFor } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Mes favoris",
  robots: { index: false, follow: false },
};

export default async function FavorisPage() {
  const user = await requireUser("/compte/favoris");

  const items = await safeQuery(
    () =>
      prisma.wishlistItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              subtitle: true,
              basePrice: true,
              compareAtPrice: true,
              badge: true,
              images: { orderBy: { position: "asc" }, take: 2, select: { url: true, alt: true } },
              variants: {
                where: { available: true },
                select: { id: true, color: true, colorHex: true },
              },
            },
          },
        },
      }),
    [],
    "favoris",
  );

  const ratings = await getRatingsFor(items.map((item) => item.product.id));

  if (items.length === 0) {
    return (
      <div className="hairline hairline-b flex flex-col items-start gap-5 py-16">
        <h2 className="display-lg">Aucun favori</h2>
        <p className="max-w-[46ch] text-sm text-[color:var(--color-smoke)]">
          Mettez de côté les pièces qui vous plaisent pour les retrouver ici.
        </p>
        <Link href="/boutique" className="btn btn-outline btn-sm">
          Voir la collection
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="display-lg mb-10">Favoris</h2>

      <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3">
        {items.map((item, index) => (
          <ProductCard
            key={item.id}
            product={item.product}
            rating={ratings.get(item.product.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
