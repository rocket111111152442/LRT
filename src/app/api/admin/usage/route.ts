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

  let account: AccountPlanInput = {};

  if (admin.user.proAccountId) {
    const found = await prisma.proAccount.findUnique({
      where: { id: admin.user.proAccountId },
      select: { plan: true, storageAddonGb: true },
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

  return NextResponse.json({
    plan: account.plan ?? "basic",
    evaluation,
    options: PLAN_OPTIONS,
  });
}
