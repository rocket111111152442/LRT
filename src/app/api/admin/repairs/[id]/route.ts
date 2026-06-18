import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import {
  sendQuoteEmail,
  sendRepairStatusEmail,
  sendReviewRequestEmail,
} from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { addRepairEvent } from "@/lib/repairEvents";
import { PART_STATUSES, REPAIR_STATUSES } from "@/lib/repairValidation";
import { sendReadyRepairSms } from "@/lib/sms";
import type {
  PartStatus as PrismaPartStatus,
  RepairStatus as PrismaRepairStatus,
} from "../../../../../../generated/prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRepairStatus(value: string): value is PrismaRepairStatus {
  return REPAIR_STATUSES.includes(value as (typeof REPAIR_STATUSES)[number]);
}

function isPartStatus(value: string): value is PrismaPartStatus {
  return PART_STATUSES.includes(value as (typeof PART_STATUSES)[number]);
}

function isImageDataUrl(value: string) {
  return /^data:image\/(png|jpeg|jpg|webp);base64,/.test(value);
}

function readOptionalText(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalCents(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return undefined;
  }

  return Math.round(numberValue);
}

function readPhotos(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  const photos = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (photos.some((photo) => !isImageDataUrl(photo) || photo.length > 700000)) {
    return null;
  }

  return photos;
}

function newQuoteToken() {
  return randomBytes(24).toString("base64url");
}

function repairSelect() {
  return {
    id: true,
    proAccountId: true,
    ticketNumber: true,
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
    smsReadySent: true,
    reviewEmailSent: true,
    readyReminderSentAt: true,
    estimatedPriceCents: true,
    quoteStatus: true,
    quoteToken: true,
    quoteSentAt: true,
    quoteRespondedAt: true,
    photos: true,
    customerDropOffSignature: true,
    customerPickupSignature: true,
    partsStatus: true,
    partsDescription: true,
    archivedAt: true,
    createdAt: true,
    updatedAt: true,
  } as const;
}

async function getEvents(repairId: string) {
  return prisma.repairEvent.findMany({
    where: { repairId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      message: true,
      createdAt: true,
    },
  });
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

  return NextResponse.json({ repair, events: await getEvents(repair.id) });
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

  const data: Record<string, unknown> = {};

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

  if ("estimatedPriceCents" in body) {
    const estimatedPriceCents = readOptionalCents(body, "estimatedPriceCents");

    if (estimatedPriceCents === undefined) {
      return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
    }

    data.estimatedPriceCents = estimatedPriceCents;
  }

  if ("partsStatus" in body) {
    if (typeof body.partsStatus !== "string" || !isPartStatus(body.partsStatus)) {
      return NextResponse.json({ error: "Statut piece invalide." }, { status: 400 });
    }

    data.partsStatus = body.partsStatus;
  }

  if ("partsDescription" in body) {
    data.partsDescription = readOptionalText(body, "partsDescription") || null;
  }

  if ("photos" in body) {
    const photos = readPhotos(body.photos);

    if (!photos) {
      return NextResponse.json({ error: "Photos invalides." }, { status: 400 });
    }

    data.photos = photos;
  }

  if ("customerDropOffSignature" in body) {
    const signature = readOptionalText(body, "customerDropOffSignature");

    if (signature && (!isImageDataUrl(signature) || signature.length > 300000)) {
      return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
    }

    data.customerDropOffSignature = signature || null;
  }

  if ("customerPickupSignature" in body) {
    const signature = readOptionalText(body, "customerPickupSignature");

    if (signature && (!isImageDataUrl(signature) || signature.length > 300000)) {
      return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
    }

    data.customerPickupSignature = signature || null;
  }

  if ("archived" in body && body.archived === true && !currentRepair.archivedAt) {
    data.archivedAt = new Date();
  }

  const sendQuote = body.sendQuote === true;

  if (sendQuote) {
    const quotePrice =
      "estimatedPriceCents" in data
        ? (data.estimatedPriceCents as number | null)
        : currentRepair.estimatedPriceCents;

    if (!quotePrice || quotePrice <= 0) {
      return NextResponse.json(
        { error: "Ajoutez un prix estime avant d'envoyer le devis." },
        { status: 400 },
      );
    }

    data.quoteToken = currentRepair.quoteToken ?? newQuoteToken();
    data.quoteStatus = "SENT";
    data.quoteSentAt = new Date();
  }

  const nextStatus = (data.status as PrismaRepairStatus | undefined) ?? currentRepair.status;
  const statusChanged = Boolean(data.status && data.status !== currentRepair.status);
  const notesChanged =
    "internalNotes" in data &&
    (data.internalNotes ?? null) !== (currentRepair.internalNotes ?? null);
  const shouldSendStatusEmail =
    statusChanged && (nextStatus !== "PRET" || !currentRepair.readyEmailSent);
  const shouldSendReadySms =
    statusChanged && nextStatus === "PRET" && !currentRepair.smsReadySent;
  const shouldSendReviewEmail =
    statusChanged && nextStatus === "RECUPERE" && !currentRepair.reviewEmailSent;

  let repair = await prisma.repair.update({
    where: { id },
    data,
    select: repairSelect(),
  });

  if (statusChanged) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "STATUS_CHANGED",
      message: `Statut change : ${currentRepair.status} -> ${nextStatus}.`,
    });
  }

  if (notesChanged) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "NOTES_UPDATED",
      message: "Notes internes mises a jour.",
    });
  }

  if (
    "estimatedPriceCents" in data &&
    data.estimatedPriceCents !== currentRepair.estimatedPriceCents
  ) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "PRICE_UPDATED",
      message: "Prix estime mis a jour.",
    });
  }

  if (
    ("partsStatus" in data && data.partsStatus !== currentRepair.partsStatus) ||
    ("partsDescription" in data &&
      data.partsDescription !== (currentRepair.partsDescription ?? null))
  ) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "PARTS_UPDATED",
      message: "Informations de piece mises a jour.",
    });
  }

  if ("photos" in data) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "PHOTOS_UPDATED",
      message: "Photos de l'appareil mises a jour.",
    });
  }

  if (
    "customerDropOffSignature" in data ||
    "customerPickupSignature" in data
  ) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "SIGNATURE_UPDATED",
      message: "Signature client mise a jour.",
    });
  }

  if ("archivedAt" in data) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "ARCHIVED",
      message: "Reparation archivee.",
    });
  }

  if (sendQuote && repair.estimatedPriceCents && repair.quoteToken) {
    const quoteMail = await sendQuoteEmail({
      ...repair,
      estimatedPriceCents: repair.estimatedPriceCents,
      quoteToken: repair.quoteToken,
    });

    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: quoteMail.sent ? "QUOTE_SENT" : "QUOTE_EMAIL_FAILED",
      message: quoteMail.sent
        ? "Devis envoye au client."
        : "Le devis a ete enregistre mais l'email n'est pas parti.",
    });
  }

  let statusEmailSentNow = false;
  let smsSentNow = false;
  let reviewEmailSentNow = false;

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

      await addRepairEvent({
        repairId: repair.id,
        proAccountId: repair.proAccountId,
        type: "EMAIL_SENT",
        message: `Email envoye pour le statut ${nextStatus}.`,
      });
    }
  }

  if (shouldSendReadySms) {
    const smsResult = await sendReadyRepairSms(repair);

    if (smsResult.sent) {
      smsSentNow = true;
      repair = await prisma.repair.update({
        where: { id },
        data: { smsReadySent: true },
        select: repairSelect(),
      });

      await addRepairEvent({
        repairId: repair.id,
        proAccountId: repair.proAccountId,
        type: "SMS_SENT",
        message: "SMS pret envoye au client.",
      });
    }
  }

  if (shouldSendReviewEmail) {
    const reviewResult = await sendReviewRequestEmail(repair);

    if (reviewResult.sent) {
      reviewEmailSentNow = true;
      repair = await prisma.repair.update({
        where: { id },
        data: { reviewEmailSent: true },
        select: repairSelect(),
      });

      await addRepairEvent({
        repairId: repair.id,
        proAccountId: repair.proAccountId,
        type: "REVIEW_EMAIL_SENT",
        message: "Demande d'avis client envoyee.",
      });
    }
  }

  return NextResponse.json({
    repair,
    events: await getEvents(repair.id),
    mail: {
      attempted: shouldSendStatusEmail,
      sent: statusEmailSentNow,
      quoteAttempted: sendQuote,
      smsAttempted: shouldSendReadySms,
      smsSent: smsSentNow,
      reviewAttempted: shouldSendReviewEmail,
      reviewSent: reviewEmailSentNow,
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
