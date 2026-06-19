import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addRepairEvent } from "@/lib/repairEvents";

type RouteContext = {
  params: Promise<{ token: string }>;
};

function reviewSelect() {
  return {
    id: true,
    proAccountId: true,
    ticketNumber: true,
    firstName: true,
    lastName: true,
    deviceType: true,
    brand: true,
    model: true,
    status: true,
    reviewToken: true,
    reviewRespondedAt: true,
    satisfactionRating: true,
    satisfactionComment: true,
  } as const;
}

async function getRepair(token: string) {
  return prisma.repair.findUnique({
    where: { reviewToken: token },
    select: reviewSelect(),
  });
}

function normalizeComment(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const comment = value.trim();
  return comment ? comment.slice(0, 1000) : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const repair = await getRepair(token);

  if (!repair) {
    return NextResponse.json({ error: "Lien d'avis introuvable." }, { status: 404 });
  }

  return NextResponse.json({ repair });
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const body = await request.json().catch(() => null);

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const rating = Number((body as Record<string, unknown>).rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Choisissez une note entre 1 et 5." },
      { status: 400 },
    );
  }

  const repair = await getRepair(token);

  if (!repair) {
    return NextResponse.json({ error: "Lien d'avis introuvable." }, { status: 404 });
  }

  if (repair.reviewRespondedAt || repair.satisfactionRating) {
    return NextResponse.json(
      { error: "Votre avis a deja ete enregistre." },
      { status: 409 },
    );
  }

  const updatedRepair = await prisma.repair.update({
    where: { id: repair.id },
    data: {
      satisfactionRating: rating,
      satisfactionComment: normalizeComment((body as Record<string, unknown>).comment),
      reviewRespondedAt: new Date(),
    },
    select: reviewSelect(),
  });

  await addRepairEvent({
    repairId: repair.id,
    proAccountId: repair.proAccountId,
    type: "REVIEW_RECEIVED",
    message: `Avis client recu : ${rating}/5.`,
  });

  return NextResponse.json({ repair: updatedRepair });
}
