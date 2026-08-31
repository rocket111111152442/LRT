import { NextResponse } from "next/server";
import { visitRequestSchema } from "@/lib/validations/search-alert";
import { looksLikeSpam } from "@/lib/forms/anti-spam";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { getPropertyBySlug } from "@/lib/data/properties";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  if (isRateLimited(`visit-request:${ip}`)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = visitRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error" }, { status: 422 });
  }

  if (!getPropertyBySlug(parsed.data.propertySlug)) {
    return NextResponse.json({ ok: false, error: "unknown_property" }, { status: 404 });
  }

  if (looksLikeSpam(parsed.data)) {
    return NextResponse.json({ ok: true });
  }

  console.info("[visit-request] demande de visite de démonstration", {
    property: parsed.data.propertySlug,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
