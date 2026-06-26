import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { requireModApi } from "@/lib/modAuth";
import { setAdminSessionCookie, setImpersonationCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Durée pendant laquelle une demande de prise en main reste valable (le
// commerçant doit accepter, et le modérateur entrer, dans ce délai).
const CONTROL_REQUEST_TTL_MS = 30 * 60 * 1000; // 30 min

type Context = { params: Promise<{ id: string }> };

function readText(body: Record<string, unknown>, key: string) {
  return typeof body[key] === "string" ? String(body[key]).trim() : "";
}

export async function GET(_req: Request, ctx: Context) {
  const auth = await requireModApi();
  if (!auth.ok) return auth.response as unknown as ReturnType<typeof NextResponse.json>;

  const { id } = await ctx.params;
  const [account, users, repairs, messages] = await Promise.all([
    prisma.proAccount.findUnique({ where: { id } }),
    prisma.user.findMany
      ? prisma.user.findMany({ where: { proAccountId: id } } as Parameters<typeof prisma.user.findMany>[0]).catch(() => [])
      : Promise.resolve([]),
    prisma.repair.findMany({
      where: { proAccountId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, ticketNumber: true, firstName: true, lastName: true,
        status: true, paymentStatus: true, estimatedPriceCents: true,
        paidAmountCents: true, createdAt: true, brand: true, model: true,
        deviceType: true, phone: true, email: true,
      },
    }),
    prisma.supportMessage.findMany({
      where: { proAccountId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!account) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const accountWithUsers = {
    ...account,
    users: (users as Array<{ id: string; email: string; role: string; createdAt: unknown }>).map((u) => ({
      id: u.id, email: u.email, role: u.role,
    })),
  };

  return NextResponse.json({ account: accountWithUsers, repairs, messages });
}

export async function POST(request: Request, ctx: Context) {
  const auth = await requireModApi();
  if (!auth.ok) return auth.response as unknown as ReturnType<typeof NextResponse.json>;

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Requete invalide." }, { status: 400 });

  const action = readText(body as Record<string, unknown>, "action");

  // ---- Actions disponibles ----

  if (action === "extend_trial") {
    const hours = Number((body as Record<string, unknown>).hours ?? 72);
    await prisma.proAccount.update({
      where: { id },
      data: {
        paymentStatus: "TRIAL",
        trialEndsAt: new Date(Date.now() + hours * 60 * 60 * 1000),
      },
    });
    return NextResponse.json({ ok: true, message: `Essai prolongé de ${hours}h.` });
  }

  if (action === "set_paid") {
    await prisma.proAccount.update({
      where: { id },
      data: { paymentStatus: "PAID", trialEndsAt: null },
    });
    return NextResponse.json({ ok: true, message: "Compte marqué PAYÉ." });
  }

  if (action === "set_plan") {
    const plan = readText(body as Record<string, unknown>, "plan") || "basic";
    await prisma.proAccount.update({ where: { id }, data: { plan } });
    return NextResponse.json({ ok: true, message: `Plan mis à jour : ${plan}.` });
  }

  if (action === "toggle_support") {
    const account = await prisma.proAccount.findUnique({ where: { id }, select: { supportIncluded: true } });
    const next = !account?.supportIncluded;
    await prisma.proAccount.update({ where: { id }, data: { supportIncluded: next } });
    return NextResponse.json({ ok: true, message: next ? "Support activé." : "Support désactivé." });
  }

  if (action === "reset_password") {
    const newPassword = readText(body as Record<string, unknown>, "newPassword");
    if (newPassword.length < 6) return NextResponse.json({ error: "Mot de passe trop court (6 min)." }, { status: 400 });
    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.updateMany({ where: { proAccountId: id }, data: { passwordHash: hash } });
    return NextResponse.json({ ok: true, message: "Mot de passe réinitialisé." });
  }

  if (action === "cancel_account") {
    await prisma.proAccount.update({ where: { id }, data: { paymentStatus: "CANCELED" } });
    return NextResponse.json({ ok: true, message: "Compte annulé." });
  }

  if (action === "delete_account") {
    // Suppression en cascade : réparations, utilisateurs, stock, messages, etc.
    // La relation ProAccount -> * est définie avec onDelete: Cascade dans le schéma.
    await prisma.proAccount.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: "Compte et toutes ses données supprimés définitivement.", deleted: true });
  }

  if (action === "message_note") {
    const msgId = readText(body as Record<string, unknown>, "messageId");
    const note  = readText(body as Record<string, unknown>, "note");
    const status = readText(body as Record<string, unknown>, "status") || "OPEN";
    await prisma.supportMessage.update({
      where: { id: msgId },
      data: { moderatorNote: note, status },
    });
    return NextResponse.json({ ok: true, message: "Note enregistrée." });
  }

  // ---- Prise en main (support à distance avec consentement) ----

  if (action === "request_control") {
    const account = await prisma.proAccount.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!account) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

    // On annule toute demande encore en cours pour repartir propre.
    await prisma.controlRequest.updateMany({
      where: { proAccountId: id, status: { in: ["PENDING", "ACCEPTED"] } },
      data: { status: "CANCELED", endedAt: new Date() },
    });

    const reason = readText(body as Record<string, unknown>, "reason");
    const request = await prisma.controlRequest.create({
      data: {
        proAccountId: id,
        status: "PENDING",
        reason: reason || null,
        expiresAt: new Date(Date.now() + CONTROL_REQUEST_TTL_MS),
      },
    });
    return NextResponse.json({
      ok: true,
      message: "Demande envoyée. En attente de l'accord du commerçant.",
      request: { id: request.id, status: request.status, expiresAt: request.expiresAt },
    });
  }

  if (action === "control_status") {
    const request = await prisma.controlRequest.findFirst({
      where: { proAccountId: id },
      orderBy: { createdAt: "desc" },
    });
    if (!request) return NextResponse.json({ request: null });

    // Une demande PENDING expirée est considérée comme telle.
    const expired =
      request.status === "PENDING" && request.expiresAt.getTime() < Date.now();
    return NextResponse.json({
      request: {
        id: request.id,
        status: expired ? "EXPIRED" : request.status,
        expiresAt: request.expiresAt,
        respondedAt: request.respondedAt,
      },
    });
  }

  if (action === "cancel_control") {
    await prisma.controlRequest.updateMany({
      where: { proAccountId: id, status: { in: ["PENDING", "ACCEPTED"] } },
      data: { status: "CANCELED", endedAt: new Date() },
    });
    return NextResponse.json({ ok: true, message: "Demande annulée." });
  }

  if (action === "enter_control") {
    const request = await prisma.controlRequest.findFirst({
      where: { proAccountId: id, status: "ACCEPTED" },
      orderBy: { createdAt: "desc" },
    });
    if (!request || request.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Aucun accord valide. Renvoyez une demande de prise en main." },
        { status: 409 },
      );
    }

    const account = await prisma.proAccount.findUnique({
      where: { id },
      select: { id: true, companyName: true },
    });
    const adminUser = await prisma.user.findFirst({
      where: { proAccountId: id, role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, proAccountId: true },
    });
    if (!account || !adminUser) {
      return NextResponse.json({ error: "Compte ou utilisateur admin introuvable." }, { status: 404 });
    }

    const response = NextResponse.json({
      ok: true,
      message: "Prise en main active.",
      redirect: "/admin",
    });
    // On impersonifie le premier admin du compte : la session admin donne accès
    // à tout le logiciel (stock, agenda, réparations, compta...).
    setAdminSessionCookie(response, {
      id: adminUser.id,
      email: adminUser.email,
      role: "ADMIN",
      proAccountId: adminUser.proAccountId,
      proAccountSlug: null,
      paymentStatus: null,
      trialEndsAt: null,
      supportIncluded: false,
    });
    setImpersonationCookie(response, {
      proAccountId: account.id,
      companyName: account.companyName,
    });
    return response;
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
