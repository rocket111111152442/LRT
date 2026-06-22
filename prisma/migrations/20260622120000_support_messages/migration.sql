CREATE TABLE "SupportMessage" (
  "id"            TEXT NOT NULL,
  "proAccountId"  TEXT,
  "name"          TEXT NOT NULL,
  "email"         TEXT NOT NULL,
  "subject"       TEXT NOT NULL,
  "message"       TEXT NOT NULL,
  "offre"         TEXT,
  "status"        TEXT NOT NULL DEFAULT 'OPEN',
  "moderatorNote" TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SupportMessage_proAccountId_idx" ON "SupportMessage"("proAccountId");
CREATE INDEX "SupportMessage_status_idx"        ON "SupportMessage"("status");
CREATE INDEX "SupportMessage_createdAt_idx"     ON "SupportMessage"("createdAt");
