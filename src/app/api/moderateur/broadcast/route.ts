import { NextResponse } from "next/server";
import {
  sendModeratorBroadcastEmails,
  type ModeratorBroadcastRecipient,
} from "@/lib/mail";
import { requireModApi } from "@/lib/modAuth";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const AUDIENCES = new Set(["ALL", "PAID", "UNPAID"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const auth = await requireModApi();

  if (!auth.ok) {
    return auth.response as unknown as ReturnType<typeof NextResponse.json>;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Requete invalide." },
      { status: 400 },
    );
  }

  const input =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};
  const audience =
    typeof input.audience === "string" ? input.audience : "";
  const subject =
    typeof input.subject === "string" ? input.subject.trim() : "";
  const message =
    typeof input.message === "string" ? input.message.trim() : "";

  if (!AUDIENCES.has(audience)) {
    return NextResponse.json(
      { error: "Audience invalide." },
      { status: 400 },
    );
  }

  if (
    subject.length < 3 ||
    subject.length > 160 ||
    subject.includes("\r") ||
    subject.includes("\n")
  ) {
    return NextResponse.json(
      { error: "L objet doit contenir entre 3 et 160 caracteres." },
      { status: 400 },
    );
  }

  if (message.length < 10 || message.length > 10_000) {
    return NextResponse.json(
      { error: "Le message doit contenir entre 10 et 10 000 caracteres." },
      { status: 400 },
    );
  }

  if (input.confirm !== "ENVOYER") {
    return NextResponse.json(
      { error: "Confirmation d envoi manquante." },
      { status: 400 },
    );
  }

  const limit = rateLimit(
    `moderator-broadcast:${clientIp(request)}`,
    3,
    60 * 60 * 1000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "Limite de securite atteinte. Vous pouvez effectuer trois envois par heure.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const accounts = await prisma.proAccount.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      companyName: true,
      ownerEmail: true,
      paymentStatus: true,
    },
  });
  const uniqueRecipients = new Map<string, ModeratorBroadcastRecipient>();

  for (const account of accounts) {
    const isPaid = account.paymentStatus === "PAID";

    if (
      (audience === "PAID" && !isPaid) ||
      (audience === "UNPAID" && isPaid)
    ) {
      continue;
    }

    const email = account.ownerEmail.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email) || uniqueRecipients.has(email)) {
      continue;
    }

    uniqueRecipients.set(email, {
      email,
      companyName: account.companyName.trim() || "votre atelier",
      paymentStatus: account.paymentStatus,
    });
  }

  const recipients = [...uniqueRecipients.values()];

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "Aucun compte ne correspond a cette audience." },
      { status: 400 },
    );
  }

  if (recipients.length > 500) {
    return NextResponse.json(
      {
        error:
          "Cette audience depasse 500 adresses. Contactez l administrateur technique pour un envoi par lots.",
      },
      { status: 400 },
    );
  }

  const result = await sendModeratorBroadcastEmails({
    recipients,
    subject,
    message,
  });

  if (!result.configured) {
    return NextResponse.json(
      {
        error:
          "Le SMTP Qoravo n est pas configure sur ce deploiement. Aucun email n a ete envoye.",
      },
      { status: 503 },
    );
  }

  if (result.sent === 0) {
    return NextResponse.json(
      {
        error: "Aucun email n a pu etre envoye.",
        result,
      },
      { status: 502 },
    );
  }

  console.info("Moderator broadcast completed", {
    audience,
    requested: result.requested,
    sent: result.sent,
    failed: result.failed,
  });

  return NextResponse.json({
    message:
      result.failed > 0
        ? `${result.sent} email(s) envoye(s), ${result.failed} echec(s).`
        : `${result.sent} email(s) envoye(s) avec succes.`,
    result,
  });
}
