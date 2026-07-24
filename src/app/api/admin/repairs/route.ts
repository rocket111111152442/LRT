import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REPAIR_STATUSES, validateRepairInput } from "@/lib/repairValidation";
import { addRepairEvent } from "@/lib/repairEvents";
import { generateTicketNumber } from "@/lib/repairTickets";
import { encryptSecret } from "@/lib/secretEncryption";
import type { RepairStatus as PrismaRepairStatus } from "../../../../../generated/prisma/client";

function isRepairStatus(value: string): value is PrismaRepairStatus {
  return REPAIR_STATUSES.includes(value as (typeof REPAIR_STATUSES)[number]);
}

export async function GET(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status")?.trim();

  if (status && !isRepairStatus(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const statusFilter: PrismaRepairStatus | undefined =
    status && isRepairStatus(status) ? status : undefined;

  const repairs = await prisma.repair.findMany({
    where: {
      proAccountId: admin.user.proAccountId,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { brand: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
              { storageLocation: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ticketNumber: true,
        firstName: true,
        lastName: true,
      phone: true,
      email: true,
      deviceType: true,
      brand: true,
      model: true,
      status: true,
      urgent: true,
      technicianName: true,
      storageLocation: true,
      expectedPickupAt: true,
      estimatedPriceCents: true,
      partsCostCents: true,
      paidAmountCents: true,
      paymentStatus: true,
      customerType: true,
      quoteStatus: true,
      quoteRespondedAt: true,
      readyEmailSent: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ repairs });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: { firstName: "Le corps de la requete doit etre en JSON." } },
      { status: 400 },
    );
  }

  const validation = validateRepairInput(body);

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  try {
    const repairData = { ...validation.data };
    delete repairData.customerDropOffSignature;
    delete repairData.requestedAppointmentAt;
    delete repairData.wantsPriceBeforeDeposit;
    const expressMode = body && typeof body === "object" && "expressMode" in body
      ? (body as Record<string, unknown>).expressMode === true
      : false;
    const urgent = body && typeof body === "object" && "urgent" in body
      ? (body as Record<string, unknown>).urgent === true
      : false;
    const storageLocation =
      body && typeof body === "object" && "storageLocation" in body
        ? String((body as Record<string, unknown>).storageLocation ?? "").trim() || null
        : null;

    if (storageLocation && storageLocation.length > 200) {
      return NextResponse.json(
        { error: "Emplacement de stockage trop long." },
        { status: 400 },
      );
    }

    const repair = await prisma.repair.create({
      data: {
        ...repairData,
        unlockCodeOrNote: encryptSecret(repairData.unlockCodeOrNote),
        proAccountId: admin.user.proAccountId,
        ticketNumber: await generateTicketNumber(),
        status: "PAS_ENCORE_EN_REPARATION",
        expressMode,
        urgent,
        storageLocation,
      },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        createdAt: true,
      },
    });

    await addRepairEvent({
      repairId: repair.id,
      proAccountId: admin.user.proAccountId,
      type: "CREATED",
      message: expressMode
        ? "Reparation express creee depuis l'admin."
        : "Reparation creee manuellement depuis l'admin.",
    });

    if (validation.data.photos && validation.data.photos.length > 0) {
      await addRepairEvent({
        repairId: repair.id,
        proAccountId: admin.user.proAccountId,
        type: "PHOTOS_ADDED",
        message: "Photos de depot ajoutees.",
      });
    }

    return NextResponse.json({ repair }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "La reparation n'a pas pu etre creee." },
      { status: 500 },
    );
  }
}
