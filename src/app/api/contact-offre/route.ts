import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { sendSupportMessageEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const OFFRE_LABELS: Record<string, string> = {
  extra_storage_10gb: "Option Stockage Plus (+10 Go)",
  extra_storage_25gb: "Option Stockage Pro (+25 Go)",
  active_shop_pack:   "Pack Boutique Active",
  big_workshop_pack:  "Pack Gros Atelier",
  multi_shop_pack:    "Pack Multi-Boutiques",
  enterprise:         "Offre Entreprise / Sur mesure",
  demo:               "Démonstration Qoravo de 15 minutes",
};

function read(body: Record<string, unknown>, key: string) {
  return typeof body[key] === "string" ? String(body[key]).trim() : "";
}

export async function POST(request: Request) {
  const limit = rateLimit(
    `contact-offer:${clientIp(request)}`,
    5,
    60 * 60 * 1000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop de demandes. Reessayez plus tard." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }
  if (typeof body !== "object" || !body) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name    = read(b, "name");
  const email   = read(b, "email").toLowerCase();
  const offreId = read(b, "offre");
  const message = read(b, "message").slice(0, 5000);

  if (name.length < 2 || name.length > 120) return NextResponse.json({ errors: { name: "Nom invalide." } }, { status: 400 });
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ errors: { email: "Email invalide." } }, { status: 400 });
  if (offreId && !(offreId in OFFRE_LABELS)) return NextResponse.json({ errors: { offre: "Offre invalide." } }, { status: 400 });
  if (message.length < 5) return NextResponse.json({ errors: { message: "Message requis." } }, { status: 400 });

  const offreLabel = OFFRE_LABELS[offreId] ?? "Offre Qoravo";
  const subject    = `Demande d'activation : ${offreLabel}`;

  // Récupère le proAccountId si l'utilisateur est connecté
  const admin = await getCurrentAdmin().catch(() => null);

  await prisma.supportMessage.create({
    data: {
      proAccountId: admin?.proAccountId ?? undefined,
      name, email, subject, message,
      offre: offreId || null,
    },
  }).catch(() => {});

  await sendSupportMessageEmail({ name, email, subject, message }).catch(() => {});

  return NextResponse.json({ message: "Demande envoyée. Nous revenons vers vous sous 24h." });
}
