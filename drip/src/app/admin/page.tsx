import Link from "next/link";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/orderStatus";
import { printifyEnabled } from "@/lib/printify";
import { stripeEnabled } from "@/lib/stripe";
import { daysAgo } from "@/lib/dates";

export default async function AdminDashboard() {
  const data = await safeQuery(
    async () => {
      const paidStatuses = ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"] as const;
      const thirtyDaysAgo = daysAgo(30);

      const [revenue, revenue30, orderCount, pendingReviews, customers, unhandled, lowActivity, recent] =
        await Promise.all([
          prisma.order.aggregate({
            where: { status: { in: [...paidStatuses] } },
            _sum: { total: true },
            _count: true,
          }),
          prisma.order.aggregate({
            where: { status: { in: [...paidStatuses] }, createdAt: { gte: thirtyDaysAgo } },
            _sum: { total: true },
            _count: true,
          }),
          prisma.order.count({ where: { status: { in: ["PAID", "IN_PRODUCTION"] } } }),
          prisma.review.count({ where: { status: "PENDING" } }),
          prisma.user.count({ where: { role: "CUSTOMER" } }),
          prisma.contactMessage.count({ where: { handled: false } }),
          prisma.product.count({ where: { active: true } }),
          prisma.order.findMany({
            where: { status: { not: "PENDING" } },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
              id: true,
              number: true,
              email: true,
              total: true,
              status: true,
              createdAt: true,
            },
          }),
        ]);

      return {
        revenue,
        revenue30,
        orderCount,
        pendingReviews,
        customers,
        unhandled,
        activeProducts: lowActivity,
        recent,
      };
    },
    null,
    "tableau de bord",
  );

  if (!data) {
    return (
      <div className="border border-[color:var(--color-hairline)] p-8">
        <h1 className="display-lg mb-4">Base de données injoignable</h1>
        <p className="max-w-[60ch] text-sm text-[color:var(--color-smoke)]">
          Vérifiez la variable <code className="font-mono text-xs">DATABASE_URL</code>{" "}
          et que les migrations Prisma ont bien été appliquées.
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Chiffre d'affaires", value: formatPrice(data.revenue._sum.total ?? 0) },
    { label: "30 derniers jours", value: formatPrice(data.revenue30._sum.total ?? 0) },
    { label: "Commandes payées", value: String(data.revenue._count) },
    { label: "À expédier", value: String(data.orderCount) },
    { label: "Clients", value: String(data.customers) },
    { label: "Pièces en ligne", value: String(data.activeProducts) },
  ];

  const alerts = [
    !stripeEnabled() && {
      text: "Stripe n'est pas configuré : la caisse est fermée. Renseignez STRIPE_SECRET_KEY.",
      href: null,
    },
    !printifyEnabled() && {
      text: "Printify n'est pas connecté : les commandes ne partent pas en production automatiquement.",
      href: null,
    },
    data.pendingReviews > 0 && {
      text: `${data.pendingReviews} avis en attente de modération.`,
      href: "/admin/avis",
    },
    data.unhandled > 0 && {
      text: `${data.unhandled} message${data.unhandled > 1 ? "s" : ""} client non traité${data.unhandled > 1 ? "s" : ""}.`,
      href: "/admin/messages",
    },
    data.activeProducts === 0 && {
      text: "Aucune pièce n'est en ligne. Synchronisez Printify ou publiez un produit.",
      href: "/admin/produits",
    },
  ].filter(Boolean) as { text: string; href: string | null }[];

  return (
    <div className="space-y-12">
      <header>
        <p className="label mb-4 text-[color:var(--color-smoke)]">(Tableau de bord)</p>
        <h1 className="display-xl">Vue d&apos;ensemble</h1>
      </header>

      {alerts.length > 0 && (
        <section className="border border-[color:var(--color-ink)]">
          <p className="label border-b border-[color:var(--color-hairline)] px-5 py-3">
            À traiter
          </p>
          <ul>
            {alerts.map((alert) => (
              <li
                key={alert.text}
                className="flex items-center justify-between gap-4 border-b border-[color:var(--color-hairline)] px-5 py-3.5 text-sm last:border-b-0"
              >
                <span>{alert.text}</span>
                {alert.href && (
                  <Link href={alert.href} className="label shrink-0 link-sweep">
                    Voir →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-2 gap-px border-t border-[color:var(--color-hairline)] lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-b border-[color:var(--color-hairline)] py-6 lg:border-r lg:pr-6"
          >
            <p className="label-sm mb-3 text-[color:var(--color-smoke)]">{stat.label}</p>
            <p className="display text-[2.4rem] leading-none">{stat.value}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="display-lg">Dernières commandes</h2>
          <Link href="/admin/commandes" className="label link-sweep">
            Tout voir
          </Link>
        </div>

        {data.recent.length === 0 ? (
          <p className="text-sm text-[color:var(--color-smoke)]">
            Aucune commande pour l&apos;instant.
          </p>
        ) : (
          <div className="hairline">
            {data.recent.map((order) => (
              <Link
                key={order.id}
                href={`/admin/commandes/${order.id}`}
                className="group hairline-b flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm">{order.number}</p>
                  <p className="label-sm mt-1.5 truncate text-[color:var(--color-smoke)]">
                    {order.email}
                  </p>
                </div>

                <span className="tag">
                  {ORDER_STATUS[order.status as OrderStatusKey].label}
                </span>

                <div className="flex items-center gap-6">
                  <span className="label-sm text-[color:var(--color-smoke)]">
                    {order.createdAt.toLocaleDateString("fr-FR")}
                  </span>
                  <span className="font-mono text-sm">{formatPrice(order.total)}</span>
                  <span className="transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
