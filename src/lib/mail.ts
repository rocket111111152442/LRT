import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

type ReadyRepairEmailInput = {
  firstName: string;
  email: string;
  deviceType: string;
  brand: string;
  model: string;
};

type SendMailResult = {
  sent: boolean;
  skipped: boolean;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  from: string;
  shopLines: string[];
};

function getEnvShopLines() {
  return [
    process.env.SHOP_NAME,
    process.env.SHOP_ADDRESS,
    process.env.SHOP_OPENING_HOURS,
    process.env.SHOP_PHONE,
  ].filter(Boolean) as string[];
}

function getEnvSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const from = process.env.SMTP_FROM;

  if (!host || !from || Number.isNaN(port)) {
    return null;
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: user && pass ? { user, pass } : undefined,
    from,
    shopLines: getEnvShopLines(),
  };
}

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    const settings = await prisma.emailSettings.findUnique({
      where: { id: "default" },
    });

    if (
      settings?.smtpEmail &&
      settings.smtpAppPassword &&
      settings.smtpHost &&
      settings.smtpPort
    ) {
      const shopLines = [
        settings.shopName || process.env.SHOP_NAME,
        settings.shopAddress || process.env.SHOP_ADDRESS,
        settings.shopOpeningHours || process.env.SHOP_OPENING_HOURS,
        settings.shopPhone || process.env.SHOP_PHONE,
      ].filter(Boolean) as string[];

      return {
        host: settings.smtpHost,
        port: settings.smtpPort,
        secure: settings.smtpSecure,
        auth: {
          user: settings.smtpEmail,
          pass: settings.smtpAppPassword,
        },
        from: settings.smtpFromName
          ? `${settings.smtpFromName} <${settings.smtpEmail}>`
          : settings.smtpEmail,
        shopLines,
      };
    }
  } catch (error) {
    console.error("Email settings lookup failed", error);
  }

  return getEnvSmtpConfig();
}

export async function sendReadyRepairEmail(
  repair: ReadyRepairEmailInput,
): Promise<SendMailResult> {
  const smtpConfig = await getSmtpConfig();

  if (!smtpConfig) {
    return { sent: false, skipped: true };
  }

  const text = [
    `Bonjour ${repair.firstName},`,
    "",
    `Votre ${repair.deviceType} ${repair.brand} ${repair.model} est prêt.`,
    "Vous pouvez venir le récupérer au magasin.",
    "",
    ...smtpConfig.shopLines,
  ].join("\n");

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
    });

    await transporter.sendMail({
      from: smtpConfig.from,
      to: repair.email,
      subject: "Votre réparation est prête",
      text,
    });

    return { sent: true, skipped: false };
  } catch (error) {
    console.error("Ready repair email failed", error);
    return { sent: false, skipped: false };
  }
}
