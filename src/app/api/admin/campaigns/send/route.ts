import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getPublicAppUrl } from "@/lib/appUrl";
import { sendCampaignEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { makeUnsubscribeToken } from "@/lib/unsubscribe";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// On envoie par petits lots : le client rappelle l'API jusqu'a done=true.
// Cela evite de depasser la duree max d'une fonction serverless.
const BATCH = 15;

function readText(body: Record<string, unknown>, key: string) {
  return typeof body[key] === "string" ? String(body[key]).trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const subject = readText(body as Record<string, unknown>, "subject");
  const message = readText(body as Record<string, unknown>, "message");
  const offset = Math.max(0, Number((body as Record<string, unknown>).offset ?? 0));

  if (subject.length < 2 || message.length < 5) {
    return NextResponse.json(
      { error: "Sujet et message requis." },
      { status: 400 },
    );
  }

  const proAccountId = admin.user.proAccountId;
  const all = await prisma.emailContact.findMany({
    where: {
      ...(proAccountId ? { proAccountId } : {}),
      status: "SUBSCRIBED",
    },
    orderBy: { createdAt: "asc" },
  });

  const total = all.length;
  const slice = all.slice(offset, offset + BATCH);
  const appUrl = getPublicAppUrl();

  let sent = 0;
  let failed = 0;
  let smtpMissing = false;

  for (const contact of slice) {
    const token = makeUnsubscribeToken(contact.email);
    const unsubUrl = `${appUrl}/desinscription?e=${encodeURIComponent(contact.email)}&t=${token}`;
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0f172a">
      ${safeMessage}
      <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0">
      <p style="font-size:12px;color:#94a3b8">
        Vous recevez cet email car votre entreprise est referencee comme professionnel de la reparation.
        <a href="${unsubUrl}" style="color:#64748b">Se desinscrire</a>.
      </p>
    </div>`;

    const text = `${message}\n\n---\nSe desinscrire : ${unsubUrl}`;

    const result = await sendCampaignEmail({
      to: contact.email,
      subject,
      text,
      html,
    });

    if (result.sent) {
      sent += 1;
    } else if (result.skipped) {
      smtpMissing = true;
      break; // inutile de continuer si le SMTP n'est pas configure
    } else {
      failed += 1;
    }
  }

  if (smtpMissing) {
    return NextResponse.json(
      {
        error:
          "SMTP non configure : renseignez vos identifiants email dans Admin > Email avant d'envoyer une campagne.",
      },
      { status: 503 },
    );
  }

  const nextOffset = offset + slice.length;
  const done = nextOffset >= total;

  return NextResponse.json({
    total,
    processed: nextOffset,
    nextOffset,
    done,
    sentThisBatch: sent,
    failedThisBatch: failed,
  });
}
