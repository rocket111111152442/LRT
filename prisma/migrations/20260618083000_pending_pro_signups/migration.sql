-- CreateTable
CREATE TABLE "PendingProSignup" (
    "id" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "companyName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firebaseApiKey" TEXT NOT NULL,
    "firebaseAuthDomain" TEXT NOT NULL,
    "firebaseProjectId" TEXT NOT NULL,
    "firebaseStorageBucket" TEXT,
    "firebaseMessagingSenderId" TEXT,
    "firebaseAppId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingProSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingProSignup_stripeSessionId_key" ON "PendingProSignup"("stripeSessionId");

-- CreateIndex
CREATE INDEX "PendingProSignup_ownerEmail_idx" ON "PendingProSignup"("ownerEmail");

-- CreateIndex
CREATE INDEX "PendingProSignup_slug_idx" ON "PendingProSignup"("slug");
