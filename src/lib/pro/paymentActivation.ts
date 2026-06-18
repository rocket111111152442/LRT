import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

type ActivationResult =
  | { ok: true; slug: string | null }
  | { ok: false; reason: "missing-account" | "missing-signup" | "not-paid" };

export type PaidProAccountData = {
  companyName: string;
  slug: string;
  ownerEmail: string;
  passwordHash: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket?: string | null;
  firebaseMessagingSenderId?: string | null;
  firebaseAppId: string;
  stripeSessionId?: string | null;
};

function getStringField(record: unknown, field: string) {
  if (typeof record !== "object" || record === null) {
    return null;
  }

  const value = (record as Record<string, unknown>)[field];
  return typeof value === "string" ? value : null;
}

function readPaidProAccountData(
  record: unknown,
  stripeSessionId: string,
): PaidProAccountData | null {
  const data = {
    companyName: getStringField(record, "companyName"),
    slug: getStringField(record, "slug"),
    ownerEmail: getStringField(record, "ownerEmail"),
    passwordHash: getStringField(record, "passwordHash"),
    firebaseApiKey: getStringField(record, "firebaseApiKey"),
    firebaseAuthDomain: getStringField(record, "firebaseAuthDomain"),
    firebaseProjectId: getStringField(record, "firebaseProjectId"),
    firebaseStorageBucket: getStringField(record, "firebaseStorageBucket"),
    firebaseMessagingSenderId: getStringField(record, "firebaseMessagingSenderId"),
    firebaseAppId: getStringField(record, "firebaseAppId"),
    stripeSessionId,
  };

  if (
    !data.companyName ||
    !data.slug ||
    !data.ownerEmail ||
    !data.passwordHash ||
    !data.firebaseApiKey ||
    !data.firebaseAuthDomain ||
    !data.firebaseProjectId ||
    !data.firebaseAppId
  ) {
    return null;
  }

  return data as PaidProAccountData;
}

export async function createPaidProAccount(data: PaidProAccountData) {
  return prisma.proAccount.create({
    data: {
      companyName: data.companyName,
      slug: data.slug,
      ownerEmail: data.ownerEmail,
      firebaseApiKey: data.firebaseApiKey,
      firebaseAuthDomain: data.firebaseAuthDomain,
      firebaseProjectId: data.firebaseProjectId,
      firebaseStorageBucket: data.firebaseStorageBucket,
      firebaseMessagingSenderId: data.firebaseMessagingSenderId,
      firebaseAppId: data.firebaseAppId,
      paymentStatus: "PAID",
      stripeSessionId: data.stripeSessionId,
      users: {
        create: {
          email: data.ownerEmail,
          passwordHash: data.passwordHash,
          role: "ADMIN",
        },
      },
    },
  });
}

async function deletePendingSignup(id: string) {
  try {
    await prisma.pendingProSignup.delete({ where: { id } });
  } catch {
    // The webhook and the return page can both confirm the same payment.
  }
}

async function findExistingAccount(data: PaidProAccountData) {
  const byOwnerEmail = await prisma.proAccount.findUnique({
    where: { ownerEmail: data.ownerEmail },
    select: { id: true, slug: true, paymentStatus: true },
  });

  if (byOwnerEmail) {
    return byOwnerEmail;
  }

  return prisma.proAccount.findUnique({
    where: { slug: data.slug },
    select: { id: true, slug: true, paymentStatus: true },
  });
}

export async function activatePaidCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<ActivationResult> {
  if (session.payment_status !== "paid") {
    return { ok: false, reason: "not-paid" };
  }

  const proAccountId = session.metadata?.proAccountId;

  if (proAccountId) {
    const proAccount = await prisma.proAccount.update({
      where: { id: proAccountId },
      data: {
        paymentStatus: "PAID",
        stripeSessionId: session.id,
      },
    });

    return { ok: true, slug: getStringField(proAccount, "slug") };
  }

  const pendingSignupId =
    session.metadata?.pendingProSignupId ?? session.client_reference_id;

  if (!pendingSignupId) {
    return { ok: false, reason: "missing-account" };
  }

  const pendingSignup = await prisma.pendingProSignup.findUnique({
    where: { id: pendingSignupId },
  });

  if (!pendingSignup) {
    return { ok: false, reason: "missing-signup" };
  }

  const accountData = readPaidProAccountData(pendingSignup, session.id);

  if (!accountData) {
    return { ok: false, reason: "missing-signup" };
  }

  const existingAccount = await findExistingAccount(accountData);

  if (existingAccount) {
    if (getStringField(existingAccount, "paymentStatus") === "PAID") {
      await deletePendingSignup(pendingSignupId);
      return { ok: true, slug: getStringField(existingAccount, "slug") };
    }

    await prisma.proAccount.delete({
      where: { id: getStringField(existingAccount, "id") ?? "" },
    });
  }

  try {
    const proAccount = await createPaidProAccount(accountData);
    await deletePendingSignup(pendingSignupId);
    return { ok: true, slug: getStringField(proAccount, "slug") };
  } catch {
    const account = await findExistingAccount(accountData);

    if (account) {
      await deletePendingSignup(pendingSignupId);
      return { ok: true, slug: getStringField(account, "slug") };
    }

    throw new Error("Paid pro account creation failed.");
  }
}
