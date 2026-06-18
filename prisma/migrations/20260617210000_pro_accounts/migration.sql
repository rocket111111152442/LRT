-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED');

-- AlterTable
ALTER TABLE "Repair" ADD COLUMN "proAccountId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "proAccountId" TEXT;

-- CreateTable
CREATE TABLE "ProAccount" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "firebaseApiKey" TEXT NOT NULL,
    "firebaseAuthDomain" TEXT NOT NULL,
    "firebaseProjectId" TEXT NOT NULL,
    "firebaseStorageBucket" TEXT,
    "firebaseMessagingSenderId" TEXT,
    "firebaseAppId" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProAccount_slug_key" ON "ProAccount"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProAccount_ownerEmail_key" ON "ProAccount"("ownerEmail");

-- CreateIndex
CREATE INDEX "Repair_proAccountId_idx" ON "Repair"("proAccountId");

-- AddForeignKey
ALTER TABLE "Repair" ADD CONSTRAINT "Repair_proAccountId_fkey" FOREIGN KEY ("proAccountId") REFERENCES "ProAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_proAccountId_fkey" FOREIGN KEY ("proAccountId") REFERENCES "ProAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
