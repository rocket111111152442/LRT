import { NextResponse } from "next/server";
import { getPageViews, incrementAndGetPageViews } from "@/lib/pageViews";

export const dynamic = "force-dynamic";

export async function POST() {
  const views = await incrementAndGetPageViews();
  return NextResponse.json({ views });
}

export async function GET() {
  const views = await getPageViews();
  return NextResponse.json({ views });
}
