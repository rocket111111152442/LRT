import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRepairCreatedEmail, sendShopRepairRequestEmail } from "@/lib/mail";
import { hasSlotAt } from "@/lib/shopAvailability";
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
    const storeQrIntake = isRecord(body) && body.storeQrIntake === true;
    let proAccount:
      | {
          id: string;
          companyName: string;
          ownerEmail: string;
          shopEmail: string | null;
          shopOpeningHours: string | null;
          shopSlotDurationMinutes: number;
          shopMaxAppointmentsPerSlot: number;
          paymentStatus: string;
        }
      | null = null;
    let proAccountId: string | undefined;

    if (isRecord(body) && typeof body.proAccountSlug === "string" && body.proAccountSlug.trim()) {
      proAccount = await prisma.proAccount.findUnique({
        where: { slug: body.proAccountSlug.trim() },
        select: {
          id: true,
          companyName: true,
          ownerEmail: true,
          shopEmail: true,
          shopOpeningHours: true,
          shopSlotDurationMinutes: true,
          shopMaxAppointmentsPerSlot: true,
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

    if (storeQrIntake && !proAccountId) {
      return NextResponse.json(
        { error: "Le QR comptoir doit etre lie a un atelier actif." },
        { status: 400 },
      );
    }

    if (storeQrIntake && !validation.data.customerDropOffSignature) {
      return NextResponse.json(
        {
          errors: {
            customerDropOffSignature: "La signature client est requise.",
          },
        },
        { status: 400 },
      );
    }

    const requestedAppointmentAt = validation.data.requestedAppointmentAt
      ? new Date(validation.data.requestedAppointmentAt)
      : null;

    if (requestedAppointmentAt && proAccount) {
      const scheduledRepairs = await prisma.repair.findMany({
        where: {
          proAccountId: proAccount.id,
          archivedAt: null,
          status: { notIn: ["RECUPERE", "ANNULE"] },
          expectedPickupAt: { not: null },
        },
        select: { expectedPickupAt: true },
      });

      const isAvailable = hasSlotAt({
        openingHours: proAccount.shopOpeningHours,
        scheduledDates: scheduledRepairs.map((repair) => repair.expectedPickupAt),
        requestedAt: requestedAppointmentAt,
        slotDurationMinutes: proAccount.shopSlotDurationMinutes,
        maxAppointmentsPerSlot: proAccount.shopMaxAppointmentsPerSlot,
      });

      if (!isAvailable) {
        return NextResponse.json(
          {
            error:
              "Ce creneau n'est plus disponible. Retournez sur la page magasins pour choisir un autre horaire.",
          },
          { status: 409 },
        );
      }
    }

    const repairData = { ...validation.data };
    delete repairData.requestedAppointmentAt;
    delete repairData.wantsPriceBeforeDeposit;

    const repair = await prisma.repair.create({
      data: {
        ...repairData,
        proAccountId,
        ticketNumber: await generateTicketNumber(),
        status:
          proAccountId && !storeQrIntake
            ? "PAS_ENCORE_RECU_CLIENT"
            : "PAS_ENCORE_EN_REPARATION",
        expectedPickupAt: requestedAppointmentAt,
      },
      select: {
        id: true,
        ticketNumber: true,
        firstName: true,
        phone: true,
        email: true,
        deviceType: true,
        brand: true,
        model: true,
        issueDescription: true,
        status: true,
        expectedPickupAt: true,
        createdAt: true,
      },
    });

    await addRepairEvent({
      repairId: repair.id,
      proAccountId,
      type: "CREATED",
      message: storeQrIntake
        ? "Reparation creee depuis le QR comptoir de l'atelier."
        : proAccountId
          ? "Demande client creee depuis la recherche magasin."
          : "Reparation creee depuis le formulaire client.",
    });

    if (validation.data.wantsPriceBeforeDeposit) {
      await addRepairEvent({
        repairId: repair.id,
        proAccountId,
        type: "QUOTE_REQUESTED",
        message: "Le client demande un prix avant de deposer l'appareil.",
      });
    }

    if (requestedAppointmentAt) {
      await addRepairEvent({
        repairId: repair.id,
        proAccountId,
        type: "APPOINTMENT_REQUESTED",
        message: "Creneau demande par le client.",
      });
    }

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

    if (!proAccount || storeQrIntake) {
      const mailResult = await sendRepairCreatedEmail(repair, {
        alreadyDeposited: storeQrIntake,
      });

      await addRepairEvent({
        repairId: repair.id,
        proAccountId,
        type: mailResult.sent ? "EMAIL_SENT" : "EMAIL_SKIPPED",
        message: mailResult.sent
          ? "Email de ticket envoye au client."
          : "Email de ticket non envoye. Verifiez la configuration SMTP si besoin.",
      });
    } else {
      await addRepairEvent({
        repairId: repair.id,
        proAccountId,
        type: "CLIENT_TICKET_PENDING",
        message:
          "Ticket client en attente : il sera envoye apres acceptation du magasin ou acceptation du devis.",
      });
    }

    if (proAccount && !storeQrIntake) {
      const shopMail = await sendShopRepairRequestEmail({
        ...repair,
        shopEmail: proAccount.shopEmail ?? proAccount.ownerEmail,
        shopName: proAccount.companyName,
        requestedAppointmentAt,
        wantsPriceBeforeDeposit: validation.data.wantsPriceBeforeDeposit,
      });

      await addRepairEvent({
        repairId: repair.id,
        proAccountId,
        type: shopMail.sent ? "SHOP_EMAIL_SENT" : "SHOP_EMAIL_SKIPPED",
        message: shopMail.sent
          ? "Email de nouvelle demande envoye au magasin."
          : "Email magasin non envoye. Verifiez la configuration SMTP si besoin.",
      });
    }

    return NextResponse.json(
      {
        repair,
        shopApprovalRequired: Boolean(proAccount) && !storeQrIntake,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "La réparation n'a pas pu être créée." },
      { status: 500 },
    );
  }
}
