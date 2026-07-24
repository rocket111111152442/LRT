import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { resolvePublicSmtpHost } from "@/lib/networkSecurity";
import { prisma } from "@/lib/prisma";
import {
  encryptSecret,
  isEncryptedSecret,
} from "@/lib/secretEncryption";

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

function isValidEmail(value: string) {
  return (
    value.length <= 320 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

function isValidHttpsUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.username === "" && url.password === "";
  } catch {
    return false;
  }
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

  if (
    settings.smtpAppPassword &&
    !isEncryptedSecret(settings.smtpAppPassword)
  ) {
    await prisma.emailSettings.update({
      where: { id: settingsId },
      data: {
        smtpAppPassword: encryptSecret(settings.smtpAppPassword),
      },
    });
  }

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

  if (!isValidEmail(smtpEmail)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  if (!smtpHost) {
    return NextResponse.json({ error: "Serveur SMTP requis." }, { status: 400 });
  }

  const smtpEndpoint = await resolvePublicSmtpHost(smtpHost, smtpPort);

  if (!smtpEndpoint) {
    return NextResponse.json(
      {
        error:
          "Serveur SMTP invalide. Utilisez un serveur public avec le port 465, 587 ou 2525.",
      },
      { status: 400 },
    );
  }

  if (smtpAppPassword.length > 512) {
    return NextResponse.json({ error: "Mot de passe SMTP trop long." }, { status: 400 });
  }

  const limitedFields: Array<[string, number]> = [
    ["smtpFromName", 100],
    ["shopName", 160],
    ["shopAddress", 500],
    ["shopOpeningHours", 1_000],
    ["shopPhone", 50],
    ["googleReviewUrl", 2_000],
    ["createdEmailTemplate", 10_000],
    ["statusEmailTemplate", 10_000],
    ["quoteEmailTemplate", 10_000],
    ["reviewEmailTemplate", 10_000],
  ];

  for (const [field, maxLength] of limitedFields) {
    if (readText(body, field).length > maxLength) {
      return NextResponse.json(
        { error: `Le champ ${field} est trop long.` },
        { status: 400 },
      );
    }
  }

  if (!isValidHttpsUrl(readText(body, "googleReviewUrl"))) {
    return NextResponse.json(
      { error: "Le lien Google Avis doit être une URL HTTPS valide." },
      { status: 400 },
    );
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
      ...(smtpAppPassword
        ? { smtpAppPassword: encryptSecret(smtpAppPassword) }
        : {}),
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
      smtpAppPassword: encryptSecret(smtpAppPassword),
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
