import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REPAIR_STATUSES } from "@/lib/repairValidation";
import type { RepairStatus as PrismaRepairStatus } from "../../../../../../generated/prisma/client";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function isRepairStatus(value: string): value is PrismaRepairStatus {
  return REPAIR_STATUSES.includes(value as (typeof REPAIR_STATUSES)[number]);
}

function safeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function safeCents(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function centsToEuro(value: unknown) {
  const cents = safeCents(value);
  return cents === null ? "" : (cents / 100).toFixed(2);
}

function dateToIso(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  return "";
}

export async function GET(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status")?.trim();
  const month = searchParams.get("month")?.trim();

  if (status && !isRepairStatus(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const statusFilter: PrismaRepairStatus | undefined =
    status && isRepairStatus(status) ? status : undefined;

  const repairs = await prisma.repair.findMany({
    where: {
      ...(admin.user.proAccountId ? { proAccountId: admin.user.proAccountId } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(month && /^\d{4}-\d{2}$/.test(month)
        ? {
            createdAt: {
              gte: new Date(`${month}-01T00:00:00.000Z`),
              lt: new Date(
                new Date(`${month}-01T00:00:00.000Z`).setUTCMonth(
                  new Date(`${month}-01T00:00:00.000Z`).getUTCMonth() + 1,
                ),
              ),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { brand: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      ticketNumber: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      deviceType: true,
      brand: true,
      model: true,
      status: true,
      urgent: true,
      customerType: true,
      quoteStatus: true,
      estimatedPriceCents: true,
      partsCostCents: true,
      paidAmountCents: true,
      depositCents: true,
      paymentStatus: true,
      expectedPickupAt: true,
      warrantyUntil: true,
      technicianName: true,
      timeSpentMinutes: true,
      partsStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const rows = [
    [
      "ticket",
      "prenom",
      "nom",
      "telephone",
      "email",
      "type",
      "marque",
      "modele",
      "statut",
      "urgent",
      "type_client",
      "devis",
      "prix_estime_eur",
      "cout_pieces_eur",
      "benefice_estime_eur",
      "montant_paye_eur",
      "acompte_eur",
      "reste_a_payer_eur",
      "statut_paiement",
      "date_recuperation_prevue",
      "garantie_jusquau",
      "technicien",
      "temps_passe_minutes",
      "piece",
      "cree_le",
      "mis_a_jour_le",
    ],
    ...repairs.map((repair) => [
      safeText(repair.ticketNumber),
      safeText(repair.firstName),
      safeText(repair.lastName),
      safeText(repair.phone),
      safeText(repair.email),
      safeText(repair.deviceType),
      safeText(repair.brand),
      safeText(repair.model),
      safeText(repair.status),
      repair.urgent ? "oui" : "non",
      safeText(repair.customerType),
      safeText(repair.quoteStatus),
      centsToEuro(repair.estimatedPriceCents),
      centsToEuro(repair.partsCostCents),
      safeCents(repair.estimatedPriceCents) !== null
        ? (
            ((safeCents(repair.estimatedPriceCents) ?? 0) -
              (safeCents(repair.partsCostCents) ?? 0)) /
            100
          ).toFixed(2)
        : "",
      centsToEuro(repair.paidAmountCents),
      centsToEuro(repair.depositCents),
      safeCents(repair.estimatedPriceCents) !== null
        ? (
            ((safeCents(repair.estimatedPriceCents) ?? 0) -
              (safeCents(repair.paidAmountCents) ?? 0)) /
            100
          ).toFixed(2)
        : "",
      safeText(repair.paymentStatus),
      dateToIso(repair.expectedPickupAt),
      dateToIso(repair.warrantyUntil),
      safeText(repair.technicianName),
      repair.timeSpentMinutes,
      safeText(repair.partsStatus),
      dateToIso(repair.createdAt),
      dateToIso(repair.updatedAt),
    ]),
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=repairs-lrt.csv",
    },
  });
}
