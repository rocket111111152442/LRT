import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "default";

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
  };
}

export async function GET() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const settings = await prisma.emailSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
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

  const settings = await prisma.emailSettings.upsert({
    where: { id: SETTINGS_ID },
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
    },
    create: {
      id: SETTINGS_ID,
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
    },
  });

  return NextResponse.json({ settings: serializeSettings(settings) });
}
