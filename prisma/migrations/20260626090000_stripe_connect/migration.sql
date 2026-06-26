ALTER TABLE "ProAccount" ADD COLUMN "stripeAccountId" TEXT;
ALTER TABLE "ProAccount" ADD COLUMN "stripeOnboarded" BOOLEAN NOT NULL DEFAULT false;
