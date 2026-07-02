import { NextResponse } from "next/server";
import {
  buildAccountingSummary,
  centsFromDecimal,
  defaultAccountingSettings,
  percentToBps,
  periodRange,
} from "@/lib/accounting";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalText(body: Record<string, unknown>, key: string) {
  const value = readText(body, key);
  return value || null;
}

function readInt(body: Record<string, unknown>, key: string, fallback = 0) {
  const value = Number(body[key] ?? fallback);
  return Number.isInteger(value) ? value : fallback;
}

function readDate(body: Record<string, unknown>, key: string, fallback = new Date()) {
  const value = readText(body, key);

  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function proAccountWhere(proAccountId: string | null) {
  return { proAccountId };
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

function sortByDate<T extends Record<string, unknown>>(
  records: T[],
  field: keyof T,
  direction: "asc" | "desc",
) {
  return [...records].sort((left, right) => {
    const leftTime = toDateValue(left[field])?.getTime() ?? 0;
    const rightTime = toDateValue(right[field])?.getTime() ?? 0;
    return direction === "desc" ? rightTime - leftTime : leftTime - rightTime;
  });
}

function serializeDates<T extends Record<string, unknown>>(
  record: T,
  fields: Array<keyof T>,
) {
  const output = { ...record };

  for (const field of fields) {
    const date = toDateValue(output[field]);

    if (date) {
      output[field] = date.toISOString() as T[keyof T];
    }
  }

  return output;
}

async function getSettings(proAccountId: string | null) {
  const existing = await prisma.accountingSettings.findFirst({
    where: proAccountWhere(proAccountId),
  });

  if (existing) {
    return existing;
  }

  return prisma.accountingSettings.create({
    data: {
      ...defaultAccountingSettings,
      proAccountId,
    },
  });
}

async function buildPayload(proAccountId: string | null, request: Request) {
  const url = new URL(request.url);
  const currentDate = new Date();
  const selectedYear = Number(url.searchParams.get("year") ?? currentDate.getFullYear());
  const selectedMonth = Number(url.searchParams.get("month") ?? currentDate.getMonth() + 1);
  const period = periodRange(selectedYear, selectedMonth);
  const where = proAccountWhere(proAccountId);

  const [settings, allRepairs, allSales, allExpenses, employees, allPayrollEntries] =
    await Promise.all([
      getSettings(proAccountId),
      prisma.repair.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          ticketNumber: true,
          firstName: true,
          lastName: true,
          paidAmountCents: true,
          depositCents: true,
          estimatedPriceCents: true,
          partsCostCents: true,
          paymentStatus: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.accountingSale.findMany({
        where,
        orderBy: { soldAt: "desc" },
      }),
      prisma.accountingExpense.findMany({
        where,
        orderBy: { spentAt: "desc" },
      }),
      prisma.accountingEmployee.findMany({
        where,
        orderBy: { lastName: "asc" },
      }),
      prisma.accountingPayrollEntry.findMany({
        where,
        orderBy: { periodStart: "desc" },
      }),
    ]);
  const repairs = sortByDate(
    allRepairs.filter((repair) => isInPeriod(repair.createdAt, period)),
    "createdAt",
    "desc",
  );
  const sales = sortByDate(
    allSales.filter((sale) => isInPeriod(sale.soldAt, period)),
    "soldAt",
    "desc",
  );
  const expenses = sortByDate(
    allExpenses.filter((expense) => isInPeriod(expense.spentAt, period)),
    "spentAt",
    "desc",
  );
  const payrollEntries = sortByDate(
    allPayrollEntries.filter((entry) => isInPeriod(entry.periodStart, period)),
    "periodStart",
    "desc",
  );

  const summary = buildAccountingSummary({
    settings,
    repairs,
    sales,
    expenses,
    payrollEntries,
  });

  return {
    period: {
      year: period.year,
      month: period.month,
      start: period.start.toISOString(),
      end: period.end.toISOString(),
    },
    settings: serializeDates(settings, ["createdAt", "updatedAt"]),
    repairs: repairs.map((repair) =>
      serializeDates(repair, ["createdAt"]),
    ),
    sales: sales.map((sale) =>
      serializeDates(sale, ["soldAt", "createdAt", "updatedAt"]),
    ),
    expenses: expenses.map((expense) =>
      serializeDates(expense, ["spentAt", "createdAt", "updatedAt"]),
    ),
    employees,
    payrollEntries: payrollEntries.map((entry) =>
      serializeDates(entry, ["periodStart", "periodEnd", "createdAt", "updatedAt"]),
    ),
    summary,
  };
}

export async function GET(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const payload = await buildPayload(admin.user.proAccountId, request);
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json().catch(() => null);

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const action = readText(body, "action");
  const proAccountId = admin.user.proAccountId;

  if (action === "settings") {
    const settings = await getSettings(proAccountId);
    const updated = await prisma.accountingSettings.update({
      where: { id: settings.id },
      data: {
        country: readText(body, "country") || defaultAccountingSettings.country,
        currency:
          readText(body, "currency").toUpperCase().slice(0, 3) ||
          defaultAccountingSettings.currency,
        vatEnabled: body.vatEnabled !== false,
        defaultVatRateBps: percentToBps(
          body.defaultVatRatePercent,
          defaultAccountingSettings.defaultVatRateBps,
        ),
        incomeTaxRateBps: percentToBps(
          body.incomeTaxRatePercent,
          defaultAccountingSettings.incomeTaxRateBps,
        ),
        socialContributionRateBps: percentToBps(
          body.socialContributionRatePercent,
          defaultAccountingSettings.socialContributionRateBps,
        ),
        employerContributionRateBps: percentToBps(
          body.employerContributionRatePercent,
          defaultAccountingSettings.employerContributionRateBps,
        ),
        fiscalYearStartMonth: Math.min(
          Math.max(readInt(body, "fiscalYearStartMonth", 1), 1),
          12,
        ),
        notes: readOptionalText(body, "notes"),
      },
    });

    return NextResponse.json({ settings: updated });
  }

  if (action === "sale") {
    const label = readText(body, "label");
    const quantity = Math.max(readInt(body, "quantity", 1), 1);
    const unitPriceCents = centsFromDecimal(body.unitPrice);
    const unitCostCents = centsFromDecimal(body.unitCost);
    const inventoryItemId = readText(body, "inventoryItemId");

    if (!label || unitPriceCents <= 0) {
      return NextResponse.json(
        { error: "Nom et prix de vente requis." },
        { status: 400 },
      );
    }

    // Vente liée à un article du stock : on vérifie la disponibilité puis on
    // décrémente. Si la quantité tombe à 0, l'article disparaît du stock.
    let stockRemoved = false;
    if (inventoryItemId) {
      const item = await prisma.inventoryItem.findUnique({
        where: { id: inventoryItemId },
        select: { id: true, proAccountId: true, quantity: true },
      });

      if (!item || (proAccountId && item.proAccountId !== proAccountId)) {
        return NextResponse.json({ error: "Article de stock introuvable." }, { status: 404 });
      }

      if (item.quantity < quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant : ${item.quantity} en stock, ${quantity} demandé(s).` },
          { status: 400 },
        );
      }

      const remaining = item.quantity - quantity;
      if (remaining <= 0) {
        await prisma.inventoryItem.delete({ where: { id: item.id } });
        stockRemoved = true;
      } else {
        await prisma.inventoryItem.update({
          where: { id: item.id },
          data: { quantity: remaining },
        });
      }
    }

    const sale = await prisma.accountingSale.create({
      data: {
        proAccountId,
        soldAt: readDate(body, "soldAt"),
        customerName: readOptionalText(body, "customerName"),
        label,
        category: readText(body, "category") || "AUTRE",
        quantity,
        unitPriceCents,
        unitCostCents,
        vatRateBps: percentToBps(body.vatRatePercent, 2000),
        paymentMethod: readOptionalText(body, "paymentMethod"),
        notes: readOptionalText(body, "notes"),
        inventoryItemId: inventoryItemId || null,
      },
    });

    return NextResponse.json({ sale, stockRemoved }, { status: 201 });
  }

  if (action === "expense") {
    const label = readText(body, "label");
    const amountCents = centsFromDecimal(body.amount);
    const deductibleVatCents = centsFromDecimal(body.deductibleVat);

    if (!label || amountCents <= 0) {
      return NextResponse.json(
        { error: "Nom et montant requis." },
        { status: 400 },
      );
    }

    const expense = await prisma.accountingExpense.create({
      data: {
        proAccountId,
        spentAt: readDate(body, "spentAt"),
        label,
        category: readText(body, "category") || "AUTRE",
        amountCents,
        deductibleVatCents,
        supplier: readOptionalText(body, "supplier"),
        notes: readOptionalText(body, "notes"),
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  }

  if (action === "employee") {
    const firstName = readText(body, "firstName");
    const lastName = readText(body, "lastName");

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Prenom et nom requis." },
        { status: 400 },
      );
    }

    const employee = await prisma.accountingEmployee.create({
      data: {
        proAccountId,
        firstName,
        lastName,
        role: readOptionalText(body, "role"),
        contractType: readOptionalText(body, "contractType"),
        grossMonthlySalaryCents: centsFromDecimal(body.grossMonthlySalary),
        employerContributionRateBps: percentToBps(body.employerContributionRatePercent, 4200),
        active: body.active !== false,
      },
    });

    return NextResponse.json({ employee }, { status: 201 });
  }

  if (action === "payroll") {
    const employeeId = readText(body, "employeeId");
    const employee = await prisma.accountingEmployee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.proAccountId !== proAccountId) {
      return NextResponse.json({ error: "Employe introuvable." }, { status: 404 });
    }

    const settings = await getSettings(proAccountId);
    const grossSalaryCents = centsFromDecimal(body.grossSalary);
    const rateBps =
      employee.employerContributionRateBps ??
      settings.employerContributionRateBps;
    const employerContributionsCents =
      body.employerContributions === "" || body.employerContributions === undefined
        ? Math.round((grossSalaryCents * rateBps) / 10000)
        : centsFromDecimal(body.employerContributions);
    const netPaidCents = centsFromDecimal(body.netPaid);

    if (grossSalaryCents <= 0 || netPaidCents <= 0) {
      return NextResponse.json(
        { error: "Salaire brut et net paye requis." },
        { status: 400 },
      );
    }

    const payroll = await prisma.accountingPayrollEntry.create({
      data: {
        proAccountId,
        employeeId,
        periodStart: readDate(body, "periodStart"),
        periodEnd: readDate(body, "periodEnd"),
        grossSalaryCents,
        employerContributionsCents,
        netPaidCents,
        notes: readOptionalText(body, "notes"),
      },
    });

    return NextResponse.json({ payroll }, { status: 201 });
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const id = url.searchParams.get("id");
  const proAccountId = admin.user.proAccountId;

  if (!id) {
    return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
  }

  if (kind === "sale") {
    const sale = await prisma.accountingSale.findUnique({ where: { id } });

    if (!sale || sale.proAccountId !== proAccountId) {
      return NextResponse.json({ error: "Vente introuvable." }, { status: 404 });
    }

    await prisma.accountingSale.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  if (kind === "expense") {
    const expense = await prisma.accountingExpense.findUnique({ where: { id } });

    if (!expense || expense.proAccountId !== proAccountId) {
      return NextResponse.json({ error: "Depense introuvable." }, { status: 404 });
    }

    await prisma.accountingExpense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  if (kind === "employee") {
    const employee = await prisma.accountingEmployee.findUnique({ where: { id } });

    if (!employee || employee.proAccountId !== proAccountId) {
      return NextResponse.json({ error: "Employe introuvable." }, { status: 404 });
    }

    await prisma.accountingEmployee.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({ ok: true });
  }

  if (kind === "payroll") {
    const payroll = await prisma.accountingPayrollEntry.findUnique({ where: { id } });

    if (!payroll || payroll.proAccountId !== proAccountId) {
      return NextResponse.json({ error: "Paie introuvable." }, { status: 404 });
    }

    await prisma.accountingPayrollEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Type inconnu." }, { status: 400 });
}
