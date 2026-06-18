import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { sendRepairStatusEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { REPAIR_STATUSES } from "@/lib/repairValidation";
import type { RepairStatus as PrismaRepairStatus } from "../../../../../../generated/prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRepairStatus(value: string): value is PrismaRepairStatus {
  return REPAIR_STATUSES.includes(value as (typeof REPAIR_STATUSES)[number]);
}

function repairSelect() {
  return {
    id: true,
    proAccountId: true,
    firstName: true,
    lastName: true,
    phone: true,
    email: true,
    deviceType: true,
    brand: true,
    model: true,
    issueDescription: true,
    unlockCodeOrNote: true,
    status: true,
    internalNotes: true,
    readyEmailSent: true,
    archivedAt: true,
    createdAt: true,
    updatedAt: true,
  } as const;
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;
  const repair = await prisma.repair.findUnique({
    where: { id },
    select: repairSelect(),
  });

  if (!repair || (admin.user.proAccountId && repair.proAccountId !== admin.user.proAccountId)) {
    return NextResponse.json({ error: "Reparation introuvable." }, { status: 404 });
  }

  return NextResponse.json({ repair });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
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

  const { id } = await context.params;
  const currentRepair = await prisma.repair.findUnique({
    where: { id },
    select: repairSelect(),
  });

  if (
    !currentRepair ||
    (admin.user.proAccountId && currentRepair.proAccountId !== admin.user.proAccountId)
  ) {
    return NextResponse.json({ error: "Reparation introuvable." }, { status: 404 });
  }

  const data: {
    status?: PrismaRepairStatus;
    internalNotes?: string | null;
    archivedAt?: Date;
  } = {};

  if ("status" in body) {
    if (typeof body.status !== "string" || !isRepairStatus(body.status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    data.status = body.status;
  }

  if ("internalNotes" in body) {
    if (typeof body.internalNotes !== "string") {
      return NextResponse.json({ error: "Notes invalides." }, { status: 400 });
    }

    data.internalNotes = body.internalNotes.trim() || null;
  }

  if ("archived" in body && body.archived === true && !currentRepair.archivedAt) {
    data.archivedAt = new Date();
  }

  const nextStatus = data.status ?? currentRepair.status;
  const statusChanged = Boolean(
    data.status && data.status !== currentRepair.status,
  );
  const shouldSendStatusEmail =
    statusChanged && (nextStatus !== "PRET" || !currentRepair.readyEmailSent);

  let repair = await prisma.repair.update({
    where: { id },
    data,
    select: repairSelect(),
  });

  let statusEmailSentNow = false;

  if (shouldSendStatusEmail) {
    const mailResult = await sendRepairStatusEmail(repair);

    if (mailResult.sent) {
      statusEmailSentNow = true;

      if (nextStatus === "PRET" && !repair.readyEmailSent) {
        repair = await prisma.repair.update({
          where: { id },
          data: { readyEmailSent: true },
          select: repairSelect(),
        });
      }
    }
  }

  return NextResponse.json({
    repair,
    mail: {
      attempted: shouldSendStatusEmail,
      sent: statusEmailSentNow,
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;
  const existingRepair = await prisma.repair.findUnique({
    where: { id },
    select: { id: true, proAccountId: true },
  });

  if (
    !existingRepair ||
    (admin.user.proAccountId && existingRepair.proAccountId !== admin.user.proAccountId)
  ) {
    return NextResponse.json({ error: "Reparation introuvable." }, { status: 404 });
  }

  await prisma.repair.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
