import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";

type SearchParams = Promise<{ q?: string }>;

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = params.q?.trim();

  const customers = await safeQuery(
    () =>
      prisma.user.findMany({
        where: {
          role: "CUSTOMER",
          ...(search
            ? {
                OR: [
                  { email: { contains: search, mode: "insensitive" as const } },
                  { firstName: { contains: search, mode: "insensitive" as const } },
                  { lastName: { contains: search, mode: "insensitive" as const } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          acceptsMarketing: true,
          orders: {
            where: { status: { in: ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"] } },
            select: { total: true },
          },
          _count: { select: { reviews: true } },
        },
      }),
    [],
    "liste des clients",
  );

  return (
    <div className="space-y-10">
      <header>
        <p className="label mb-4 text-[color:var(--color-smoke)]">(Clientèle)</p>
        <h1 className="display-xl">Clients</h1>
        <p className="mt-3 text-sm text-[color:var(--color-smoke)]">
          {customers.length} compte{customers.length > 1 ? "s" : ""}
          {search && ` correspondant à « ${search} »`}
        </p>
      </header>

      <form method="get" className="flex max-w-md gap-3">
        <input
          name="q"
          defaultValue={search}
          placeholder="Rechercher un nom ou un e-mail"
          className="field"
          aria-label="Rechercher un client"
        />
        <button type="submit" className="btn btn-outline btn-sm shrink-0">
          Chercher
        </button>
      </form>

      {customers.length === 0 ? (
        <p className="hairline py-16 text-sm text-[color:var(--color-smoke)]">
          Aucun client pour l&apos;instant.
        </p>
      ) : (
        <div className="hairline">
          {customers.map((customer) => {
            const spent = customer.orders.reduce((sum, order) => sum + order.total, 0);

            return (
              <article
                key={customer.id}
                className="hairline-b flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="min-w-[200px] flex-1">
                  <p className="text-sm font-medium">
                    {`${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
                      "Sans nom"}
                  </p>
                  <p className="label-sm mt-1.5 text-[color:var(--color-smoke)]">
                    {customer.email}
                  </p>
                </div>

                {customer.acceptsMarketing && <span className="tag">Newsletter</span>}

                <span className="label-sm text-[color:var(--color-smoke)]">
                  {customer.orders.length} commande(s)
                </span>

                <span className="label-sm text-[color:var(--color-smoke)]">
                  {customer._count.reviews} avis
                </span>

                <span className="label-sm text-[color:var(--color-smoke)]">
                  Inscrit le {customer.createdAt.toLocaleDateString("fr-FR")}
                </span>

                <span className="font-mono text-sm">{formatPrice(spent)}</span>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
