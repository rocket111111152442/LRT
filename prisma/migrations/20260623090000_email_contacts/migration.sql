CREATE TABLE "EmailContact" (
  "id"           TEXT NOT NULL,
  "proAccountId" TEXT,
  "email"        TEXT NOT NULL,
  "name"         TEXT,
  "company"      TEXT,
  "status"       TEXT NOT NULL DEFAULT 'SUBSCRIBED',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailContact_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EmailContact_proAccountId_idx" ON "EmailContact"("proAccountId");
CREATE INDEX "EmailContact_email_idx"        ON "EmailContact"("email");
CREATE INDEX "EmailContact_status_idx"       ON "EmailContact"("status");
