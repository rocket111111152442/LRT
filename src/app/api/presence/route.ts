import { NextResponse } from "next/server";
import { heartbeat, onlineCount } from "@/lib/presence";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawId =
    body && typeof body === "object" && "id" in body
      ? (body as Record<string, unknown>).id
      : null;

  if (typeof rawId === "string" && rawId) {
    heartbeat(rawId.slice(0, 64));
  }

  return NextResponse.json({ online: onlineCount() });
}

export async function GET() {
  return NextResponse.json({ online: onlineCount() });
}
