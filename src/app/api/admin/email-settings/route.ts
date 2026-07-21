import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Réglages e-mail cloisonnés par atelier : l'identifiant de l'enregistrement est
// le proAccountId de l'admin connecté. Un super-admin sans atelier retombe sur
// "default" (enregistrement global, désormais isolé et non partagé).
function settingsIdFor(proAccountId: string | null | undefined) {
  return proAccountId && proAccountId.trim() ? proAccountId.trim() : "default";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalText(source: Record<string, unknown>, key: string) {
  const value = readText(source, key);
  return value || null;
}

function serializeSettings(settings: {
  smtpEmail: string | null;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpFromName: string | null;
  smtpAppPassword: string | null;
  shopName: string | null;
  shopAddress: string | null;
  shopOpeningHours: string | null;
  shopPhone: string | null;
  googleReviewUrl: string | null;
  createdEmailTemplate: string | null;
  statusEmailTemplate: string | null;
  quoteEmailTemplate: string | null;
  reviewEmailTemplate: string | null;
}) {
  return {
    smtpEmail: settings.smtpEmail ?? "",
    smtpHost: settings.smtpHost,
    smtpPort: settings.smtpPort,
    smtpSecure: settings.smtpSecure,
    smtpFromName: settings.smtpFromName ?? "",
    hasAppPassword: Boolean(settings.smtpAppPassword),
    shopName: settings.shopName ?? "",
    shopAddress: settings.shopAddress ?? "",
    shopOpeningHours: settings.shopOpeningHours ?? "",
    shopPhone: settings.shopPhone ?? "",
    googleReviewUrl: settings.googleReviewUrl ?? "",
    createdEmailTemplate: settings.createdEmailTemplate ?? "",
    statusEmailTemplate: settings.statusEmailTemplate ?? "",
    quoteEmailTemplate: settings.quoteEmailTemplate ?? "",
    reviewEmailTemplate: settings.reviewEmailTemplate ?? "",
  };
}

export async function GET() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const settingsId = settingsIdFor(admin.user.proAccountId);

  const settings = await prisma.emailSettings.upsert({
    where: { id: settingsId },
    update: {},
    create: { id: settingsId },
  });

  return NextResponse.json({ settings: serializeSettings(settings) });
}

export async function PATCH(request: Request) {
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

  const smtpEmail = readText(body, "smtpEmail").toLowerCase();
  const smtpHost = readText(body, "smtpHost") || "smtp.gmail.com";
  const smtpPort = Number(body.smtpPort || 465);
  const smtpSecure = Boolean(body.smtpSecure);
  const smtpAppPassword = readText(body, "smtpAppPassword").replace(/\s/g, "");

  if (!smtpEmail || !smtpEmail.includes("@")) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  if (!smtpHost) {
    return NextResponse.json({ error: "Serveur SMTP requis." }, { status: 400 });
  }

  if (!Number.isInteger(smtpPort) || smtpPort <= 0) {
    return NextResponse.json({ error: "Port SMTP invalide." }, { status: 400 });
  }

  const settingsId = settingsIdFor(admin.user.proAccountId);

  const settings = await prisma.emailSettings.upsert({
    where: { id: settingsId },
    update: {
      smtpEmail,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpFromName: readOptionalText(body, "smtpFromName"),
      ...(smtpAppPassword ? { smtpAppPassword } : {}),
      shopName: readOptionalText(body, "shopName"),
      shopAddress: readOptionalText(body, "shopAddress"),
      shopOpeningHours: readOptionalText(body, "shopOpeningHours"),
      shopPhone: readOptionalText(body, "shopPhone"),
      googleReviewUrl: readOptionalText(body, "googleReviewUrl"),
      createdEmailTemplate: readOptionalText(body, "createdEmailTemplate"),
      statusEmailTemplate: readOptionalText(body, "statusEmailTemplate"),
      quoteEmailTemplate: readOptionalText(body, "quoteEmailTemplate"),
      reviewEmailTemplate: readOptionalText(body, "reviewEmailTemplate"),
    },
    create: {
      id: settingsId,
      smtpEmail,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpFromName: readOptionalText(body, "smtpFromName"),
      smtpAppPassword: smtpAppPassword || null,
      shopName: readOptionalText(body, "shopName"),
      shopAddress: readOptionalText(body, "shopAddress"),
      shopOpeningHours: readOptionalText(body, "shopOpeningHours"),
      shopPhone: readOptionalText(body, "shopPhone"),
      googleReviewUrl: readOptionalText(body, "googleReviewUrl"),
      createdEmailTemplate: readOptionalText(body, "createdEmailTemplate"),
      statusEmailTemplate: readOptionalText(body, "statusEmailTemplate"),
      quoteEmailTemplate: readOptionalText(body, "quoteEmailTemplate"),
      reviewEmailTemplate: readOptionalText(body, "reviewEmailTemplate"),
    },
  });

  return NextResponse.json({ settings: serializeSettings(settings) });
}
