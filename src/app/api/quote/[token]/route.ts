import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addRepairEvent } from "@/lib/repairEvents";

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

async function getRepair(token: string) {
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

  return NextResponse.json({ repair });
}

export async function PATCH(request: Request, context: RouteContext) {
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
    return NextResponse.json({ repair });
  }

  const action = String((body as Record<string, unknown>).action) as
    | "ACCEPTED"
    | "REFUSED";

  const updatedRepair = await prisma.repair.update({
    where: { id: repair.id },
    data: {
      quoteStatus: action,
      quoteRespondedAt: new Date(),
      ...(action === "ACCEPTED" ? { status: "PAS_ENCORE_RECU_CLIENT" } : {}),
    },
    select: quoteSelect(),
  });

  await addRepairEvent({
    repairId: repair.id,
    proAccountId: repair.proAccountId,
    type: action === "ACCEPTED" ? "QUOTE_ACCEPTED" : "QUOTE_REFUSED",
    message: action === "ACCEPTED" ? "Devis accepte par le client." : "Devis refuse par le client.",
  });

  return NextResponse.json({ repair: updatedRepair });
}
