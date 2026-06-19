import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizeTicket(value: string) {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (/^LRT\d{6}$/.test(normalized)) {
    return `LRT-${normalized.slice(3)}`;
  }

  return normalized;
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readDateString(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  return new Date().toISOString();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticketNumber = normalizeTicket(searchParams.get("ticket") ?? "");

  if (!ticketNumber) {
    return NextResponse.json({ error: "Ticket requis." }, { status: 400 });
  }

  const repair = await prisma.repair.findUnique({
    where: { ticketNumber },
    select: {
      ticketNumber: true,
      firstName: true,
      deviceType: true,
      brand: true,
      model: true,
      status: true,
      quoteStatus: true,
      estimatedPriceCents: true,
      paidAmountCents: true,
      paymentStatus: true,
      expectedPickupAt: true,
      warrantyUntil: true,
      customerPickupSignature: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!repair) {
    return NextResponse.json({ error: "Ticket introuvable." }, { status: 404 });
  }

  return NextResponse.json({
    repair: {
      ticketNumber: readString(repair.ticketNumber, ticketNumber),
      firstName: readString(repair.firstName, "-"),
      deviceType: readString(repair.deviceType, "-"),
      brand: readString(repair.brand),
      model: readString(repair.model),
      status: readString(repair.status, "PAS_ENCORE_EN_REPARATION"),
      quoteStatus: readString(repair.quoteStatus, "NONE"),
      estimatedPriceCents: repair.estimatedPriceCents ?? null,
      paidAmountCents: repair.paidAmountCents ?? 0,
      paymentStatus: readString(repair.paymentStatus, "NON_PAYE"),
      expectedPickupAt: repair.expectedPickupAt
        ? readDateString(repair.expectedPickupAt)
        : null,
      warrantyUntil: repair.warrantyUntil ? readDateString(repair.warrantyUntil) : null,
      signatureDone: Boolean(repair.customerPickupSignature),
      updatedAt: readDateString(repair.updatedAt),
    },
  });
}
