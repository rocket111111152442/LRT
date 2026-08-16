import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/orderStatus";

export const metadata: Metadata = {
  title: "Mes commandes",
  robots: { index: false, follow: false },
};

export default async function CommandesPage() {
  const user = await requireUser("/compte/commandes");

  const orders = await safeQuery(
    () =>
      prisma.order.findMany({
        where: { userId: user.id, status: { not: "PENDING" } },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    [],
    "liste des commandes",
  );

  if (orders.length === 0) {
    return (
      <div className="hairline hairline-b flex flex-col items-start gap-5 py-16">
        <h2 className="display-lg">Aucune commande</h2>
        <p className="max-w-[46ch] text-sm text-[color:var(--color-smoke)]">
          Vos commandes apparaîtront ici avec leur suivi, dès votre premier
          achat.
        </p>
        <Link href="/boutique" className="btn btn-outline btn-sm">
          Voir la collection
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h2 className="display-lg">Commandes</h2>

      <div className="space-y-px">
        {orders.map((order) => {
          const status = ORDER_STATUS[order.status as OrderStatusKey];

          return (
            <article
              key={order.id}
              className="border-t border-[color:var(--color-hairline)] py-7 last:border-b"
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm">{order.number}</p>
                  <p className="label-sm mt-2 text-[color:var(--color-smoke)]">
                    {order.createdAt.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                    {" — "}
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} article(s)
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <span className="tag">{status.label}</span>
                  <span className="font-mono text-sm">{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {order.items.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-4/5 w-[62px] overflow-hidden bg-[color:var(--color-paper-pure)]"
                    title={`${item.productName} — ${item.variantName}`}
                  >
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt="" fill sizes="62px" className="object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center bg-[color:var(--color-ash)]">
                        <span className="display text-base opacity-30">D</span>
                      </span>
                    )}
                  </div>
                ))}

                <Link
                  href={`/compte/commandes/${order.id}`}
                  className="label ml-auto link-sweep"
                >
                  Détail & suivi →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
