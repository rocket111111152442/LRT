import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addRepairEvent } from "@/lib/repairEvents";
import {
  verifyRepairAccessToken,
  verifyRepairEmail,
} from "@/lib/repairAccess";
import { clientIp, rateLimit } from "@/lib/rateLimit";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

function isImageDataUrl(value: string) {
  return /^data:image\/png;base64,/.test(value) && value.length <= 300000;
}

export async function POST(request: Request) {
  const limit = rateLimit(
    `repair-signature:${clientIp(request)}`,
    10,
    15 * 60 * 1000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Reessayez plus tard." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const body = await request.json().catch(() => null);

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const ticketNumber =
    typeof body.ticketNumber === "string" ? normalizeTicket(body.ticketNumber) : "";
  const signature =
    typeof body.signature === "string" ? body.signature.trim() : "";
  const accessToken =
    typeof body.accessToken === "string" ? body.accessToken.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!ticketNumber) {
    return NextResponse.json({ error: "Ticket requis." }, { status: 400 });
  }

  if (!isImageDataUrl(signature)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const repair = await prisma.repair.findUnique({
    where: { ticketNumber },
    select: {
      id: true,
      proAccountId: true,
      ticketNumber: true,
      email: true,
      status: true,
      customerPickupSignature: true,
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
      { error: "Verification client invalide." },
      { status: 403 },
    );
  }

  if (!["PRET", "RECUPERE"].includes(repair.status)) {
    return NextResponse.json(
      {
        error:
          "La signature de recuperation sera disponible lorsque l appareil sera pret.",
      },
      { status: 409 },
    );
  }

  if (repair.customerPickupSignature) {
    return NextResponse.json({ error: "La signature est deja enregistree." }, { status: 400 });
  }

  await prisma.repair.update({
    where: { id: repair.id },
    data: { customerPickupSignature: signature },
  });

  await addRepairEvent({
    repairId: repair.id,
    proAccountId: repair.proAccountId,
    type: "PICKUP_SIGNATURE_ADDED",
    message: "Signature client a la recuperation ajoutee.",
  });

  return NextResponse.json({ ok: true });
}
