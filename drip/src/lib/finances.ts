import { prisma, safeQuery } from "@/lib/prisma";

const PAID_STATUSES = ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"] as const;

export type MonthlyFinance = {
  /** Clé triable, ex. "2026-08". */
  key: string;
  /** "Août 2026" */
  label: string;
  orderCount: number;
  /** Chiffre d'affaires brut : le total encaissé, port compris. */
  grossRevenue: number;
  /** Bénéfice : prix de vente moins coût de fabrication Printify, remises déduites. */
  netProfit: number;
  ismaelShare: number;
  gabalahShare: number;
};

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function split(netProfit: number) {
  const ismaelShare = Math.floor(netProfit / 2);
  return { ismaelShare, gabalahShare: netProfit - ismaelShare };
}

/**
 * Bénéfice partagé 50/50 entre les deux associés, mois par mois.
 *
 * Le bénéfice d'une commande est la somme, pour chaque ligne, du prix de
 * vente moins ce que Printify facture pour la fabriquer — moins la remise
 * éventuelle, qui réduit ce qui reste vraiment. Le port payé par le client
 * n'entre pas dans ce calcul : ce n'est pas une marge sur une pièce vendue.
 *
 * Le coût Printify est celui figé sur la ligne de commande au moment de la
 * vente ; s'il manque (commande passée avant l'activation de ce suivi), on
 * reprend le coût actuel de la variante, et à défaut zéro — la ligne compte
 * alors comme entièrement bénéficiaire plutôt que d'inventer un coût.
 */
export async function getMonthlyFinances(): Promise<MonthlyFinance[]> {
  return safeQuery(
    async () => {
      const orders = await prisma.order.findMany({
        where: { status: { in: [...PAID_STATUSES] } },
        select: {
          total: true,
          discount: true,
          paidAt: true,
          createdAt: true,
          items: {
            select: {
              unitPrice: true,
              quantity: true,
              costPrice: true,
              variant: { select: { cost: true } },
            },
          },
        },
      });

      const byMonth = new Map<
        string,
        { orderCount: number; grossRevenue: number; netProfit: number }
      >();

      for (const order of orders) {
        const key = monthKey(order.paidAt ?? order.createdAt);
        const entry = byMonth.get(key) ?? { orderCount: 0, grossRevenue: 0, netProfit: 0 };

        const margin = order.items.reduce((sum, item) => {
          const cost = item.costPrice ?? item.variant?.cost ?? 0;
          return sum + (item.unitPrice - cost) * item.quantity;
        }, 0);

        entry.orderCount += 1;
        entry.grossRevenue += order.total;
        entry.netProfit += margin - order.discount;

        byMonth.set(key, entry);
      }

      return Array.from(byMonth.entries())
        .sort(([a], [b]) => (a < b ? 1 : -1))
        .map(([key, entry]) => ({
          key,
          label: monthLabel(key),
          orderCount: entry.orderCount,
          grossRevenue: entry.grossRevenue,
          netProfit: entry.netProfit,
          ...split(entry.netProfit),
        }));
    },
    [],
    "bilan mensuel",
  );
}

/** Le mois en cours, même sans aucune vente : les deux cases ne doivent
 *  jamais afficher le mois précédent sous une étiquette trompeuse. */
export function currentMonthFinance(months: MonthlyFinance[]): MonthlyFinance {
  const key = monthKey(new Date());
  return (
    months.find((month) => month.key === key) ?? {
      key,
      label: monthLabel(key),
      orderCount: 0,
      grossRevenue: 0,
      netProfit: 0,
      ismaelShare: 0,
      gabalahShare: 0,
    }
  );
}
