import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { checkModPassword, requireModApi } from "@/lib/modAuth";
import { setAdminSessionCookie, setImpersonationCookie } from "@/lib/auth";
import { sendSupportReplyEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

// Durée pendant laquelle une demande de prise en main reste valable (le
// commerçant doit accepter, et le modérateur entrer, dans ce délai).
const CONTROL_REQUEST_TTL_MS = 30 * 60 * 1000; // 30 min
const SCREEN_SHARE_REQUEST_TTL_MS = 5 * 60 * 1000; // 5 min
const SENSITIVE_ACTIONS = new Set([
  "extend_trial",
  "set_paid",
  "set_plan",
  "toggle_support",
  "reset_password",
  "cancel_account",
  "delete_account",
  "enter_control",
]);
const ALLOWED_PLANS = new Set([
  "basic",
  "extra_storage_10gb",
  "extra_storage_25gb",
  "active_shop_pack",
  "big_workshop_pack",
  "multi_shop_pack",
  "enterprise",
]);

type Context = { params: Promise<{ id: string }> };

function readText(body: Record<string, unknown>, key: string) {
  return typeof body[key] === "string" ? String(body[key]).trim() : "";
}

export async function GET(_req: Request, ctx: Context) {
  const auth = await requireModApi();
  if (!auth.ok) return auth.response as unknown as ReturnType<typeof NextResponse.json>;

  const { id } = await ctx.params;
  const [account, users, repairs, messages] = await Promise.all([
    prisma.proAccount.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        slug: true,
        ownerEmail: true,
        paymentStatus: true,
        trialEndsAt: true,
        supportIncluded: true,
        plan: true,
        storageAddonGb: true,
        createdAt: true,
      },
    }),
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

  if (
    SENSITIVE_ACTIONS.has(action) &&
    !checkModPassword(
      readText(body as Record<string, unknown>, "moderatorPassword"),
    )
  ) {
    return NextResponse.json(
      { error: "Mot de passe moderateur requis pour cette action." },
      { status: 403 },
    );
  }

  // ---- Actions disponibles ----

  if (action === "extend_trial") {
    const hours = Number((body as Record<string, unknown>).hours ?? 72);

    if (!Number.isInteger(hours) || hours < 1 || hours > 720) {
      return NextResponse.json(
        { error: "Duree invalide (1 a 720 heures)." },
        { status: 400 },
      );
    }

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

    if (!ALLOWED_PLANS.has(plan)) {
      return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
    }

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
    if (
      newPassword.length < 12 ||
      newPassword.length > 128 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return NextResponse.json(
        {
          error:
            "Mot de passe trop faible (12 caracteres, une lettre et un chiffre minimum).",
        },
        { status: 400 },
      );
    }
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

  if (action === "reply_message") {
    const msgId = readText(body as Record<string, unknown>, "messageId");
    const replyText = readText(body as Record<string, unknown>, "replyText");
    if (!msgId || replyText.length < 2 || replyText.length > 10_000) {
      return NextResponse.json({ error: "Réponse trop courte." }, { status: 400 });
    }

    const message = await prisma.supportMessage.findUnique({ where: { id: msgId } });
    if (!message || message.proAccountId !== id) {
      return NextResponse.json({ error: "Message introuvable." }, { status: 404 });
    }

    const result = await sendSupportReplyEmail({
      to: message.email,
      customerName: message.name,
      originalSubject: message.subject,
      replyMessage: replyText,
    });

    if (result.skipped) {
      return NextResponse.json(
        { error: "Email non envoyé : SMTP non configuré." },
        { status: 503 },
      );
    }
    if (!result.sent) {
      return NextResponse.json(
        { error: "Échec de l'envoi de l'email." },
        { status: 502 },
      );
    }

    await prisma.supportMessage.update({
      where: { id: msgId },
      data: { replyText, repliedAt: new Date(), status: "ANSWERED" },
    });

    return NextResponse.json({ ok: true, message: `Réponse envoyée à ${message.email}.` });
  }

  if (action === "message_note") {
    const msgId = readText(body as Record<string, unknown>, "messageId");
    const note  = readText(body as Record<string, unknown>, "note");
    const status = readText(body as Record<string, unknown>, "status") || "OPEN";
    const message = await prisma.supportMessage.findUnique({ where: { id: msgId } });

    if (
      !message ||
      message.proAccountId !== id ||
      note.length > 5_000 ||
      !new Set(["OPEN", "ANSWERED", "CLOSED"]).has(status)
    ) {
      return NextResponse.json({ error: "Note ou statut invalide." }, { status: 400 });
    }

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
    if (reason.length > 500) {
      return NextResponse.json({ error: "Motif trop long." }, { status: 400 });
    }
    const request = await prisma.controlRequest.create({
      data: {
        proAccountId: id,
        status: "PENDING",
        reason: reason || null,
        expiresAt: new Date(Date.now() + CONTROL_REQUEST_TTL_MS),
        screenShareStatus: "NOT_REQUESTED",
      },
    });
    return NextResponse.json({
      ok: true,
      message: "Demande envoyée. En attente de l'accord du commerçant.",
      request: { id: request.id, status: request.status, expiresAt: request.expiresAt },
    });
  }

  if (action === "request_screen_share") {
    const controlRequest = await prisma.controlRequest.findFirst({
      where: {
        proAccountId: id,
        status: "ACCEPTED",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!controlRequest) {
      return NextResponse.json(
        { error: "La prise en main doit d abord etre acceptee." },
        { status: 409 },
      );
    }

    await prisma.controlSignal.deleteMany({
      where: { controlRequestId: controlRequest.id },
    });
    await prisma.controlRequest.update({
      where: { id: controlRequest.id },
      data: {
        screenShareStatus: "PENDING",
        screenShareRequestedAt: new Date(),
        screenShareRespondedAt: null,
        screenShareExpiresAt: new Date(
          Date.now() + SCREEN_SHARE_REQUEST_TTL_MS,
        ),
      },
    });

    return NextResponse.json({
      ok: true,
      message:
        "Demande d affichage en direct envoyee. Le commercant doit l autoriser.",
      screenShareStatus: "PENDING",
    });
  }

  if (action === "cancel_screen_share") {
    const controlRequest = await prisma.controlRequest.findFirst({
      where: { proAccountId: id, status: "ACCEPTED" },
      orderBy: { createdAt: "desc" },
    });

    if (controlRequest) {
      await prisma.controlRequest.update({
        where: { id: controlRequest.id },
        data: {
          screenShareStatus: "CANCELED",
          screenShareRespondedAt: new Date(),
        },
      });
      await prisma.controlSignal.deleteMany({
        where: { controlRequestId: controlRequest.id },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Demande d affichage en direct annulee.",
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
    const screenShareExpired =
      request.screenShareStatus === "PENDING" &&
      request.screenShareExpiresAt &&
      request.screenShareExpiresAt.getTime() < Date.now();
    return NextResponse.json({
      request: {
        id: request.id,
        status: expired ? "EXPIRED" : request.status,
        expiresAt: request.expiresAt,
        respondedAt: request.respondedAt,
        screenShareStatus:
          screenShareExpired
            ? "EXPIRED"
            : (request.screenShareStatus ?? "NOT_REQUESTED"),
        screenShareExpiresAt: request.screenShareExpiresAt,
      },
    });
  }

  if (action === "cancel_control") {
    await prisma.controlRequest.updateMany({
      where: { proAccountId: id, status: { in: ["PENDING", "ACCEPTED"] } },
      data: {
        status: "CANCELED",
        endedAt: new Date(),
        screenShareStatus: "CANCELED",
        screenShareRespondedAt: new Date(),
      },
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
      select: { id: true, email: true, passwordHash: true, proAccountId: true },
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
    }, {
      passwordHash: adminUser.passwordHash,
    });
    setImpersonationCookie(response, {
      proAccountId: account.id,
      companyName: account.companyName,
    });
    return response;
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
