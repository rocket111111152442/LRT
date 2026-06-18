import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const repairs = await prisma.repair.findMany({
    where: {
      ...(admin.user.proAccountId ? { proAccountId: admin.user.proAccountId } : {}),
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
      quoteStatus: true,
      estimatedPriceCents: true,
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
      "devis",
      "prix_estime_eur",
      "piece",
      "cree_le",
      "mis_a_jour_le",
    ],
    ...repairs.map((repair) => [
      repair.ticketNumber,
      repair.firstName,
      repair.lastName,
      repair.phone,
      repair.email,
      repair.deviceType,
      repair.brand,
      repair.model,
      repair.status,
      repair.quoteStatus,
      repair.estimatedPriceCents ? (repair.estimatedPriceCents / 100).toFixed(2) : "",
      repair.partsStatus,
      repair.createdAt.toISOString(),
      repair.updatedAt.toISOString(),
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
