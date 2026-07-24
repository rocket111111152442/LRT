CREATE TABLE "ControlSignal" (
    "id" TEXT NOT NULL,
    "controlRequestId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ControlSignal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ControlSignal_controlRequestId_createdAt_idx"
ON "ControlSignal"("controlRequestId", "createdAt");

CREATE INDEX "ControlSignal_expiresAt_idx"
ON "ControlSignal"("expiresAt");

ALTER TABLE "ControlSignal"
ADD CONSTRAINT "ControlSignal_controlRequestId_fkey"
FOREIGN KEY ("controlRequestId") REFERENCES "ControlRequest"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
