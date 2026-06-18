-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('NONE', 'SENT', 'ACCEPTED', 'REFUSED');

-- CreateEnum
CREATE TYPE "PartStatus" AS ENUM ('NONE', 'ORDERED', 'RECEIVED', 'INSTALLED');

-- AlterTable
ALTER TABLE "Repair" ADD COLUMN "ticketNumber" TEXT;
ALTER TABLE "Repair" ADD COLUMN "smsReadySent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Repair" ADD COLUMN "reviewEmailSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Repair" ADD COLUMN "readyReminderSentAt" TIMESTAMP(3);
ALTER TABLE "Repair" ADD COLUMN "estimatedPriceCents" INTEGER;
ALTER TABLE "Repair" ADD COLUMN "quoteStatus" "QuoteStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "Repair" ADD COLUMN "quoteToken" TEXT;
ALTER TABLE "Repair" ADD COLUMN "quoteSentAt" TIMESTAMP(3);
ALTER TABLE "Repair" ADD COLUMN "quoteRespondedAt" TIMESTAMP(3);
ALTER TABLE "Repair" ADD COLUMN "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Repair" ADD COLUMN "customerDropOffSignature" TEXT;
ALTER TABLE "Repair" ADD COLUMN "customerPickupSignature" TEXT;
ALTER TABLE "Repair" ADD COLUMN "partsStatus" "PartStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "Repair" ADD COLUMN "partsDescription" TEXT;

-- AlterTable
ALTER TABLE "EmailSettings" ADD COLUMN "googleReviewUrl" TEXT;

-- CreateTable
CREATE TABLE "RepairEvent" (
    "id" TEXT NOT NULL,
    "repairId" TEXT NOT NULL,
    "proAccountId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "proAccountId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repair_ticketNumber_key" ON "Repair"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Repair_quoteToken_key" ON "Repair"("quoteToken");

-- CreateIndex
CREATE INDEX "Repair_ticketNumber_idx" ON "Repair"("ticketNumber");

-- CreateIndex
CREATE INDEX "Repair_quoteToken_idx" ON "Repair"("quoteToken");

-- CreateIndex
CREATE INDEX "RepairEvent_repairId_idx" ON "RepairEvent"("repairId");

-- CreateIndex
CREATE INDEX "RepairEvent_proAccountId_idx" ON "RepairEvent"("proAccountId");

-- CreateIndex
CREATE INDEX "RepairEvent_createdAt_idx" ON "RepairEvent"("createdAt");

-- CreateIndex
CREATE INDEX "InventoryItem_proAccountId_idx" ON "InventoryItem"("proAccountId");

-- CreateIndex
CREATE INDEX "InventoryItem_name_idx" ON "InventoryItem"("name");

-- AddForeignKey
ALTER TABLE "RepairEvent" ADD CONSTRAINT "RepairEvent_repairId_fkey" FOREIGN KEY ("repairId") REFERENCES "Repair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_proAccountId_fkey" FOREIGN KEY ("proAccountId") REFERENCES "ProAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
