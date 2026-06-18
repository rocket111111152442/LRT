import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const repairs = await prisma.repair.findMany({
    where: {
      ...(admin.user.proAccountId ? { proAccountId: admin.user.proAccountId } : {}),
    },
    select: {
      status: true,
      brand: true,
      estimatedPriceCents: true,
      partsCostCents: true,
    },
  });

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: {
      ...(admin.user.proAccountId ? { proAccountId: admin.user.proAccountId } : {}),
    },
    select: {
      id: true,
      name: true,
      quantity: true,
      lowStockThreshold: true,
      unitCostCents: true,
    },
  });

  const byStatus = repairs.reduce<Record<string, number>>((accumulator, repair) => {
    accumulator[repair.status] = (accumulator[repair.status] ?? 0) + 1;
    return accumulator;
  }, {});

  const byBrand = repairs.reduce<Record<string, number>>((accumulator, repair) => {
    const brand = repair.brand || "Sans marque";
    accumulator[brand] = (accumulator[brand] ?? 0) + 1;
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
  const inventoryValueCents = inventoryItems.reduce(
    (total, item) => total + (item.unitCostCents ?? 0) * item.quantity,
    0,
  );

  return NextResponse.json({
    totalRepairs: repairs.length,
    byStatus,
    byBrand,
    estimatedRevenueCents,
    partsCostCents,
    estimatedProfitCents: Math.max(estimatedRevenueCents - partsCostCents, 0),
    inventoryValueCents,
    lowStockItems: inventoryItems.filter(
      (item) => item.quantity <= item.lowStockThreshold,
    ),
  });
}
