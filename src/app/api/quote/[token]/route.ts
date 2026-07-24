import { NextResponse } from "next/server";
import { sendRepairCreatedEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { addRepairEvent } from "@/lib/repairEvents";
import { clientIp, rateLimit } from "@/lib/rateLimit";

type RouteContext = {
  params: Promise<{ token: string }>;
};

function quoteSelect() {
  return {
    id: true,
    proAccountId: true,
    ticketNumber: true,
    firstName: true,
    lastName: true,
    email: true,
    deviceType: true,
    brand: true,
    model: true,
    status: true,
    estimatedPriceCents: true,
    quoteStatus: true,
    quoteToken: true,
    quoteSentAt: true,
    quoteRespondedAt: true,
  } as const;
}

function publicQuoteRepair(
  repair: Awaited<ReturnType<typeof getRepair>>,
) {
  if (!repair) {
    return null;
  }

  return {
    ticketNumber: repair.ticketNumber,
    firstName: repair.firstName,
    lastName: repair.lastName,
    deviceType: repair.deviceType,
    brand: repair.brand,
    model: repair.model,
    status: repair.status,
    estimatedPriceCents: repair.estimatedPriceCents,
    quoteStatus: repair.quoteStatus,
    quoteSentAt: repair.quoteSentAt,
    quoteRespondedAt: repair.quoteRespondedAt,
  };
}

async function getRepair(token: string) {
  if (!/^[A-Za-z0-9_-]{32}$/.test(token)) {
    return null;
  }

  return prisma.repair.findUnique({
    where: { quoteToken: token },
    select: quoteSelect(),
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const repair = await getRepair(token);

  if (!repair || repair.quoteStatus === "NONE") {
    return NextResponse.json({ error: "Devis introuvable." }, { status: 404 });
  }

  return NextResponse.json({ repair: publicQuoteRepair(repair) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const limit = rateLimit(
    `quote-response:${clientIp(request)}`,
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

  const { token } = await context.params;
  const body = await request.json().catch(() => null);

  if (
    typeof body !== "object" ||
    body === null ||
    !["ACCEPTED", "REFUSED"].includes(String((body as Record<string, unknown>).action))
  ) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const repair = await getRepair(token);

  if (!repair || repair.quoteStatus === "NONE") {
    return NextResponse.json({ error: "Devis introuvable." }, { status: 404 });
  }

  if (repair.quoteStatus === "ACCEPTED" || repair.quoteStatus === "REFUSED") {
    return NextResponse.json({ repair: publicQuoteRepair(repair) });
  }

  const action = String((body as Record<string, unknown>).action) as
    | "ACCEPTED"
    | "REFUSED";

  const updatedRepair = await prisma.repair.update({
    where: { id: repair.id },
    data: {
      quoteStatus: action,
      quoteRespondedAt: new Date(),
      status: action === "ACCEPTED" ? "PAS_ENCORE_RECU_CLIENT" : "ANNULE",
    },
    select: quoteSelect(),
  });

  await addRepairEvent({
    repairId: repair.id,
    proAccountId: repair.proAccountId,
    type: action === "ACCEPTED" ? "QUOTE_ACCEPTED" : "QUOTE_REFUSED",
    message: action === "ACCEPTED" ? "Devis accepte par le client." : "Devis refuse par le client.",
  });

  if (action === "ACCEPTED") {
    const ticketMail = await sendRepairCreatedEmail(updatedRepair);

    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: ticketMail.sent ? "CLIENT_TICKET_SENT" : "CLIENT_TICKET_EMAIL_FAILED",
      message: ticketMail.sent
        ? "Ticket envoye au client apres acceptation du devis."
        : "Le client a accepte le devis mais l'email de ticket n'est pas parti.",
    });
  }

  return NextResponse.json({ repair: publicQuoteRepair(updatedRepair) });
}
