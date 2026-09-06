import { NextResponse } from "next/server";
import { Client } from "pg";

// Route temporaire : crée les tables en base si elles n'existent pas encore.
// Protégée par AUTH_SECRET (déjà configuré) pour éviter tout accès public.
// À supprimer une fois la base initialisée.

const DDL = `
DO $$ BEGIN
  CREATE TYPE "EventType" AS ENUM ('COURS', 'DEVOIR', 'CONTROLE', 'AUTRE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "firstName" TEXT,
  "classe" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "subjects" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "subjects_userId_idx" ON "subjects"("userId");

CREATE TABLE IF NOT EXISTS "notes" (
  "id" TEXT PRIMARY KEY,
  "subjectId" TEXT NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "notes_subjectId_idx" ON "notes"("subjectId");

CREATE TABLE IF NOT EXISTS "grades" (
  "id" TEXT PRIMARY KEY,
  "subjectId" TEXT NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  "label" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "maxValue" DOUBLE PRECISION NOT NULL DEFAULT 20,
  "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "grades_subjectId_idx" ON "grades"("subjectId");

CREATE TABLE IF NOT EXISTS "events" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "subjectId" TEXT REFERENCES "subjects"("id") ON DELETE SET NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "date" TIMESTAMP(3) NOT NULL,
  "type" "EventType" NOT NULL DEFAULT 'AUTRE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "events_userId_date_idx" ON "events"("userId", "date");

CREATE TABLE IF NOT EXISTS "documents" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "subjectId" TEXT REFERENCES "subjects"("id") ON DELETE SET NULL,
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "data" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "documents_userId_idx" ON "documents"("userId");
`;

async function runSetup(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!process.env.AUTH_SECRET || secret !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(DDL);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  } finally {
    await client.end();
  }
}

export const GET = runSetup;
export const POST = runSetup;
