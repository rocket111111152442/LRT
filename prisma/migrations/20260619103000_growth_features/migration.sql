CREATE TYPE "RepairPaymentStatus" AS ENUM ('NON_PAYE', 'ACOMPTE', 'PAYE', 'REMBOURSE');
CREATE TYPE "CustomerType" AS ENUM ('STANDARD', 'VIP', 'PRO');

ALTER TABLE "Repair"
  ADD COLUMN "urgent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "expressMode" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "paidAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "depositCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "paymentStatus" "RepairPaymentStatus" NOT NULL DEFAULT 'NON_PAYE',
  ADD COLUMN "warrantyUntil" TIMESTAMP(3),
  ADD COLUMN "warrantyReturn" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "expectedPickupAt" TIMESTAMP(3),
  ADD COLUMN "technicianName" TEXT,
  ADD COLUMN "timeSpentMinutes" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "checklistDiagnostic" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "checklistBackup" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "checklistFunctionalTest" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "checklistCleaning" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "customerType" "CustomerType" NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN "satisfactionRating" INTEGER,
  ADD COLUMN "satisfactionComment" TEXT,
  ADD COLUMN "supplierOrderNote" TEXT,
  ADD COLUMN "partsUsed" TEXT,
  ADD COLUMN "usedInventoryItemId" TEXT,
  ADD COLUMN "usedInventoryItemName" TEXT,
  ADD COLUMN "usedInventoryQuantity" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "ProAccount"
  ADD COLUMN "publicDescription" TEXT,
  ADD COLUMN "publicPhone" TEXT,
  ADD COLUMN "publicAddress" TEXT,
  ADD COLUMN "monthlyGoal" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN "referralCode" TEXT;

ALTER TABLE "EmailSettings"
  ADD COLUMN "createdEmailTemplate" TEXT,
  ADD COLUMN "statusEmailTemplate" TEXT,
  ADD COLUMN "quoteEmailTemplate" TEXT,
  ADD COLUMN "reviewEmailTemplate" TEXT;

CREATE INDEX "Repair_expectedPickupAt_idx" ON "Repair"("expectedPickupAt");
CREATE INDEX "Repair_urgent_idx" ON "Repair"("urgent");
CREATE INDEX "Repair_customerType_idx" ON "Repair"("customerType");
