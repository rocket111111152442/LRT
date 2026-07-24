import { NextResponse } from "next/server";
import { addRepairEvent } from "@/lib/repairEvents";
import { isProAccountActive } from "@/lib/accountStatus";
import { sendRepairStatusEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { normalizeTicketNumber } from "@/lib/ticketFormat";
import {
  verifyRepairAccessToken,
  verifyRepairEmail,
} from "@/lib/repairAccess";
import { clientIp, rateLimit } from "@/lib/rateLimit";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const limit = rateLimit(
    `repair-deposit:${clientIp(request)}`,
    12,
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const slug = readString(body.proAccountSlug);
  const ticketNumber = normalizeTicketNumber(readString(body.ticketNumber));
  const email = readString(body.email);
  const accessToken = readString(body.accessToken);

  if (!slug) {
    return NextResponse.json({ error: "QR code magasin invalide." }, { status: 400 });
  }

  if (!ticketNumber) {
    return NextResponse.json({ error: "Ticket requis." }, { status: 400 });
  }

  const account = await prisma.proAccount.findUnique({
    where: { slug },
    select: {
      id: true,
      companyName: true,
      paymentStatus: true,
      trialEndsAt: true,
    },
  });

  if (!account || !isProAccountActive(account)) {
    return NextResponse.json({ error: "Magasin introuvable ou inactif." }, { status: 404 });
  }

  const repair = await prisma.repair.findUnique({
    where: { ticketNumber },
    select: {
      id: true,
      proAccountId: true,
      ticketNumber: true,
      firstName: true,
      email: true,
      deviceType: true,
      brand: true,
      model: true,
      status: true,
    },
  });

  if (!repair || repair.proAccountId !== account.id) {
    return NextResponse.json(
      { error: "Ticket introuvable pour ce magasin." },
      { status: 404 },
    );
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

  if (repair.status === "ANNULE") {
    return NextResponse.json(
      { error: "Cette demande est annulee et ne peut pas etre deposee." },
      { status: 400 },
    );
  }

  if (repair.status !== "PAS_ENCORE_RECU_CLIENT") {
    return NextResponse.json({
      ok: true,
      alreadyDeposited: true,
      repair: {
        ticketNumber: repair.ticketNumber,
        status: repair.status,
      },
      message: "Cet appareil est deja marque comme depose ou plus avance.",
    });
  }

  const updatedRepair = await prisma.repair.update({
    where: { id: repair.id },
    data: { status: "PAS_ENCORE_EN_REPARATION" },
    select: {
      id: true,
      proAccountId: true,
      ticketNumber: true,
      firstName: true,
      email: true,
      deviceType: true,
      brand: true,
      model: true,
      status: true,
    },
  });

  await addRepairEvent({
    repairId: updatedRepair.id,
    proAccountId: updatedRepair.proAccountId,
    type: "DROP_OFF_CONFIRMED_BY_QR",
    message: "Depot confirme par scan du QR code magasin.",
    metadata: {
      source: "public_deposit_qr",
      userAgent: request.headers.get("user-agent") ?? "",
      confirmedAt: new Date().toISOString(),
    },
  });

  const mailResult = await sendRepairStatusEmail(updatedRepair);

  await addRepairEvent({
    repairId: updatedRepair.id,
    proAccountId: updatedRepair.proAccountId,
    type: mailResult.sent ? "EMAIL_SENT" : "EMAIL_SKIPPED",
    message: mailResult.sent
      ? "Email de confirmation de depot envoye au client."
      : "Depot confirme. Email non envoye car la configuration SMTP est absente ou indisponible.",
  });

  return NextResponse.json({
    ok: true,
    alreadyDeposited: false,
    repair: {
      ticketNumber: updatedRepair.ticketNumber,
      status: updatedRepair.status,
    },
    message: "Depot confirme. Le statut est passe en pas encore en reparation.",
  });
}
