import { NextResponse } from "next/server";
import { periodRange } from "@/lib/accounting";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function cents(value: number) {
  return (value / 100).toFixed(2).replace(".", ",");
}

function dateOnly(value: Date | string) {
  const date = toDateValue(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

function toDateValue(value: unknown) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function isInPeriod(value: unknown, period: { start: Date; end: Date }) {
  const date = toDateValue(value);
  return date ? date >= period.start && date < period.end : false;
}

export async function GET(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const url = new URL(request.url);
  const now = new Date();
  const year = Number(url.searchParams.get("year") ?? now.getFullYear());
  const month = Number(url.searchParams.get("month") ?? now.getMonth() + 1);
  const period = periodRange(year, month);
  const where = { proAccountId: admin.user.proAccountId };

  const [allRepairs, allSales, allExpenses, allPayrollEntries] = await Promise.all([
    prisma.repair.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        ticketNumber: true,
        firstName: true,
        lastName: true,
        paidAmountCents: true,
        depositCents: true,
        partsCostCents: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.accountingSale.findMany({
      where,
      orderBy: { soldAt: "asc" },
    }),
    prisma.accountingExpense.findMany({
      where,
      orderBy: { spentAt: "asc" },
    }),
    prisma.accountingPayrollEntry.findMany({
      where,
      orderBy: { periodStart: "asc" },
    }),
  ]);
  const repairs = allRepairs.filter((repair) => isInPeriod(repair.createdAt, period));
  const sales = allSales.filter((sale) => isInPeriod(sale.soldAt, period));
  const expenses = allExpenses.filter((expense) => isInPeriod(expense.spentAt, period));
  const payrollEntries = allPayrollEntries.filter((entry) =>
    isInPeriod(entry.periodStart, period),
  );

  const rows = [
    ["Type", "Date", "Libelle", "Categorie", "Montant EUR", "Cout EUR", "TVA deductible EUR", "Notes"],
    ...repairs.map((repair) => [
      "Reparation",
      dateOnly(repair.createdAt),
      `${repair.ticketNumber ?? ""} ${repair.firstName} ${repair.lastName}`.trim(),
      String(repair.paymentStatus),
      cents(Math.max(repair.paidAmountCents, repair.depositCents, 0)),
      cents(repair.partsCostCents ?? 0),
      "0,00",
      "Depuis les fiches de reparation",
    ]),
    ...sales.map((sale) => [
      "Vente hors reparation",
      dateOnly(sale.soldAt),
      sale.label,
      sale.category,
      cents(sale.quantity * sale.unitPriceCents),
      cents(sale.quantity * sale.unitCostCents),
      "0,00",
      [
        `Qte ${sale.quantity}`,
        `PU ${cents(sale.unitPriceCents)} EUR`,
        `Marge ${cents(sale.quantity * (sale.unitPriceCents - sale.unitCostCents))} EUR`,
        sale.paymentMethod ? `Paiement ${sale.paymentMethod}` : "",
        sale.customerName ? `Client ${sale.customerName}` : "",
        sale.inventoryItemId ? "Vendu depuis le stock" : "",
        sale.notes ?? "",
      ].filter(Boolean).join(" - "),
    ]),
    ...expenses.map((expense) => [
      "Depense",
      dateOnly(expense.spentAt),
      expense.label,
      expense.category,
      `-${cents(expense.amountCents)}`,
      "0,00",
      cents(expense.deductibleVatCents),
      expense.notes ?? "",
    ]),
    ...payrollEntries.map((entry) => [
      "Paie",
      dateOnly(entry.periodStart),
      `Salaire employe ${entry.employeeId}`,
      "SALAIRE",
      `-${cents(entry.grossSalaryCents + entry.employerContributionsCents)}`,
      "0,00",
      "0,00",
      entry.notes ?? "",
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(";")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="qoravo-compta-${period.year}-${String(period.month).padStart(2, "0")}.csv"`,
    },
  });
}
