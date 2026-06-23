import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const whereAccount = admin.user.proAccountId
    ? { proAccountId: admin.user.proAccountId }
    : {};

  const [repairs, monthlyRepairsRaw, proAccount, inventoryItems] = await Promise.all([
    prisma.repair.findMany({
      where: whereAccount,
      select: {
        status: true, brand: true, issueDescription: true,
        estimatedPriceCents: true, partsCostCents: true,
        paidAmountCents: true, createdAt: true,
      },
    }),
    // Requête séparée pour le mois courant : évite de tout charger en mémoire
    // sur les gros comptes. Firebase n'a pas de filtre date natif ici donc on
    // refiltre après, mais la sélection de champs est plus légère.
    prisma.repair.findMany({
      where: { ...whereAccount, createdAt: { gte: monthStart } },
      select: {
        estimatedPriceCents: true, partsCostCents: true, paidAmountCents: true, createdAt: true,
      },
    }),
    admin.user.proAccountId
      ? prisma.proAccount.findUnique({
          where: { id: admin.user.proAccountId },
          select: { monthlyGoal: true },
        })
      : Promise.resolve(null),
    prisma.inventoryItem.findMany({
      where: whereAccount,
      select: { id: true, name: true, quantity: true, lowStockThreshold: true, unitCostCents: true },
    }),
  ]);

  // Firebase: le filtre gte peut ne pas fonctionner, on refiltre en JS
  function toDate(v: unknown): Date {
    if (v instanceof Date) return v;
    return new Date(String(v ?? ""));
  }
  const monthlyRepairs = monthlyRepairsRaw.filter(
    (r) => toDate(r.createdAt) >= monthStart,
  );

  const byStatus = repairs.reduce<Record<string, number>>((accumulator, repair) => {
    accumulator[repair.status] = (accumulator[repair.status] ?? 0) + 1;
    return accumulator;
  }, {});

  const byBrand = repairs.reduce<Record<string, number>>((accumulator, repair) => {
    const brand = repair.brand || "Sans marque";
    accumulator[brand] = (accumulator[brand] ?? 0) + 1;
    return accumulator;
  }, {});

  const byIssue = repairs.reduce<Record<string, number>>((accumulator, repair) => {
    const firstWords = repair.issueDescription
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .slice(0, 4)
      .join(" ");
    const issue = firstWords || "sans panne";
    accumulator[issue] = (accumulator[issue] ?? 0) + 1;
    return accumulator;
  }, {});

  const estimatedRevenueCents = repairs.reduce(
    (total, repair) => total + (repair.estimatedPriceCents ?? 0),
    0,
  );
  const partsCostCents = repairs.reduce(
    (total, repair) => total + (repair.partsCostCents ?? 0),
    0,
  );
  const paidRevenueCents = repairs.reduce(
    (total, repair) => total + (repair.paidAmountCents ?? 0),
    0,
  );
  const monthlyRevenueCents = monthlyRepairs.reduce(
    (total, repair) => total + (repair.estimatedPriceCents ?? 0),
    0,
  );
  const monthlyPaidRevenueCents = monthlyRepairs.reduce(
    (total, repair) => total + (repair.paidAmountCents ?? 0),
    0,
  );
  const monthlyPartsCostCents = monthlyRepairs.reduce(
    (total, repair) => total + (repair.partsCostCents ?? 0),
    0,
  );
  const inventoryValueCents = inventoryItems.reduce(
    (total, item) => total + (item.unitCostCents ?? 0) * item.quantity,
    0,
  );

  // Serie des 6 derniers mois (CA encaisse + nombre de reparations).
  const monthLabels = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aou", "Sep", "Oct", "Nov", "Dec"];
  const monthlySeries = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getUTCFullYear(), now.getUTCMonth() - (5 - index), 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const inMonth = repairs.filter((repair) => {
      const created = toDate(repair.createdAt);
      return created.getFullYear() === year && created.getMonth() === month;
    });
    return {
      label: monthLabels[month],
      year,
      count: inMonth.length,
      revenueCents: inMonth.reduce((sum, r) => sum + (r.paidAmountCents ?? 0), 0),
    };
  });

  return NextResponse.json({
    monthlySeries,
    totalRepairs: repairs.length,
    byStatus,
    byBrand,
    byIssue,
    monthlyGoal: proAccount?.monthlyGoal ?? 100,
    monthlyRepairs: monthlyRepairs.length,
    estimatedRevenueCents,
    paidRevenueCents,
    partsCostCents,
    estimatedProfitCents: Math.max(estimatedRevenueCents - partsCostCents, 0),
    realProfitCents: Math.max(paidRevenueCents - partsCostCents, 0),
    monthlyRevenueCents,
    monthlyPaidRevenueCents,
    monthlyPartsCostCents,
    monthlyProfitCents: Math.max(monthlyPaidRevenueCents - monthlyPartsCostCents, 0),
    inventoryValueCents,
    lowStockItems: inventoryItems.filter(
      (item) => item.quantity <= item.lowStockThreshold,
    ),
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  if (!admin.user.proAccountId) {
    return NextResponse.json({ error: "Compte pro introuvable." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const monthlyGoal = Number(body.monthlyGoal);

  if (!Number.isInteger(monthlyGoal) || monthlyGoal < 1 || monthlyGoal > 100000) {
    return NextResponse.json(
      { error: "L'objectif mensuel doit etre un nombre entre 1 et 100000." },
      { status: 400 },
    );
  }

  const proAccount = await prisma.proAccount.update({
    where: { id: admin.user.proAccountId },
    data: { monthlyGoal },
  });

  return NextResponse.json({ monthlyGoal: proAccount.monthlyGoal });
}
