import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function selectReview() {
  return {
    id: true,
    name: true,
    rating: true,
    comment: true,
    createdAt: true,
  };
}

export async function GET() {
  const reviews = await prisma.publicReview.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: selectReview(),
  });

  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const name = readText(body, "name").slice(0, 80);
  const comment = readText(body, "comment").slice(0, 500);
  const rating = Number(body.rating);

  if (!name || comment.length < 10) {
    return NextResponse.json(
      { error: "Nom et avis de 10 caracteres minimum requis." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Note invalide." }, { status: 400 });
  }

  const review = await prisma.publicReview.create({
    data: { name, rating, comment },
    select: selectReview(),
  });

  return NextResponse.json({ review }, { status: 201 });
}
