import { NextResponse } from "next/server";
import {
  clearAdminSessionCookie,
  clearTrustedDeviceCookie,
} from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAdminSessionCookie(response);
  clearTrustedDeviceCookie(response);
  return response;
}
