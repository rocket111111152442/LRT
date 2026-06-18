import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRepairCreatedEmail } from "@/lib/mail";
import { addRepairEvent } from "@/lib/repairEvents";
import { generateTicketNumber } from "@/lib/repairTickets";
import { validateRepairInput } from "@/lib/repairValidation";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: { firstName: "Le corps de la requête doit être en JSON." } },
      { status: 400 },
    );
  }

  const validation = validateRepairInput(body);

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  try {
    let proAccountId: string | undefined;

    if (isRecord(body) && typeof body.proAccountSlug === "string" && body.proAccountSlug.trim()) {
      const proAccount = await prisma.proAccount.findUnique({
        where: { slug: body.proAccountSlug.trim() },
        select: {
          id: true,
          paymentStatus: true,
        },
      });

      if (!proAccount || proAccount.paymentStatus !== "PAID") {
        return NextResponse.json(
          { error: "Ce compte pro n'est pas actif." },
          { status: 400 },
        );
      }

      proAccountId = proAccount.id;
    }

    const repair = await prisma.repair.create({
      data: {
        ...validation.data,
        proAccountId,
        ticketNumber: await generateTicketNumber(),
        status: "PAS_ENCORE_EN_REPARATION",
      },
      select: {
        id: true,
        ticketNumber: true,
        firstName: true,
        email: true,
        deviceType: true,
        brand: true,
        model: true,
        status: true,
        createdAt: true,
      },
    });

    await addRepairEvent({
      repairId: repair.id,
      proAccountId,
      type: "CREATED",
      message: "Reparation creee depuis le formulaire client.",
    });

    if (validation.data.photos && validation.data.photos.length > 0) {
      await addRepairEvent({
        repairId: repair.id,
        proAccountId,
        type: "PHOTOS_ADDED",
        message: "Photos de depot ajoutees.",
      });
    }

    if (validation.data.customerDropOffSignature) {
      await addRepairEvent({
        repairId: repair.id,
        proAccountId,
        type: "DROP_OFF_SIGNATURE_ADDED",
        message: "Signature client au depot ajoutee.",
      });
    }

    const mailResult = await sendRepairCreatedEmail(repair);

    await addRepairEvent({
      repairId: repair.id,
      proAccountId,
      type: mailResult.sent ? "EMAIL_SENT" : "EMAIL_SKIPPED",
      message: mailResult.sent
        ? "Email de ticket envoye au client."
        : "Email de ticket non envoye. Verifiez la configuration SMTP si besoin.",
    });

    return NextResponse.json({ repair }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "La réparation n'a pas pu être créée." },
      { status: 500 },
    );
  }
}
