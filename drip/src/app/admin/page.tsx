import Link from "next/link";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/orderStatus";
import { verifierPreparation } from "@/lib/preparation";
import { daysAgo } from "@/lib/dates";
import { currentMonthFinance, getMonthlyFinances } from "@/lib/finances";

export default async function AdminDashboard() {
  const data = await safeQuery(
    async () => {
      const paidStatuses = ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"] as const;
      const thirtyDaysAgo = daysAgo(30);

      const [
        revenue,
        revenue30,
        orderCount,
        pendingReviews,
        customers,
        unhandled,
        lowActivity,
        bloquees,
        recent,
      ] = await Promise.all([
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
          // Payée, mais jamais transmise au fabricant. C'est ce que laisse
          // derrière elle une carte refusée chez Printify — faute de fonds,
          // le plus souvent, l'encaissement Stripe n'étant versé que plus tard.
          prisma.order.count({ where: { status: "PAID", podOrderId: null } }),
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
        bloquees,
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

  const preparation = await verifierPreparation();
  const manquants = preparation.filter((point) => !point.ok);
  const bloquants = manquants.filter((point) => point.bloquant);

  const monthlyFinances = await getMonthlyFinances();
  const currentMonth = currentMonthFinance(monthlyFinances);
  const pastMonths = monthlyFinances.filter((month) => month.key !== currentMonth.key);

  const alerts = [
    data.bloquees > 0 && {
      text: `${data.bloquees} commande${data.bloquees > 1 ? "s" : ""} payée${data.bloquees > 1 ? "s" : ""} mais pas encore transmise${data.bloquees > 1 ? "s" : ""} à la fabrication. Vérifiez le moyen de paiement enregistré dans Printify, puis relancez l'envoi depuis la commande.`,
      href: "/admin/commandes?statut=PAID",
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

      {/* Prêt à vendre ? La question revient à chaque ouverture : autant que
          la réponse soit vérifiée, ici, plutôt que ressentie. */}
      <section
        className={`border p-5 ${
          bloquants.length > 0
            ? "border-[color:var(--color-ink)]"
            : "border-[color:var(--color-hairline)]"
        }`}
      >
        <p className="label mb-3">
          {bloquants.length > 0
            ? "La boutique ne peut pas encore vendre"
            : manquants.length > 0
              ? "La boutique peut vendre"
              : "Tout est en place"}
        </p>

        <p className="mb-6 max-w-[62ch] text-sm leading-relaxed">
          {bloquants.length > 0
            ? `${bloquants.length} point${bloquants.length > 1 ? "s" : ""} bloque${bloquants.length > 1 ? "nt" : ""} la vente. Tant qu'il${bloquants.length > 1 ? "s ne sont" : " n'est"} pas réglé${bloquants.length > 1 ? "s" : ""}, un client ne peut pas commander.`
            : manquants.length > 0
              ? "Un client peut commander et payer. Les points ci-dessous ne bloquent rien, mais chacun vous fera gagner du temps sur chaque commande."
              : "Encaissement, fabrication, suivi des colis, catalogue : tout répond."}
        </p>

        <ul className="hairline">
          {preparation.map((point) => (
            <li
              key={point.cle}
              className="hairline-b flex flex-wrap items-start justify-between gap-4 py-3.5"
            >
              <div className="min-w-0 max-w-[62ch]">
                <p className="text-sm">
                  <span
                    aria-hidden
                    className="mr-3 font-mono text-xs opacity-60"
                  >
                    {point.ok ? "✓" : point.bloquant ? "✗" : "—"}
                  </span>
                  {point.titre}
                  {!point.ok && point.bloquant && (
                    <span className="tag tag-solid ml-3">Bloquant</span>
                  )}
                </p>
                <p className="mt-1.5 pl-7 text-xs leading-relaxed text-[color:var(--color-smoke)]">
                  {point.detail}
                </p>
              </div>

              {!point.ok && point.lien && (
                <Link href={point.lien.href} className="label shrink-0 link-sweep">
                  {point.lien.libelle} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

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
        <div className="mb-6">
          <h2 className="display-lg">Répartition du bénéfice</h2>
          <p className="label-sm mt-2 text-[color:var(--color-smoke)]">
            {currentMonth.label} — {currentMonth.orderCount} vente
            {currentMonth.orderCount > 1 ? "s" : ""}, {formatPrice(currentMonth.netProfit)} de
            bénéfice net
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border-t border-[color:var(--color-hairline)] sm:grid-cols-2">
          <div className="border-b border-[color:var(--color-hairline)] py-6 sm:border-r sm:pr-6">
            <p className="label-sm mb-3 text-[color:var(--color-smoke)]">Ismael</p>
            <p className="display text-[2.4rem] leading-none">
              {formatPrice(currentMonth.ismaelShare)}
            </p>
          </div>
          <div className="border-b border-[color:var(--color-hairline)] py-6 sm:pl-6">
            <p className="label-sm mb-3 text-[color:var(--color-smoke)]">Gabalah</p>
            <p className="display text-[2.4rem] leading-none">
              {formatPrice(currentMonth.gabalahShare)}
            </p>
          </div>
        </div>

        <p className="label-sm mt-4 max-w-[62ch] text-[color:var(--color-smoke)]">
          Bénéfice = prix de vente moins coût de fabrication Printify, remises
          déduites. Le port payé par le client n&apos;est pas compté. Pour les
          commandes passées avant l&apos;activation de ce suivi, le coût
          Printify est repris depuis la fiche produit actuelle quand elle
          existe encore, sinon compté à zéro.
        </p>

        {pastMonths.length > 0 && (
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="hairline-b text-left">
                  <th className="label-sm py-3 pr-4 font-normal text-[color:var(--color-smoke)]">
                    Mois
                  </th>
                  <th className="label-sm py-3 pr-4 font-normal text-[color:var(--color-smoke)]">
                    Ventes
                  </th>
                  <th className="label-sm py-3 pr-4 font-normal text-[color:var(--color-smoke)]">
                    CA brut
                  </th>
                  <th className="label-sm py-3 pr-4 font-normal text-[color:var(--color-smoke)]">
                    CA net
                  </th>
                  <th className="label-sm py-3 pr-4 font-normal text-[color:var(--color-smoke)]">
                    Part Ismael
                  </th>
                  <th className="label-sm py-3 font-normal text-[color:var(--color-smoke)]">
                    Part Gabalah
                  </th>
                </tr>
              </thead>
              <tbody>
                {pastMonths.map((month) => (
                  <tr key={month.key} className="hairline-b">
                    <td className="py-3 pr-4">{month.label}</td>
                    <td className="py-3 pr-4 font-mono">{month.orderCount}</td>
                    <td className="py-3 pr-4 font-mono">{formatPrice(month.grossRevenue)}</td>
                    <td className="py-3 pr-4 font-mono">{formatPrice(month.netProfit)}</td>
                    <td className="py-3 pr-4 font-mono">{formatPrice(month.ismaelShare)}</td>
                    <td className="py-3 font-mono">{formatPrice(month.gabalahShare)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
