import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Export complet des donnees du compte (JSON telechargeable).
export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const where = admin.user.proAccountId
    ? { proAccountId: admin.user.proAccountId }
    : {};

  const [repairs, inventory, sales, expenses] = await Promise.all([
    prisma.repair.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.inventoryItem.findMany({ where, orderBy: { name: "asc" } }),
    prisma.accountingSale.findMany({ where, orderBy: { soldAt: "desc" } }).catch(() => []),
    prisma.accountingExpense.findMany({ where, orderBy: { spentAt: "desc" } }).catch(() => []),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    account: admin.user.email,
    counts: {
      repairs: repairs.length,
      inventory: inventory.length,
      sales: Array.isArray(sales) ? sales.length : 0,
      expenses: Array.isArray(expenses) ? expenses.length : 0,
    },
    repairs,
    inventory,
    sales,
    expenses,
  };

  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="qoravo-export-${date}.json"`,
    },
  });
}
