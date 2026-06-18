-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RepairStatus" AS ENUM ('PAS_ENCORE_EN_REPARATION', 'EN_REPARATION', 'EN_ATTENTE_PIECE', 'PRET', 'RECUPERE', 'ANNULE');

-- CreateTable
CREATE TABLE "Repair" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "issueDescription" TEXT NOT NULL,
    "unlockCodeOrNote" TEXT,
    "status" "RepairStatus" NOT NULL DEFAULT 'PAS_ENCORE_EN_REPARATION',
    "internalNotes" TEXT,
    "readyEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Repair_status_idx" ON "Repair"("status");

-- CreateIndex
CREATE INDEX "Repair_createdAt_idx" ON "Repair"("createdAt");
