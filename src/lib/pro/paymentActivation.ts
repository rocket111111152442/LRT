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
  shopAddress?: string | null;
  shopPostalCode?: string | null;
  shopCity?: string | null;
  shopCountry?: string | null;
  shopPhone?: string | null;
  shopEmail?: string | null;
  shopOpeningHours?: string | null;
  shopLatitude?: number | null;
  shopLongitude?: number | null;
  shopCapacityPerDay?: number | null;
  premiumDiscountCode?: string | null;
  supportIncluded?: boolean;
  stripeSessionId?: string | null;
};

function getStringField(record: unknown, field: string) {
  if (typeof record !== "object" || record === null) {
    return null;
  }

  const value = (record as Record<string, unknown>)[field];
  return typeof value === "string" ? value : null;
}

function getNumberField(record: unknown, field: string) {
  if (typeof record !== "object" || record === null) {
    return null;
  }

  const value = (record as Record<string, unknown>)[field];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }

  return null;
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
    shopAddress: getStringField(record, "shopAddress"),
    shopPostalCode: getStringField(record, "shopPostalCode"),
    shopCity: getStringField(record, "shopCity"),
    shopCountry: getStringField(record, "shopCountry"),
    shopPhone: getStringField(record, "shopPhone"),
    shopEmail: getStringField(record, "shopEmail"),
    shopOpeningHours: getStringField(record, "shopOpeningHours"),
    shopLatitude: getNumberField(record, "shopLatitude"),
    shopLongitude: getNumberField(record, "shopLongitude"),
    shopCapacityPerDay: getNumberField(record, "shopCapacityPerDay") ?? 8,
    supportIncluded:
      getStringField(record, "supportIncluded") === "1" ||
      getStringField(record, "setupHelp") === "1",
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
      referralCode: `${data.slug.toUpperCase()}-Qoravo`,
      supportIncluded: data.supportIncluded ?? false,
      shopAddress: data.shopAddress,
      shopPostalCode: data.shopPostalCode,
      shopCity: data.shopCity,
      shopCountry: data.shopCountry,
      shopPhone: data.shopPhone,
      shopEmail: data.shopEmail ?? data.ownerEmail,
      shopOpeningHours: data.shopOpeningHours,
      shopLatitude: data.shopLatitude,
      shopLongitude: data.shopLongitude,
      shopCapacityPerDay: data.shopCapacityPerDay ?? 8,
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

async function createOrReusePaidAccount(
  accountData: PaidProAccountData,
  pendingSignupId?: string,
) {
  const existingAccount = await findExistingAccount(accountData);

  if (existingAccount) {
    if (getStringField(existingAccount, "paymentStatus") === "PAID") {
      if (pendingSignupId) {
        await deletePendingSignup(pendingSignupId);
      }

      return { ok: true, slug: getStringField(existingAccount, "slug") } as const;
    }

    await prisma.proAccount.delete({
      where: { id: getStringField(existingAccount, "id") ?? "" },
    });
  }

  try {
    const proAccount = await createPaidProAccount(accountData);

    if (pendingSignupId) {
      await deletePendingSignup(pendingSignupId);
    }

    return { ok: true, slug: getStringField(proAccount, "slug") } as const;
  } catch {
    const account = await findExistingAccount(accountData);

    if (account) {
      if (pendingSignupId) {
        await deletePendingSignup(pendingSignupId);
      }

      return { ok: true, slug: getStringField(account, "slug") } as const;
    }

    throw new Error("Paid pro account creation failed.");
  }
}

export async function activatePaidCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<ActivationResult> {
  if (session.payment_status !== "paid") {
    return { ok: false, reason: "not-paid" };
  }

  const proAccountId = session.metadata?.proAccountId;
  const supportIncluded = session.metadata?.setupHelp === "1";

  if (proAccountId) {
    const proAccount = await prisma.proAccount.update({
      where: { id: proAccountId },
      data: {
        paymentStatus: "PAID",
        supportIncluded,
        stripeSessionId: session.id,
      },
    });

    return { ok: true, slug: getStringField(proAccount, "slug") };
  }

  const directAccountData = readPaidProAccountData(session.metadata, session.id);

  if (directAccountData) {
    directAccountData.supportIncluded = supportIncluded;
    return createOrReusePaidAccount(directAccountData);
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

  accountData.supportIncluded = supportIncluded;
  return createOrReusePaidAccount(accountData, pendingSignupId);
}
