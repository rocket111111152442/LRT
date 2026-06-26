import { NextResponse } from "next/server";
import {
  clearAdminSessionCookie,
  clearImpersonationCookie,
  getImpersonation,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Le modérateur quitte la prise en main : on efface la session admin
// impersonifiée et le marqueur. Sa session modérateur reste intacte.
export async function POST() {
  const impersonation = await getImpersonation();
  const response = NextResponse.json({ ok: true });

  if (impersonation) {
    await prisma.controlRequest
      .updateMany({
        where: { proAccountId: impersonation.proAccountId, status: "ACCEPTED" },
        data: { status: "ENDED", endedAt: new Date() },
      })
      .catch(() => {});
  }

  clearImpersonationCookie(response);
  clearAdminSessionCookie(response);
  return response;
}
