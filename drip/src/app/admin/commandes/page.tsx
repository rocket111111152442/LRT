import Link from "next/link";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/orderStatus";

type SearchParams = Promise<{ statut?: string }>;

const FILTERS = [
  { key: "", label: "Toutes" },
  { key: "PAID", label: "À produire" },
  { key: "IN_PRODUCTION", label: "En fabrication" },
  { key: "SHIPPED", label: "Expédiées" },
  { key: "DELIVERED", label: "Livrées" },
  { key: "PENDING", label: "Paiement en attente" },
] as const;

export default async function AdminCommandesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filter = FILTERS.some((item) => item.key === params.statut) ? params.statut : "";

  const orders = await safeQuery(
    () =>
      prisma.order.findMany({
        where: filter ? { status: filter as OrderStatusKey } : {},
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          items: { select: { quantity: true } },
          user: { select: { firstName: true, lastName: true } },
        },
      }),
    [],
    "commandes admin",
  );

  return (
    <div className="space-y-10">
      <header>
        <p className="label mb-4 text-[color:var(--color-smoke)]">(Ventes)</p>
        <h1 className="display-xl">Commandes</h1>
      </header>

      <nav className="flex flex-wrap gap-5" aria-label="Filtrer par statut">
        {FILTERS.map((item) => (
          <Link
            key={item.key}
            href={item.key ? `/admin/commandes?statut=${item.key}` : "/admin/commandes"}
            className={`label link-sweep ${
              (filter ?? "") === item.key ? "opacity-100" : "opacity-50"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="hairline py-16 text-sm text-[color:var(--color-smoke)]">
          Aucune commande dans cette vue.
        </p>
      ) : (
        <div className="hairline">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/commandes/${order.id}`}
              className="group hairline-b flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div className="min-w-[180px]">
                <p className="font-mono text-sm">{order.number}</p>
                <p className="label-sm mt-1.5 truncate text-[color:var(--color-smoke)]">
                  {order.user
                    ? `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() ||
                      order.email
                    : order.email}
                </p>
              </div>

              <span className="tag">
                {ORDER_STATUS[order.status as OrderStatusKey].label}
              </span>

              <span className="label-sm text-[color:var(--color-smoke)]">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} art.
              </span>

              <span className="label-sm text-[color:var(--color-smoke)]">
                {order.createdAt.toLocaleDateString("fr-FR")}
              </span>

              <div className="flex items-center gap-5">
                <span className="font-mono text-sm">{formatPrice(order.total)}</span>
                <span className="transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
