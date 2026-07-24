import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { sendSupportMessageEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

type SupportErrors = Partial<
  Record<"name" | "email" | "subject" | "message", string>
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

const SUPPORT_CATEGORIES = [
  "Connexion / accès",
  "Paiement / facturation",
  "Emails / notifications",
  "QR code / suivi",
  "Réparations / fiches",
  "Stock / catalogue",
  "Comptabilité",
  "Agenda / rendez-vous",
  "Bug / erreur technique",
  "Autre",
];

export async function GET() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  if (!admin.user.proAccountId) {
    return NextResponse.json({ messages: [] });
  }

  const messages = await prisma.supportMessage.findMany({
    where: { proAccountId: admin.user.proAccountId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    categories: SUPPORT_CATEGORIES,
    messages: messages.map((m) => ({
      id: m.id,
      subject: m.subject,
      message: m.message,
      category: m.category ?? null,
      priority: m.priority ?? "NORMAL",
      ticketRef: m.ticketRef ?? null,
      status: m.status,
      replyText: m.replyText ?? null,
      repliedAt: m.repliedAt ?? null,
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  if (!admin.user.supportIncluded) {
    return NextResponse.json(
      {
        error:
          "Service client reserve aux comptes avec l'option assistance annuelle.",
      },
      { status: 403 },
    );
  }

  const limiter = rateLimit(
    `support:${admin.user.id}`,
    10,
    60 * 60 * 1000,
  );

  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Trop de demandes. Reessayez plus tard." },
      {
        status: 429,
        headers: { "Retry-After": String(limiter.retryAfterSeconds) },
      },
    );
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

  const data = {
    name: readText(body, "name"),
    email: readText(body, "email").toLowerCase(),
    subject: readText(body, "subject"),
    message: readText(body, "message"),
  };
  const category = readText(body, "category") || null;
  const priority = readText(body, "priority") === "URGENT" ? "URGENT" : "NORMAL";
  const ticketRef = readText(body, "ticketRef") || null;
  const errors: SupportErrors = {};

  if (data.name.length < 2) {
    errors.name = "Nom requis.";
  } else if (data.name.length > 120) {
    errors.name = "Nom trop long.";
  }

  if (
    !data.email ||
    data.email.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  ) {
    errors.email = "Email invalide.";
  }

  if (data.subject.length < 3) {
    errors.subject = "Sujet requis.";
  } else if (data.subject.length > 200) {
    errors.subject = "Sujet trop long.";
  }

  if (data.message.length < 10) {
    errors.message = "Message trop court.";
  } else if (data.message.length > 10_000) {
    errors.message = "Message trop long.";
  }

  if (ticketRef && ticketRef.length > 100) {
    return NextResponse.json({ error: "Reference trop longue." }, { status: 400 });
  }

  if (category && !SUPPORT_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Categorie invalide." }, { status: 400 });
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Sauvegarde en base pour le panel modérateur.
  await prisma.supportMessage.create({
    data: {
      proAccountId: admin.user.proAccountId ?? undefined,
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      category,
      priority,
      ticketRef,
    },
  }).catch(() => { /* non bloquant */ });

  const result = await sendSupportMessageEmail({
    ...data,
    subject: priority === "URGENT" ? `[URGENT] ${data.subject}` : data.subject,
  });

  if (result.skipped) {
    return NextResponse.json(
      { error: "Service client indisponible : SMTP non configure." },
      { status: 503 },
    );
  }

  if (!result.sent) {
    return NextResponse.json(
      { error: "Message impossible a envoyer pour le moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message:
      "Message envoye. Le service client peut recevoir votre demande 24h/24.",
  });
}
