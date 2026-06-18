import { NextResponse } from "next/server";
import { processReadyReminders } from "@/lib/readyReminders";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (cronSecret && authorization && authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const result = await processReadyReminders();
  return NextResponse.json(result);
}
