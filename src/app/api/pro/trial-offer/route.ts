import { NextRequest, NextResponse } from "next/server";
import {
  createTrialOfferToken,
  readTrialOfferToken,
  TRIAL_OFFER_COOKIE,
} from "@/lib/pro/trialOffer";

const COOKIE_LIFETIME_SECONDS = 365 * 24 * 60 * 60;

export function GET(request: NextRequest) {
  const currentToken = request.cookies.get(TRIAL_OFFER_COOKIE)?.value;
  const currentOffer = readTrialOfferToken(currentToken);

  if (currentOffer) {
    return NextResponse.json(currentOffer, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const token = createTrialOfferToken();
  const offer = readTrialOfferToken(token);
  const response = NextResponse.json(offer, {
    headers: { "Cache-Control": "no-store" },
  });

  response.cookies.set(TRIAL_OFFER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_LIFETIME_SECONDS,
  });

  return response;
}
