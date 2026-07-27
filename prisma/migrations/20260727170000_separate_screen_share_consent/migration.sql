ALTER TABLE "ControlRequest"
ADD COLUMN "screenShareStatus" TEXT NOT NULL DEFAULT 'NOT_REQUESTED',
ADD COLUMN "screenShareRequestedAt" TIMESTAMP(3),
ADD COLUMN "screenShareRespondedAt" TIMESTAMP(3),
ADD COLUMN "screenShareExpiresAt" TIMESTAMP(3);
