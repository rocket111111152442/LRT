import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const proAccountId = admin.user.proAccountId;
  if (!proAccountId) {
    return NextResponse.json({ error: "Compte pro introuvable." }, { status: 404 });
  }

  const [
    account,
    repairs,
    repairEvents,
    inventoryItems,
    accountingSettings,
    accountingSales,
    accountingExpenses,
    accountingEmployees,
    accountingPayrollEntries,
  ] = await Promise.all([
    prisma.proAccount.findUnique({
      where: { id: proAccountId },
      select: { id: true, companyName: true, ownerEmail: true },
    }),
    prisma.repair.findMany({
      where: { proAccountId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.repairEvent.findMany({
      where: { proAccountId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inventoryItem.findMany({
      where: { proAccountId },
      orderBy: { name: "asc" },
    }),
    prisma.accountingSettings.findUnique({ where: { proAccountId } }),
    prisma.accountingSale.findMany({
      where: { proAccountId },
      orderBy: { soldAt: "desc" },
    }),
    prisma.accountingExpense.findMany({
      where: { proAccountId },
      orderBy: { spentAt: "desc" },
    }),
    prisma.accountingEmployee.findMany({
      where: { proAccountId },
      orderBy: { lastName: "asc" },
    }),
    prisma.accountingPayrollEntry.findMany({
      where: { proAccountId },
      orderBy: { periodStart: "desc" },
    }),
  ]);

  if (!account) {
    return NextResponse.json({ error: "Compte pro introuvable." }, { status: 404 });
  }

  return NextResponse.json({
    version: 1,
    generatedAt: new Date().toISOString(),
    account,
    data: {
      repairs,
      repairEvents,
      inventoryItems,
      accountingSettings,
      accountingSales,
      accountingExpenses,
      accountingEmployees,
      accountingPayrollEntries,
    },
  });
}
