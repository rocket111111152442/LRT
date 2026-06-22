import { NextResponse } from "next/server";
import { clearModSession } from "@/lib/modAuth";

export async function POST() {
  await clearModSession();
  return NextResponse.json({ ok: true });
}
