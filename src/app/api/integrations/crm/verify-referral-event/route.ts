import { NextResponse } from "next/server";
import { readReferralEventToken } from "@/lib/pro/referralEventToken";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const limit = rateLimit(
    `verify-referral:${clientIp(request)}`,
    120,
    15 * 60 * 1000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { valid: false, error: "Trop de vérifications." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const token = typeof body.eventToken === "string" ? body.eventToken : "";
  const event = token.length <= 8_000 ? readReferralEventToken(token) : null;

  if (!event) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({ valid: true, event });
}

