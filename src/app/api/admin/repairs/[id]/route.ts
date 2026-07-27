import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import {
  sendQuoteEmail,
  sendRepairCreatedEmail,
  sendRepairDelayEmail,
  sendRepairStatusEmail,
  sendReviewRequestEmail,
} from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { addRepairEvent } from "@/lib/repairEvents";
import {
  decryptSecret,
  encryptSecret,
  isEncryptedSecret,
} from "@/lib/secretEncryption";
import { rateLimit } from "@/lib/rateLimit";
import {
  CUSTOMER_TYPES,
  PART_STATUSES,
  REPAIR_PAYMENT_STATUSES,
  REPAIR_STATUSES,
} from "@/lib/repairValidation";
import type {
  CustomerType as PrismaCustomerType,
  Prisma,
  PartStatus as PrismaPartStatus,
  RepairPaymentStatus as PrismaRepairPaymentStatus,
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

function isRepairPaymentStatus(value: string): value is PrismaRepairPaymentStatus {
  return REPAIR_PAYMENT_STATUSES.includes(
    value as (typeof REPAIR_PAYMENT_STATUSES)[number],
  );
}

function isCustomerType(value: string): value is PrismaCustomerType {
  return CUSTOMER_TYPES.includes(value as (typeof CUSTOMER_TYPES)[number]);
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

  if (
    !Number.isFinite(numberValue) ||
    numberValue < 0 ||
    numberValue > 2_000_000_000
  ) {
    return undefined;
  }

  return Math.round(numberValue);
}

function readOptionalInteger(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (value === null || value === "") {
    return 0;
  }

  const numberValue = Number(value);

  if (
    !Number.isInteger(numberValue) ||
    numberValue < 0 ||
    numberValue > 2_000_000_000
  ) {
    return undefined;
  }

  return numberValue;
}

function readOptionalDate(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
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

function newPublicToken() {
  return randomBytes(24).toString("base64url");
}

function newQuoteToken() {
  return newPublicToken();
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
    streetAddress: true,
    postalCode: true,
    city: true,
    deviceType: true,
    brand: true,
    model: true,
    imei: true,
    serialNumber: true,
    issueDescription: true,
    unlockCodeOrNote: true,
    status: true,
    internalNotes: true,
    readyEmailSent: true,
    reviewEmailSent: true,
    reviewToken: true,
    reviewRespondedAt: true,
    readyReminderSentAt: true,
    urgent: true,
    expressMode: true,
    estimatedPriceCents: true,
    partsCostCents: true,
    paidAmountCents: true,
    depositCents: true,
    paymentStatus: true,
    warrantyUntil: true,
    warrantyReturn: true,
    expectedPickupAt: true,
    technicianName: true,
    storageLocation: true,
    timeSpentMinutes: true,
    checklistDiagnostic: true,
    checklistBackup: true,
    checklistFunctionalTest: true,
    checklistCleaning: true,
    customerType: true,
    satisfactionRating: true,
    satisfactionComment: true,
    supplierOrderNote: true,
    partsUsed: true,
    usedInventoryItemId: true,
    usedInventoryItemName: true,
    usedInventoryQuantity: true,
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

type RepairRecord = Prisma.RepairGetPayload<{
  select: ReturnType<typeof repairSelect>;
}>;

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

async function getInventoryItems(proAccountId: string) {
  return prisma.inventoryItem.findMany({
    where: { proAccountId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      quantity: true,
      unitCostCents: true,
    },
  });
}

async function getCustomerHistory(repair: {
  id: string;
  proAccountId: string | null;
  email: string;
  phone: string;
}) {
  return prisma.repair.findMany({
    where: {
      id: { not: repair.id },
      ...(repair.proAccountId ? { proAccountId: repair.proAccountId } : {}),
      OR: [{ email: repair.email }, { phone: repair.phone }],
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      ticketNumber: true,
      deviceType: true,
      brand: true,
      model: true,
      status: true,
      createdAt: true,
    },
  });
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function readNullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readDateString(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

function readDateStringWithFallback(value: unknown) {
  return readDateString(value) ?? new Date().toISOString();
}

function readRepairStatus(value: unknown): PrismaRepairStatus {
  return typeof value === "string" && isRepairStatus(value)
    ? value
    : "PAS_ENCORE_EN_REPARATION";
}

function readPartStatus(value: unknown): PrismaPartStatus {
  return typeof value === "string" && isPartStatus(value) ? value : "NONE";
}

function readRepairPaymentStatus(value: unknown): PrismaRepairPaymentStatus {
  return typeof value === "string" && isRepairPaymentStatus(value)
    ? value
    : "NON_PAYE";
}

function readCustomerType(value: unknown): PrismaCustomerType {
  return typeof value === "string" && isCustomerType(value) ? value : "STANDARD";
}

function readQuoteStatus(value: unknown) {
  return ["NONE", "SENT", "ACCEPTED", "REFUSED"].includes(String(value))
    ? String(value)
    : "NONE";
}

function readPhotosForResponse(value: unknown) {
  return Array.isArray(value)
    ? value.filter((photo): photo is string => typeof photo === "string")
    : [];
}

function normalizeRepairForResponse(value: unknown) {
  const repair = isRecord(value) ? value : {};

  return {
    id: readString(repair.id),
    ticketNumber: readNullableString(repair.ticketNumber),
    firstName: readString(repair.firstName, "-"),
    lastName: readString(repair.lastName),
    phone: readString(repair.phone, "-"),
    email: readString(repair.email, "-"),
    streetAddress: readNullableString(repair.streetAddress),
    postalCode: readNullableString(repair.postalCode),
    city: readNullableString(repair.city),
    deviceType: readString(repair.deviceType, "-"),
    brand: readString(repair.brand),
    model: readString(repair.model),
    imei: readNullableString(repair.imei),
    serialNumber: readNullableString(repair.serialNumber),
    issueDescription: readString(repair.issueDescription, "-"),
    unlockCodeOrNote:
      decryptSecret(readNullableString(repair.unlockCodeOrNote)) || null,
    status: readRepairStatus(repair.status),
    internalNotes: readNullableString(repair.internalNotes),
    readyEmailSent: readBoolean(repair.readyEmailSent),
    reviewEmailSent: readBoolean(repair.reviewEmailSent),
    reviewRespondedAt: readDateString(repair.reviewRespondedAt),
    readyReminderSentAt: readDateString(repair.readyReminderSentAt),
    urgent: readBoolean(repair.urgent),
    expressMode: readBoolean(repair.expressMode),
    estimatedPriceCents: readNullableNumber(repair.estimatedPriceCents),
    partsCostCents: readNullableNumber(repair.partsCostCents),
    paidAmountCents: readNullableNumber(repair.paidAmountCents) ?? 0,
    depositCents: readNullableNumber(repair.depositCents) ?? 0,
    paymentStatus: readRepairPaymentStatus(repair.paymentStatus),
    warrantyUntil: readDateString(repair.warrantyUntil),
    warrantyReturn: readBoolean(repair.warrantyReturn),
    expectedPickupAt: readDateString(repair.expectedPickupAt),
    technicianName: readNullableString(repair.technicianName),
    storageLocation: readNullableString(repair.storageLocation),
    timeSpentMinutes: readNullableNumber(repair.timeSpentMinutes) ?? 0,
    checklistDiagnostic: readBoolean(repair.checklistDiagnostic),
    checklistBackup: readBoolean(repair.checklistBackup),
    checklistFunctionalTest: readBoolean(repair.checklistFunctionalTest),
    checklistCleaning: readBoolean(repair.checklistCleaning),
    customerType: readCustomerType(repair.customerType),
    satisfactionRating: readNullableNumber(repair.satisfactionRating),
    satisfactionComment: readNullableString(repair.satisfactionComment),
    supplierOrderNote: readNullableString(repair.supplierOrderNote),
    partsUsed: readNullableString(repair.partsUsed),
    usedInventoryItemId: readNullableString(repair.usedInventoryItemId),
    usedInventoryItemName: readNullableString(repair.usedInventoryItemName),
    usedInventoryQuantity: readNullableNumber(repair.usedInventoryQuantity) ?? 0,
    quoteStatus: readQuoteStatus(repair.quoteStatus),
    quoteSentAt: readDateString(repair.quoteSentAt),
    quoteRespondedAt: readDateString(repair.quoteRespondedAt),
    photos: readPhotosForResponse(repair.photos),
    customerDropOffSignature: readNullableString(repair.customerDropOffSignature),
    customerPickupSignature: readNullableString(repair.customerPickupSignature),
    partsStatus: readPartStatus(repair.partsStatus),
    partsDescription: readNullableString(repair.partsDescription),
    archivedAt: readDateString(repair.archivedAt),
    createdAt: readDateString(repair.createdAt) ?? new Date().toISOString(),
    updatedAt: readDateString(repair.updatedAt) ?? new Date().toISOString(),
  };
}

function normalizeEventsForResponse(values: unknown) {
  return Array.isArray(values)
    ? values.filter(isRecord).map((event) => ({
        id: readString(event.id),
        type: readString(event.type, "INFO"),
        message: readString(event.message, "Action enregistree."),
        createdAt: readDateString(event.createdAt) ?? new Date().toISOString(),
      }))
    : [];
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;
  let repair: RepairRecord | null;

  try {
    repair = await prisma.repair.findUnique({
      where: { id },
      select: repairSelect(),
    });
  } catch (error) {
    console.error("Repair detail lookup failed", error);
    return NextResponse.json(
      {
        error:
          "Chargement impossible. Verifiez la configuration Firebase ou redeployez le site pour appliquer les mises a jour.",
      },
      { status: 500 },
    );
  }

  if (!repair || repair.proAccountId !== admin.user.proAccountId) {
    return NextResponse.json({ error: "Reparation introuvable." }, { status: 404 });
  }

  if (
    repair.unlockCodeOrNote &&
    !isEncryptedSecret(repair.unlockCodeOrNote)
  ) {
    await prisma.repair
      .update({
        where: { id: repair.id },
        data: {
          unlockCodeOrNote: encryptSecret(repair.unlockCodeOrNote),
        },
      })
      .catch(() => null);
  }

  return NextResponse.json({
    repair: normalizeRepairForResponse(repair),
    events: normalizeEventsForResponse(await getEvents(repair.id)),
    inventoryItems: await getInventoryItems(admin.user.proAccountId),
    customerHistory: (await getCustomerHistory(repair)).map((item) => ({
      id: readString(item.id),
      ticketNumber: readNullableString(item.ticketNumber),
      deviceType: readString(item.deviceType, "-"),
      brand: readString(item.brand),
      model: readString(item.model),
      status: readString(item.status, "PAS_ENCORE_EN_REPARATION"),
      createdAt: readDateStringWithFallback(item.createdAt),
    })),
  });
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
  let currentRepair: RepairRecord | null;

  try {
    currentRepair = await prisma.repair.findUnique({
      where: { id },
      select: repairSelect(),
    });
  } catch (error) {
    console.error("Repair update lookup failed", error);
    return NextResponse.json(
      {
        error:
          "Mise a jour impossible. Verifiez la configuration Firebase ou redeployez le site pour appliquer les mises a jour.",
      },
      { status: 500 },
    );
  }

  if (
    !currentRepair ||
    currentRepair.proAccountId !== admin.user.proAccountId
  ) {
    return NextResponse.json({ error: "Reparation introuvable." }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  const notifyDelay = body.notifyDelay === true;

  if (notifyDelay) {
    const delayUntil = readOptionalDate(body, "delayUntil");

    if (!delayUntil) {
      return NextResponse.json(
        { error: "Choisissez la nouvelle date de disponibilite." },
        { status: 400 },
      );
    }

    const latestAllowedDate = Date.now() + 2 * 365 * 24 * 60 * 60 * 1000;

    if (
      delayUntil.getTime() <= Date.now() ||
      delayUntil.getTime() > latestAllowedDate
    ) {
      return NextResponse.json(
        { error: "La nouvelle date doit etre future et raisonnable." },
        { status: 400 },
      );
    }

    if (["RECUPERE", "ANNULE"].includes(currentRepair.status)) {
      return NextResponse.json(
        { error: "Cette reparation est deja terminee." },
        { status: 409 },
      );
    }

    const delayLimit = rateLimit(
      `repair-delay:${admin.user.id}:${currentRepair.id}`,
      5,
      60 * 60 * 1000,
    );

    if (!delayLimit.allowed) {
      return NextResponse.json(
        { error: "Trop d alertes envoyees. Reessayez plus tard." },
        {
          status: 429,
          headers: { "Retry-After": String(delayLimit.retryAfterSeconds) },
        },
      );
    }

    data.expectedPickupAt = delayUntil;
  }

  if ("urgent" in body) {
    data.urgent = body.urgent === true;
  }

  if ("expressMode" in body) {
    data.expressMode = body.expressMode === true;
  }

  if ("status" in body) {
    if (typeof body.status !== "string" || !isRepairStatus(body.status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    data.status = body.status;
  }

  if ("imei" in body) {
    if (typeof body.imei !== "string") {
      return NextResponse.json({ error: "IMEI invalide." }, { status: 400 });
    }

    const imeiDigits = body.imei.replace(/\D/g, "");

    if (body.imei.trim() && imeiDigits.length !== 15) {
      return NextResponse.json(
        { error: "L'IMEI doit contenir exactement 15 chiffres." },
        { status: 400 },
      );
    }

    data.imei = imeiDigits || null;
  }

  if ("serialNumber" in body) {
    if (typeof body.serialNumber !== "string") {
      return NextResponse.json(
        { error: "Numero de serie invalide." },
        { status: 400 },
      );
    }

    if (body.serialNumber.trim().length > 120) {
      return NextResponse.json(
        { error: "Numero de serie trop long." },
        { status: 400 },
      );
    }

    data.serialNumber = body.serialNumber.trim() || null;
  }

  if ("internalNotes" in body) {
    if (typeof body.internalNotes !== "string") {
      return NextResponse.json({ error: "Notes invalides." }, { status: 400 });
    }

    if (body.internalNotes.length > 20_000) {
      return NextResponse.json({ error: "Notes trop longues." }, { status: 400 });
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

  if ("partsCostCents" in body) {
    const partsCostCents = readOptionalCents(body, "partsCostCents");

    if (partsCostCents === undefined) {
      return NextResponse.json({ error: "Cout des pieces invalide." }, { status: 400 });
    }

    data.partsCostCents = partsCostCents;
  }

  if ("paidAmountCents" in body) {
    const paidAmountCents = readOptionalCents(body, "paidAmountCents");

    if (paidAmountCents === undefined) {
      return NextResponse.json({ error: "Montant paye invalide." }, { status: 400 });
    }

    data.paidAmountCents = paidAmountCents ?? 0;
  }

  if ("depositCents" in body) {
    const depositCents = readOptionalCents(body, "depositCents");

    if (depositCents === undefined) {
      return NextResponse.json({ error: "Acompte invalide." }, { status: 400 });
    }

    data.depositCents = depositCents ?? 0;
  }

  if ("paymentStatus" in body) {
    if (
      typeof body.paymentStatus !== "string" ||
      !isRepairPaymentStatus(body.paymentStatus)
    ) {
      return NextResponse.json({ error: "Statut paiement invalide." }, { status: 400 });
    }

    data.paymentStatus = body.paymentStatus;
  }

  if ("warrantyUntil" in body) {
    const warrantyUntil = readOptionalDate(body, "warrantyUntil");

    if (warrantyUntil === undefined) {
      return NextResponse.json({ error: "Date de garantie invalide." }, { status: 400 });
    }

    data.warrantyUntil = warrantyUntil;
  }

  if ("warrantyReturn" in body) {
    data.warrantyReturn = body.warrantyReturn === true;
  }

  if ("expectedPickupAt" in body) {
    const expectedPickupAt = readOptionalDate(body, "expectedPickupAt");

    if (expectedPickupAt === undefined) {
      return NextResponse.json({ error: "Date de recuperation invalide." }, { status: 400 });
    }

    data.expectedPickupAt = expectedPickupAt;
  }

  if ("technicianName" in body) {
    const technicianName = readOptionalText(body, "technicianName");
    if (technicianName.length > 160) {
      return NextResponse.json({ error: "Nom de technicien trop long." }, { status: 400 });
    }
    data.technicianName = technicianName || null;
  }

  if ("storageLocation" in body) {
    const storageLocation = readOptionalText(body, "storageLocation");
    if (storageLocation.length > 200) {
      return NextResponse.json({ error: "Emplacement trop long." }, { status: 400 });
    }
    data.storageLocation = storageLocation || null;
  }

  if ("timeSpentMinutes" in body) {
    const timeSpentMinutes = readOptionalInteger(body, "timeSpentMinutes");

    if (timeSpentMinutes === undefined) {
      return NextResponse.json({ error: "Temps passe invalide." }, { status: 400 });
    }

    data.timeSpentMinutes = timeSpentMinutes;
  }

  for (const key of [
    "checklistDiagnostic",
    "checklistBackup",
    "checklistFunctionalTest",
    "checklistCleaning",
  ]) {
    if (key in body) {
      data[key] = body[key] === true;
    }
  }

  if ("customerType" in body) {
    if (typeof body.customerType !== "string" || !isCustomerType(body.customerType)) {
      return NextResponse.json({ error: "Type client invalide." }, { status: 400 });
    }

    data.customerType = body.customerType;
  }

  if ("satisfactionRating" in body || "satisfactionComment" in body) {
    return NextResponse.json(
      { error: "Seul le client peut enregistrer ou modifier son avis." },
      { status: 403 },
    );
  }

  if ("supplierOrderNote" in body) {
    const supplierOrderNote = readOptionalText(body, "supplierOrderNote");
    if (supplierOrderNote.length > 5_000) {
      return NextResponse.json({ error: "Note fournisseur trop longue." }, { status: 400 });
    }
    data.supplierOrderNote = supplierOrderNote || null;
  }

  if ("partsUsed" in body) {
    const partsUsed = readOptionalText(body, "partsUsed");
    if (partsUsed.length > 5_000) {
      return NextResponse.json({ error: "Liste de pieces trop longue." }, { status: 400 });
    }
    data.partsUsed = partsUsed || null;
  }

  if ("partsStatus" in body) {
    if (typeof body.partsStatus !== "string" || !isPartStatus(body.partsStatus)) {
      return NextResponse.json({ error: "Statut piece invalide." }, { status: 400 });
    }

    data.partsStatus = body.partsStatus;
  }

  if ("partsDescription" in body) {
    const partsDescription = readOptionalText(body, "partsDescription");
    if (partsDescription.length > 5_000) {
      return NextResponse.json({ error: "Description de piece trop longue." }, { status: 400 });
    }
    data.partsDescription = partsDescription || null;
  }

  if ("usedInventoryItemId" in body || "usedInventoryQuantity" in body) {
    const usedInventoryItemId = readOptionalText(body, "usedInventoryItemId");
    const usedInventoryQuantity = readOptionalInteger(body, "usedInventoryQuantity");

    if (usedInventoryQuantity === undefined) {
      return NextResponse.json({ error: "Quantite de piece invalide." }, { status: 400 });
    }

    if (!usedInventoryItemId || usedInventoryQuantity === 0) {
      data.usedInventoryItemId = null;
      data.usedInventoryItemName = null;
      data.usedInventoryQuantity = 0;
    } else {
      const item = await prisma.inventoryItem.findUnique({
        where: { id: usedInventoryItemId },
        select: {
          id: true,
          proAccountId: true,
          name: true,
          quantity: true,
          unitCostCents: true,
        },
      });

      if (
        !item ||
        item.proAccountId !== admin.user.proAccountId
      ) {
        return NextResponse.json({ error: "Piece introuvable." }, { status: 404 });
      }

      const restoredOldQuantity =
        currentRepair.usedInventoryItemId === item.id
          ? currentRepair.usedInventoryQuantity
          : 0;
      const availableQuantity = item.quantity + restoredOldQuantity;

      if (usedInventoryQuantity > availableQuantity) {
        return NextResponse.json(
          { error: "Stock insuffisant pour cette piece." },
          { status: 400 },
        );
      }

      data.usedInventoryItemId = item.id;
      data.usedInventoryItemName = item.name;
      data.usedInventoryQuantity = usedInventoryQuantity;
      data.partsCostCents = item.unitCostCents * usedInventoryQuantity;
      data.partsUsed = item.name;
    }
  }

  if ("photos" in body) {
    const photos = readPhotos(body.photos);

    if (!photos) {
      return NextResponse.json({ error: "Photos invalides." }, { status: 400 });
    }

    data.photos = photos;
  }

  if ("customerDropOffSignature" in body || "customerPickupSignature" in body) {
    return NextResponse.json(
      { error: "Les signatures client ne sont pas modifiables depuis l'admin." },
      { status: 403 },
    );
  }

  if ("archived" in body && body.archived === true && !currentRepair.archivedAt) {
    data.archivedAt = new Date();
  }

  const sendQuote = body.sendQuote === true;
  const acceptClientRequest = body.acceptClientRequest === true;
  const refuseClientRequest = body.refuseClientRequest === true;

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

  if (acceptClientRequest) {
    data.status = "PAS_ENCORE_RECU_CLIENT";
    data.quoteStatus = "ACCEPTED";
    data.quoteRespondedAt = new Date();
  }

  if (refuseClientRequest) {
    data.status = "ANNULE";
    data.quoteStatus = "REFUSED";
    data.quoteRespondedAt = new Date();
  }

  const nextStatus = (data.status as PrismaRepairStatus | undefined) ?? currentRepair.status;
  const statusChanged = Boolean(data.status && data.status !== currentRepair.status);

  if (
    statusChanged &&
    nextStatus === "RECUPERE" &&
    !currentRepair.warrantyUntil &&
    !("warrantyUntil" in data)
  ) {
    const warrantyUntil = new Date();
    warrantyUntil.setDate(warrantyUntil.getDate() + 90);
    data.warrantyUntil = warrantyUntil;
  }

  const notesChanged =
    "internalNotes" in data &&
    (data.internalNotes ?? null) !== (currentRepair.internalNotes ?? null);
  const shouldSendStatusEmail =
    statusChanged && (nextStatus !== "PRET" || !currentRepair.readyEmailSent);
  const shouldSendReviewEmail =
    statusChanged && nextStatus === "RECUPERE" && !currentRepair.reviewEmailSent;

  if (shouldSendReviewEmail && !currentRepair.reviewToken) {
    data.reviewToken = newPublicToken();
  }

  let repair = await prisma.repair.update({
    where: { id },
    data,
    select: repairSelect(),
  });

  const inventoryChanged =
    "usedInventoryItemId" in data || "usedInventoryQuantity" in data;

  if (inventoryChanged) {
    if (currentRepair.usedInventoryItemId && currentRepair.usedInventoryQuantity > 0) {
      await prisma.inventoryItem.updateMany({
        where: { id: currentRepair.usedInventoryItemId },
        data: { quantity: { increment: currentRepair.usedInventoryQuantity } },
      });
    }

    if (repair.usedInventoryItemId && repair.usedInventoryQuantity > 0) {
      await prisma.inventoryItem.updateMany({
        where: { id: repair.usedInventoryItemId },
        data: { quantity: { decrement: repair.usedInventoryQuantity } },
      });
    }
  }

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
    "partsCostCents" in data &&
    data.partsCostCents !== currentRepair.partsCostCents
  ) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "PARTS_COST_UPDATED",
      message: "Cout des pieces mis a jour.",
    });
  }

  if (
    "paidAmountCents" in data ||
    "depositCents" in data ||
    "paymentStatus" in data
  ) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "PAYMENT_UPDATED",
      message: "Paiement client mis a jour.",
    });
  }

  if (
    "urgent" in data ||
    "expectedPickupAt" in data ||
    "technicianName" in data ||
    "timeSpentMinutes" in data
  ) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "PLANNING_UPDATED",
      message: "Planning atelier mis a jour.",
    });
  }

  if (
    "warrantyUntil" in data ||
    "warrantyReturn" in data ||
    "customerType" in data
  ) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "CUSTOMER_UPDATED",
      message: "Informations client mises a jour.",
    });
  }

  if (
    "checklistDiagnostic" in data ||
    "checklistBackup" in data ||
    "checklistFunctionalTest" in data ||
    "checklistCleaning" in data
  ) {
    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: "CHECKLIST_UPDATED",
      message: "Checklist atelier mise a jour.",
    });
  }

  if (
    ("partsStatus" in data && data.partsStatus !== currentRepair.partsStatus) ||
    ("partsDescription" in data &&
      data.partsDescription !== (currentRepair.partsDescription ?? null)) ||
    "supplierOrderNote" in data ||
    "partsUsed" in data ||
    inventoryChanged
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

  let acceptedTicketEmailSentNow = false;
  let statusEmailSentNow = false;
  let reviewEmailSentNow = false;
  let delayEmailSentNow = false;

  if (acceptClientRequest && currentRepair.quoteStatus !== "ACCEPTED") {
    const acceptedTicketMail = await sendRepairCreatedEmail(repair);
    acceptedTicketEmailSentNow = acceptedTicketMail.sent;

    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: acceptedTicketMail.sent ? "CLIENT_REQUEST_ACCEPTED" : "CLIENT_TICKET_EMAIL_FAILED",
      message: acceptedTicketMail.sent
        ? "Demande acceptee par le magasin et ticket envoye au client."
        : "Demande acceptee par le magasin mais l'email de ticket n'est pas parti.",
    });
  }

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

  if (notifyDelay && repair.expectedPickupAt) {
    const delayResult = await sendRepairDelayEmail({
      ...repair,
      expectedPickupAt: repair.expectedPickupAt,
    });
    delayEmailSentNow = delayResult.sent;

    await addRepairEvent({
      repairId: repair.id,
      proAccountId: repair.proAccountId,
      type: delayResult.sent ? "DELAY_EMAIL_SENT" : "DELAY_EMAIL_FAILED",
      message: delayResult.sent
        ? "Client informe du retard et de la nouvelle date prevue."
        : "Retard enregistre, mais l email client n a pas pu etre envoye.",
      metadata: {
        expectedPickupAt: new Date(repair.expectedPickupAt).toISOString(),
      },
    });
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
    repair: normalizeRepairForResponse(repair),
    events: normalizeEventsForResponse(await getEvents(repair.id)),
    inventoryItems: await getInventoryItems(admin.user.proAccountId),
    customerHistory: (await getCustomerHistory(repair)).map((item) => ({
      id: readString(item.id),
      ticketNumber: readNullableString(item.ticketNumber),
      deviceType: readString(item.deviceType, "-"),
      brand: readString(item.brand),
      model: readString(item.model),
      status: readString(item.status, "PAS_ENCORE_EN_REPARATION"),
      createdAt: readDateStringWithFallback(item.createdAt),
    })),
    mail: {
      attempted: shouldSendStatusEmail,
      sent: statusEmailSentNow,
      quoteAttempted: sendQuote,
      acceptedTicketAttempted: acceptClientRequest,
      acceptedTicketSent: acceptedTicketEmailSentNow,
      reviewAttempted: shouldSendReviewEmail,
      reviewSent: reviewEmailSentNow,
      delayAttempted: notifyDelay,
      delaySent: delayEmailSentNow,
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
    existingRepair.proAccountId !== admin.user.proAccountId
  ) {
    return NextResponse.json({ error: "Reparation introuvable." }, { status: 404 });
  }

  await prisma.repair.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
