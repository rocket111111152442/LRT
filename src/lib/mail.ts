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

type VerificationEmailPurpose = "SIGNUP" | "LOGIN";

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
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

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

async function sendWithEnvSmtp(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<SendMailResult> {
  const smtpConfig = getEnvSmtpConfig();

  if (!smtpConfig) {
    return { sent: false, skipped: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
    });

    await transporter.sendMail({
      from: smtpConfig.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });

    return { sent: true, skipped: false };
  } catch (error) {
    console.error("Verification email failed", error);
    return { sent: false, skipped: false };
  }
}

export async function sendVerificationCodeEmail(input: {
  email: string;
  code: string;
  purpose: VerificationEmailPurpose;
}): Promise<SendMailResult> {
  const isSignup = input.purpose === "SIGNUP";
  const text = [
    `Code LRT : ${input.code}`,
    "",
    isSignup
      ? "Entrez ce code pour valider votre email et continuer la creation du compte pro."
      : "Entrez ce code pour confirmer votre connexion a l espace admin.",
    "",
    "Ce code expire dans 10 minutes.",
    "Si vous n etes pas a l origine de cette demande, ignorez cet email.",
  ].join("\n");

  return sendWithEnvSmtp({
    to: input.email,
    subject: isSignup ? "Code de validation LRT" : "Code de connexion LRT",
    text,
  });
}

export async function sendSupportMessageEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<SendMailResult> {
  const supportEmail =
    process.env.SUPPORT_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!supportEmail) {
    return { sent: false, skipped: true };
  }

  const text = [
    "Nouvelle demande service client LRT",
    "",
    `Nom : ${input.name}`,
    `Email : ${input.email}`,
    `Sujet : ${input.subject}`,
    "",
    "Message :",
    input.message,
  ].join("\n");

  return sendWithEnvSmtp({
    to: supportEmail,
    subject: `Service client LRT - ${input.subject}`,
    text,
  });
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
