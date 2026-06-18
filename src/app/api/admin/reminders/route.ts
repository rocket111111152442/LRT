import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { processReadyReminders } from "@/lib/readyReminders";

export async function POST() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const result = await processReadyReminders(admin.user.proAccountId);
  return NextResponse.json(result);
}
