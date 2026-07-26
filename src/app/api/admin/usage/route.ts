import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import {
  evaluateUsage,
  PLAN_OPTIONS,
  resolveAccountLimits,
  type AccountPlanInput,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { computeAccountUsage } from "@/lib/usage";

export async function GET() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  let account: AccountPlanInput & {
    storageAddonGb?: number | null;
    firebaseProjectId?: string | null;
  } = {};

  if (admin.user.proAccountId) {
    const found = await prisma.proAccount.findUnique({
      where: { id: admin.user.proAccountId },
      select: {
        plan: true,
        storageAddonGb: true,
        firebaseProjectId: true,
      },
    });

    if (found) {
      account = found;
    }
  }

  const limits = resolveAccountLimits(account);
  const usage = await computeAccountUsage(admin.user.proAccountId);
  const evaluation = evaluateUsage({
    limits,
    storageUsedBytes: usage.storageUsedBytes,
    repairsThisMonth: usage.repairsThisMonth,
  });
  const providerProjectId =
    process.env.FIREBASE_PROJECT_ID ?? account.firebaseProjectId ?? null;

  return NextResponse.json({
    plan: account.plan ?? "basic",
    capacity: {
      includedBytes: resolveAccountLimits({
        plan: account.plan,
        storageAddonGb: 0,
      }).storageBytes,
      purchasedAddonBytes: Math.max(0, account.storageAddonGb ?? 0) * 1024 * 1024 * 1024,
      purchasedAddonGb: Math.max(0, account.storageAddonGb ?? 0),
    },
    usage,
    evaluation,
    options: PLAN_OPTIONS,
    upgradeUrl: "/admin/offres#augmenter-stockage",
    provider: {
      name: "Firebase / Firestore",
      consoleUrl: providerProjectId
        ? `https://console.firebase.google.com/project/${encodeURIComponent(providerProjectId)}/firestore`
        : null,
      pricingUrl: "https://firebase.google.com/pricing",
    },
  }, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
