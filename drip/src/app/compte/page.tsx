import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/orderStatus";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

export default async function ComptePage() {
  const user = await requireUser();

  const data = await safeQuery(
    async () => {
      const [orders, reviewCount, wishlistCount, spent] = await Promise.all([
        prisma.order.findMany({
          where: { userId: user.id, status: { not: "PENDING" } },
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { items: { take: 3 } },
        }),
        prisma.review.count({ where: { userId: user.id } }),
        prisma.wishlistItem.count({ where: { userId: user.id } }),
        prisma.order.aggregate({
          where: {
            userId: user.id,
            status: { in: ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"] },
          },
          _sum: { total: true },
          _count: true,
        }),
      ]);

      return { orders, reviewCount, wishlistCount, spent };
    },
    {
      orders: [] as Awaited<ReturnType<typeof prisma.order.findMany>>,
      reviewCount: 0,
      wishlistCount: 0,
      spent: { _sum: { total: null as number | null }, _count: 0 },
    },
    "aperçu du compte",
  );

  const stats = [
    { label: "Commandes", value: String(data.spent._count) },
    { label: "Total dépensé", value: formatPrice(data.spent._sum.total ?? 0) },
    { label: "Avis déposés", value: String(data.reviewCount) },
    { label: "Favoris", value: String(data.wishlistCount) },
  ];

  return (
    <div className="space-y-14">
      <section>
        <div className="grid grid-cols-2 gap-px border-t border-[color:var(--color-hairline)] lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border-b border-[color:var(--color-hairline)] py-6 lg:border-r lg:pr-6 lg:last:border-r-0">
              <p className="label-sm mb-3 text-[color:var(--color-smoke)]">{stat.label}</p>
              <p className="display text-3xl">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-7 flex items-end justify-between gap-4">
          <h2 className="display-lg">Dernières commandes</h2>
          <Link href="/compte/commandes" className="label link-sweep">
            Tout voir
          </Link>
        </div>

        {data.orders.length === 0 ? (
          <div className="hairline hairline-b flex flex-col items-start gap-5 py-14">
            <p className="text-sm text-[color:var(--color-smoke)]">
              Aucune commande pour l&apos;instant.
            </p>
            <Link href="/boutique" className="btn btn-outline btn-sm">
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <div className="hairline">
            {data.orders.map((order) => {
              const status = ORDER_STATUS[order.status as OrderStatusKey];

              return (
                <Link
                  key={order.id}
                  href={`/compte/commandes/${order.id}`}
                  className="group hairline-b flex flex-wrap items-center justify-between gap-4 py-5"
                >
                  <div>
                    <p className="font-mono text-sm">{order.number}</p>
                    <p className="label-sm mt-2 text-[color:var(--color-smoke)]">
                      {order.createdAt.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <span className="tag">{status.label}</span>

                  <div className="flex items-center gap-6">
                    <span className="font-mono text-sm">{formatPrice(order.total)}</span>
                    <span className="transition-transform duration-500 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
