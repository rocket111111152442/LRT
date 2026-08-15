ALTER TABLE "ProAccount"
  ADD COLUMN "salesReferralCode" TEXT,
  ADD COLUMN "salesReferralValidatedAt" TIMESTAMP(3);

ALTER TABLE "PendingProSignup"
  ADD COLUMN "salesReferralCode" TEXT,
  ADD COLUMN "salesReferralValidatedAt" TIMESTAMP(3);

