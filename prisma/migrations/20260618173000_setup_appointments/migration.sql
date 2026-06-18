CREATE TABLE "SetupAppointment" (
    "id" TEXT NOT NULL,
    "proAccountId" TEXT,
    "stripeSessionId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "contactPhone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetupAppointment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SetupAppointment_stripeSessionId_key" ON "SetupAppointment"("stripeSessionId");
CREATE INDEX "SetupAppointment_proAccountId_idx" ON "SetupAppointment"("proAccountId");
CREATE INDEX "SetupAppointment_requestedAt_idx" ON "SetupAppointment"("requestedAt");
CREATE INDEX "SetupAppointment_ownerEmail_idx" ON "SetupAppointment"("ownerEmail");

ALTER TABLE "SetupAppointment" ADD CONSTRAINT "SetupAppointment_proAccountId_fkey" FOREIGN KEY ("proAccountId") REFERENCES "ProAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
