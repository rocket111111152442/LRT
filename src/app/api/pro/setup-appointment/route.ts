import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendSetupAppointmentEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { activatePaidCheckoutSession } from "@/lib/pro/paymentActivation";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

function readMetadataText(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe non configure cote serveur." },
      { status: 503 },
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

  const sessionId = readText(body, "sessionId");
  const requestedAt = new Date(readText(body, "requestedAt"));
  const contactPhone = readText(body, "contactPhone");
  const notes = readText(body, "notes").slice(0, 1000);

  if (!sessionId) {
    return NextResponse.json({ error: "Session Stripe manquante." }, { status: 400 });
  }

  if (Number.isNaN(requestedAt.getTime())) {
    return NextResponse.json({ error: "Date de rendez-vous invalide." }, { status: 400 });
  }

  if (requestedAt.getTime() < Date.now() - 5 * 60 * 1000) {
    return NextResponse.json(
      { error: "Choisissez un creneau a venir." },
      { status: 400 },
    );
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Paiement non confirme par Stripe." },
        { status: 402 },
      );
    }

    if (session.metadata?.setupHelp !== "1") {
      return NextResponse.json(
        { error: "L option aide installation n a pas ete payee." },
        { status: 403 },
      );
    }

    const activation = await activatePaidCheckoutSession(session);

    if (!activation.ok) {
      return NextResponse.json(
        { error: "Compte impossible a activer pour le moment." },
        { status: 500 },
      );
    }

    const companyName = readMetadataText(session.metadata, "companyName") || "Atelier";
    const ownerEmail =
      readMetadataText(session.metadata, "ownerEmail") ||
      session.customer_email ||
      "";
    const proAccount = activation.slug
      ? await prisma.proAccount.findUnique({
          where: { slug: activation.slug },
          select: { id: true, companyName: true, ownerEmail: true },
        })
      : null;

    const existing = await prisma.setupAppointment.findUnique({
      where: { stripeSessionId: session.id },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({
        message: "Votre rendez-vous est deja enregistre.",
      });
    }

    await prisma.setupAppointment.create({
      data: {
        proAccountId: proAccount?.id,
        stripeSessionId: session.id,
        companyName: proAccount?.companyName ?? companyName,
        ownerEmail: proAccount?.ownerEmail ?? ownerEmail,
        requestedAt,
        contactPhone: contactPhone || null,
        notes: notes || null,
      },
    });

    const mailResult = await sendSetupAppointmentEmail({
      companyName: proAccount?.companyName ?? companyName,
      ownerEmail: proAccount?.ownerEmail ?? ownerEmail,
      requestedAt,
      contactPhone: contactPhone || null,
      notes: notes || null,
    });

    return NextResponse.json({
      message: mailResult.sent
        ? "Rendez-vous enregistre. Vous serez contacte au creneau choisi."
        : "Rendez-vous enregistre. L email interne n est pas parti, mais la demande est sauvegardee.",
    });
  } catch (error) {
    console.error("Setup appointment failed", error);
    return NextResponse.json(
      { error: "Rendez-vous impossible a enregistrer pour le moment." },
      { status: 500 },
    );
  }
}

