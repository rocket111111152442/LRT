-- CreateEnum
CREATE TYPE "ControlRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REFUSED', 'CANCELED', 'ENDED');

-- CreateTable
CREATE TABLE "ControlRequest" (
    "id" TEXT NOT NULL,
    "proAccountId" TEXT NOT NULL,
    "status" "ControlRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControlRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ControlRequest_proAccountId_idx" ON "ControlRequest"("proAccountId");

-- CreateIndex
CREATE INDEX "ControlRequest_status_idx" ON "ControlRequest"("status");

-- AddForeignKey
ALTER TABLE "ControlRequest" ADD CONSTRAINT "ControlRequest_proAccountId_fkey" FOREIGN KEY ("proAccountId") REFERENCES "ProAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
