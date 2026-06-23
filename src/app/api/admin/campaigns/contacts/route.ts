import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function accountWhere(proAccountId: string | null) {
  return proAccountId ? { proAccountId } : {};
}

// Extrait des contacts depuis un texte colle (une ligne par contact).
// Formats acceptes : "email", "email,nom", "email,nom,societe" (ou ; ou tab).
function parseContacts(raw: string) {
  const lines = raw.split(/\r?\n/);
  const out: { email: string; name: string | null; company: string | null }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/[,;\t]/).map((p) => p.trim());
    const email = (parts[0] ?? "").toLowerCase();
    if (!EMAIL_RE.test(email)) continue;
    out.push({
      email,
      name: parts[1] || null,
      company: parts[2] || null,
    });
  }

  return out;
}

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const contacts = await prisma.emailContact.findMany({
    where: accountWhere(admin.user.proAccountId),
    orderBy: { createdAt: "desc" },
  });

  const subscribed = contacts.filter((c) => c.status === "SUBSCRIBED").length;

  return NextResponse.json({
    contacts,
    total: contacts.length,
    subscribed,
    unsubscribed: contacts.length - subscribed,
  });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const body = await request.json().catch(() => null);
  const raw =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).raw === "string"
      ? String((body as Record<string, unknown>).raw)
      : "";

  const parsed = parseContacts(raw);

  if (parsed.length === 0) {
    return NextResponse.json(
      { error: "Aucune adresse email valide trouvee." },
      { status: 400 },
    );
  }

  const proAccountId = admin.user.proAccountId;
  const existing = await prisma.emailContact.findMany({
    where: accountWhere(proAccountId),
    select: { email: true },
  });
  const existingEmails = new Set(existing.map((c) => c.email.toLowerCase()));

  let added = 0;
  const seen = new Set<string>();

  for (const contact of parsed) {
    if (existingEmails.has(contact.email) || seen.has(contact.email)) {
      continue;
    }
    seen.add(contact.email);

    await prisma.emailContact.create({
      data: {
        proAccountId: proAccountId ?? undefined,
        email: contact.email,
        name: contact.name,
        company: contact.company,
      },
    });
    added += 1;
  }

  return NextResponse.json({
    added,
    duplicates: parsed.length - added,
  });
}

export async function DELETE(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
  }

  const contact = await prisma.emailContact.findUnique({ where: { id } });

  if (!contact || (admin.user.proAccountId && contact.proAccountId !== admin.user.proAccountId)) {
    return NextResponse.json({ error: "Contact introuvable." }, { status: 404 });
  }

  await prisma.emailContact.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
