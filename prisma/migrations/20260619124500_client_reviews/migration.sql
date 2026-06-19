ALTER TABLE "Repair"
  ADD COLUMN "reviewToken" TEXT,
  ADD COLUMN "reviewRespondedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Repair_reviewToken_key" ON "Repair"("reviewToken");
CREATE INDEX "Repair_reviewToken_idx" ON "Repair"("reviewToken");
