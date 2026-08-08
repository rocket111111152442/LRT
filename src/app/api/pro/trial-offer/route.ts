import { NextRequest, NextResponse } from "next/server";
import {
  createTrialUsedToken,
  readTrialUsedToken,
  TRIAL_OFFER_COOKIE,
  TRIAL_USED_COOKIE,
} from "@/lib/pro/trialOffer";
import { getAdminSessionState } from "@/lib/auth";

const COOKIE_LIFETIME_SECONDS = 365 * 24 * 60 * 60;

function usedResponse() {
  const response = NextResponse.json(
    { available: false, used: true, expiresAt: null },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set(TRIAL_USED_COOKIE, createTrialUsedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_LIFETIME_SECONDS,
  });
  response.cookies.set(TRIAL_OFFER_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const usedToken = request.cookies.get(TRIAL_USED_COOKIE)?.value;
  if (readTrialUsedToken(usedToken)) {
    return usedResponse();
  }

  const session = await getAdminSessionState();
  if (session.status !== "none") {
    return usedResponse();
  }

  // L'essai gratuit est disponible en permanence pour tout visiteur qui ne l'a
  // pas encore utilisé (plus de fenêtre de 72 heures qui bloquait les prospects).
  return NextResponse.json(
    { available: true, used: false, expiresAt: null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
