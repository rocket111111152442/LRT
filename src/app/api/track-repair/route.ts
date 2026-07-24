import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createRepairAccessToken,
  verifyRepairAccessToken,
  verifyRepairEmail,
} from "@/lib/repairAccess";
import { clientIp, rateLimit } from "@/lib/rateLimit";

function normalizeTicket(value: string) {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (/^QOR\d{6}$/.test(normalized)) {
    return `QOR-${normalized.slice(3)}`;
  }

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
  const limit = rateLimit(
    `track-repair:${clientIp(request)}`,
    20,
    10 * 60 * 1000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop de recherches. Reessayez dans quelques minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const ticketNumber = normalizeTicket(searchParams.get("ticket") ?? "");
  const accessToken = searchParams.get("access");
  const email = searchParams.get("email");

  if (!ticketNumber) {
    return NextResponse.json({ error: "Ticket requis." }, { status: 400 });
  }

  const repair = await prisma.repair.findUnique({
    where: { ticketNumber },
    select: {
      id: true,
      ticketNumber: true,
      proAccountId: true,
      firstName: true,
      email: true,
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

  if (
    !verifyRepairAccessToken(repair, accessToken) &&
    !verifyRepairEmail(repair, email)
  ) {
    return NextResponse.json(
      {
        error:
          "Verification requise. Utilisez le lien recu par email ou saisissez l email du dossier.",
      },
      { status: 403 },
    );
  }

  const verifiedAccessToken = createRepairAccessToken(repair);

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
      accessToken: verifiedAccessToken,
    },
  });
}
