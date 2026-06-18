import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

type ReadyRepairEmailInput = {
  firstName: string;
  email: string;
  deviceType: string;
  brand: string;
  model: string;
};

type RepairStatusEmailInput = ReadyRepairEmailInput & {
  status: string;
};

type QuoteEmailInput = ReadyRepairEmailInput & {
  ticketNumber: string | null;
  estimatedPriceCents: number;
  quoteToken: string;
};

type SendMailResult = {
  sent: boolean;
  skipped: boolean;
};

type VerificationEmailPurpose = "SIGNUP" | "LOGIN" | "PASSWORD_RESET";

const DEFAULT_SERVICE_EMAIL = "lrt.service.client@gmail.com";

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
  googleReviewUrl?: string | null;
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
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || DEFAULT_SERVICE_EMAIL;

  if (!host || !from || Number.isNaN(port)) {
    return null;
  }

  const user =
    process.env.SMTP_USER || (process.env.SMTP_PASSWORD ? DEFAULT_SERVICE_EMAIL : "");
  const pass = process.env.SMTP_PASSWORD;

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: user && pass ? { user, pass } : undefined,
    from,
    shopLines: getEnvShopLines(),
    googleReviewUrl: process.env.GOOGLE_REVIEW_URL || null,
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
  const isPasswordReset = input.purpose === "PASSWORD_RESET";
  const text = [
    `Code LRT : ${input.code}`,
    "",
    isSignup
      ? "Entrez ce code pour valider votre email et continuer la creation du compte pro."
      : isPasswordReset
        ? "Entrez ce code pour changer le mot de passe de votre espace admin."
        : "Entrez ce code pour confirmer votre connexion a l espace admin.",
    "",
    "Ce code expire dans 10 minutes.",
    "Si vous n etes pas a l origine de cette demande, ignorez cet email.",
  ].join("\n");

  return sendWithEnvSmtp({
    to: input.email,
    subject: isSignup
      ? "Code de validation LRT"
      : isPasswordReset
        ? "Code de recuperation LRT"
        : "Code de connexion LRT",
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
    process.env.SUPPORT_EMAIL ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    DEFAULT_SERVICE_EMAIL;

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

export async function sendSetupAppointmentEmail(input: {
  companyName: string;
  ownerEmail: string;
  requestedAt: Date;
  contactPhone?: string | null;
  notes?: string | null;
}): Promise<SendMailResult> {
  const supportEmail =
    process.env.SUPPORT_EMAIL ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    DEFAULT_SERVICE_EMAIL;

  if (!supportEmail) {
    return { sent: false, skipped: true };
  }

  const text = [
    "Nouveau rendez-vous aide installation LRT",
    "",
    `Atelier : ${input.companyName}`,
    `Email admin : ${input.ownerEmail}`,
    `Date demandee : ${new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(input.requestedAt)}`,
    input.contactPhone ? `Telephone : ${input.contactPhone}` : "",
    "",
    input.notes ? "Notes :" : "",
    input.notes ?? "",
  ].filter(Boolean).join("\n");

  return sendWithEnvSmtp({
    to: supportEmail,
    subject: `Aide installation LRT - ${input.companyName}`,
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
        googleReviewUrl: settings.googleReviewUrl ?? process.env.GOOGLE_REVIEW_URL ?? null,
      };
    }
  } catch (error) {
    console.error("Email settings lookup failed", error);
  }

  return getEnvSmtpConfig();
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

async function sendWithRepairSmtp(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<SendMailResult> {
  const smtpConfig = await getSmtpConfig();

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
    console.error("Repair email failed", error);
    return { sent: false, skipped: false };
  }
}

export async function sendQuoteEmail(
  repair: QuoteEmailInput,
): Promise<SendMailResult> {
  const quoteUrl = `${getAppUrl()}/devis/${repair.quoteToken}`;
  const text = [
    `Bonjour ${repair.firstName},`,
    "",
    `Votre devis pour ${repair.deviceType} ${repair.brand} ${repair.model} est de ${formatPrice(repair.estimatedPriceCents)}.`,
    repair.ticketNumber ? `Ticket : ${repair.ticketNumber}` : "",
    "",
    "Pour accepter ou refuser le devis, ouvrez ce lien :",
    quoteUrl,
  ].filter(Boolean).join("\n");

  return sendWithRepairSmtp({
    to: repair.email,
    subject: `Votre devis LRT ${repair.ticketNumber ?? ""}`.trim(),
    text,
  });
}

export async function sendReviewRequestEmail(
  repair: ReadyRepairEmailInput,
): Promise<SendMailResult> {
  const smtpConfig = await getSmtpConfig();
  const reviewUrl = smtpConfig?.googleReviewUrl;

  if (!smtpConfig || !reviewUrl) {
    return { sent: false, skipped: true };
  }

  const text = [
    `Bonjour ${repair.firstName},`,
    "",
    `Merci pour votre confiance pour votre ${repair.deviceType} ${repair.brand} ${repair.model}.`,
    "Vous pouvez laisser un avis ici :",
    reviewUrl,
    "",
    ...smtpConfig.shopLines,
  ].join("\n");

  return sendWithRepairSmtp({
    to: repair.email,
    subject: "Votre avis compte pour nous",
    text,
  });
}

export async function sendReadyReminderEmail(
  repair: ReadyRepairEmailInput & { ticketNumber?: string | null },
): Promise<SendMailResult> {
  const text = [
    `Bonjour ${repair.firstName},`,
    "",
    `Petit rappel : votre ${repair.deviceType} ${repair.brand} ${repair.model} est pret au magasin.`,
    repair.ticketNumber ? `Ticket : ${repair.ticketNumber}` : "",
    "Vous pouvez venir le recuperer pendant les horaires d'ouverture.",
  ].filter(Boolean).join("\n");

  return sendWithRepairSmtp({
    to: repair.email,
    subject: "Rappel : votre appareil est pret",
    text,
  });
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

function buildRepairStatusEmail(repair: RepairStatusEmailInput) {
  const device = `${repair.deviceType} ${repair.brand} ${repair.model}`.trim();

  switch (repair.status) {
    case "PAS_ENCORE_EN_REPARATION":
      return {
        subject: "Votre reparation est bien enregistree",
        lines: [
          `Votre ${device} est bien enregistre.`,
          "Il n'est pas encore en reparation.",
          "Nous vous previendrons des que son statut change.",
        ],
      };
    case "EN_REPARATION":
      return {
        subject: "Votre reparation est en cours",
        lines: [
          `Votre ${device} est maintenant en reparation.`,
          "Notre equipe s'en occupe.",
        ],
      };
    case "EN_ATTENTE_PIECE":
      return {
        subject: "Votre reparation attend une piece",
        lines: [
          `Votre ${device} est en attente d'une piece.`,
          "Nous vous previendrons des que la piece sera disponible.",
        ],
      };
    case "PRET":
      return {
        subject: "Votre reparation est prete",
        lines: [
          `Votre ${device} est pret.`,
          "Vous pouvez venir le recuperer au magasin.",
        ],
      };
    case "RECUPERE":
      return {
        subject: "Votre appareil a ete recupere",
        lines: [
          `Votre ${device} a ete indique comme recupere.`,
          "Merci pour votre confiance.",
        ],
      };
    case "ANNULE":
      return {
        subject: "Votre reparation a ete annulee",
        lines: [
          `La reparation de votre ${device} a ete annulee.`,
          "Contactez le magasin si vous avez une question.",
        ],
      };
    default:
      return {
        subject: "Mise a jour de votre reparation",
        lines: [`Le statut de votre ${device} a ete mis a jour.`],
      };
  }
}

export async function sendRepairStatusEmail(
  repair: RepairStatusEmailInput,
): Promise<SendMailResult> {
  const smtpConfig = await getSmtpConfig();

  if (!smtpConfig) {
    return { sent: false, skipped: true };
  }

  const email = buildRepairStatusEmail(repair);
  const text = [
    `Bonjour ${repair.firstName},`,
    "",
    ...email.lines,
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
      subject: email.subject,
      text,
    });

    return { sent: true, skipped: false };
  } catch (error) {
    console.error("Repair status email failed", error);
    return { sent: false, skipped: false };
  }
}
