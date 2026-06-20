import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const editableFields = [
  "companyName",
  "publicDescription",
  "shopAddress",
  "shopPostalCode",
  "shopCity",
  "shopCountry",
  "shopPhone",
  "shopEmail",
  "shopOpeningHours",
  "shopLatitude",
  "shopLongitude",
  "shopCapacityPerDay",
  "shopSlotDurationMinutes",
  "shopMaxAppointmentsPerSlot",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalNumber(body: Record<string, unknown>, key: string) {
  const raw = body[key];

  if (raw === "" || raw === null || raw === undefined) {
    return null;
  }

  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? value : null;
}

function profileSelect() {
  return {
    companyName: true,
    slug: true,
    ownerEmail: true,
    publicDescription: true,
    shopAddress: true,
    shopPostalCode: true,
    shopCity: true,
    shopCountry: true,
    shopPhone: true,
    shopEmail: true,
    shopOpeningHours: true,
    shopLatitude: true,
    shopLongitude: true,
    shopCapacityPerDay: true,
    shopSlotDurationMinutes: true,
    shopMaxAppointmentsPerSlot: true,
  };
}

export async function GET() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  if (!admin.user.proAccountId) {
    return NextResponse.json({ error: "Compte pro introuvable." }, { status: 404 });
  }

  const profile = await prisma.proAccount.findUnique({
    where: { id: admin.user.proAccountId },
    select: profileSelect(),
  });

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  if (!admin.user.proAccountId) {
    return NextResponse.json({ error: "Compte pro introuvable." }, { status: 404 });
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

  const shopCapacityPerDay = readOptionalNumber(body, "shopCapacityPerDay");
  const shopSlotDurationMinutes = readOptionalNumber(
    body,
    "shopSlotDurationMinutes",
  );
  const shopMaxAppointmentsPerSlot = readOptionalNumber(
    body,
    "shopMaxAppointmentsPerSlot",
  );

  if (
    shopCapacityPerDay !== null &&
    (!Number.isInteger(shopCapacityPerDay) || shopCapacityPerDay < 1)
  ) {
    return NextResponse.json(
      { error: "La capacite doit etre un nombre entier positif." },
      { status: 400 },
    );
  }

  if (
    shopSlotDurationMinutes !== null &&
    (!Number.isInteger(shopSlotDurationMinutes) ||
      shopSlotDurationMinutes < 15 ||
      shopSlotDurationMinutes > 240)
  ) {
    return NextResponse.json(
      { error: "La duree d'un creneau doit etre entre 15 et 240 minutes." },
      { status: 400 },
    );
  }

  if (
    shopMaxAppointmentsPerSlot !== null &&
    (!Number.isInteger(shopMaxAppointmentsPerSlot) ||
      shopMaxAppointmentsPerSlot < 1 ||
      shopMaxAppointmentsPerSlot > 20)
  ) {
    return NextResponse.json(
      { error: "Le nombre de rendez-vous par creneau doit etre entre 1 et 20." },
      { status: 400 },
    );
  }

  const data = {
    companyName: readText(body, "companyName"),
    publicDescription: readText(body, "publicDescription") || null,
    shopAddress: readText(body, "shopAddress") || null,
    shopPostalCode: readText(body, "shopPostalCode") || null,
    shopCity: readText(body, "shopCity") || null,
    shopCountry: readText(body, "shopCountry") || null,
    shopPhone: readText(body, "shopPhone") || null,
    shopEmail: readText(body, "shopEmail") || null,
    shopOpeningHours: readText(body, "shopOpeningHours") || null,
    shopLatitude: readOptionalNumber(body, "shopLatitude"),
    shopLongitude: readOptionalNumber(body, "shopLongitude"),
    shopCapacityPerDay: shopCapacityPerDay ?? 8,
    shopSlotDurationMinutes: shopSlotDurationMinutes ?? 60,
    shopMaxAppointmentsPerSlot: shopMaxAppointmentsPerSlot ?? 1,
  };

  if (!data.companyName) {
    return NextResponse.json(
      { error: "Le nom du magasin est requis." },
      { status: 400 },
    );
  }

  const profile = await prisma.proAccount.update({
    where: { id: admin.user.proAccountId },
    data,
    select: profileSelect(),
  });

  return NextResponse.json({ profile, fields: editableFields });
}
