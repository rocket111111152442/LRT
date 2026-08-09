import { NextResponse } from "next/server";
import { requireModApi } from "@/lib/modAuth";
import { prisma } from "@/lib/prisma";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

const selectReview = {
  id: true,
  name: true,
  rating: true,
  comment: true,
  createdAt: true,
} as const;

// Liste complète des avis (pour l'espace modérateur).
export async function GET() {
  const auth = await requireModApi();
  if (!auth.ok) return auth.response as unknown as ReturnType<typeof NextResponse.json>;

  const reviews = await prisma.publicReview.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: selectReview,
  });

  return NextResponse.json({ reviews });
}

// Ajout d'un avis par le modérateur (sans limite de fréquence, contrairement au
// formulaire public).
export async function POST(request: Request) {
  const auth = await requireModApi();
  if (!auth.ok) return auth.response as unknown as ReturnType<typeof NextResponse.json>;

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
  const comment = readText(body, "comment").slice(0, 2000);
  const rating = Number(body.rating);

  if (!name || comment.length < 3) {
    return NextResponse.json(
      { error: "Nom et avis requis." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Note invalide (1 a 5)." }, { status: 400 });
  }

  const review = await prisma.publicReview.create({
    data: { name, rating, comment },
    select: selectReview,
  });

  return NextResponse.json({ review }, { status: 201 });
}

// Suppression d'un avis.
export async function DELETE(request: Request) {
  const auth = await requireModApi();
  if (!auth.ok) return auth.response as unknown as ReturnType<typeof NextResponse.json>;

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ error: "Identifiant requis." }, { status: 400 });
  }

  await prisma.publicReview.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
