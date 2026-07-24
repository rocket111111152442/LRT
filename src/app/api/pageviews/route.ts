import { NextResponse } from "next/server";
import { getPageViews, incrementAndGetPageViews } from "@/lib/pageViews";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = rateLimit(
    `page-view:${clientIp(request)}`,
    60,
    60 * 60 * 1000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Limite atteinte." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const views = await incrementAndGetPageViews();
  return NextResponse.json({ views });
}

export async function GET() {
  const views = await getPageViews();
  return NextResponse.json({ views });
}
