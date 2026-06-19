ALTER TABLE "ProAccount"
  ADD COLUMN "shopAddress" TEXT,
  ADD COLUMN "shopPostalCode" TEXT,
  ADD COLUMN "shopCity" TEXT,
  ADD COLUMN "shopCountry" TEXT,
  ADD COLUMN "shopPhone" TEXT,
  ADD COLUMN "shopEmail" TEXT,
  ADD COLUMN "shopOpeningHours" TEXT,
  ADD COLUMN "shopLatitude" DOUBLE PRECISION,
  ADD COLUMN "shopLongitude" DOUBLE PRECISION,
  ADD COLUMN "shopCapacityPerDay" INTEGER NOT NULL DEFAULT 8;

ALTER TABLE "PendingProSignup"
  ADD COLUMN "shopAddress" TEXT,
  ADD COLUMN "shopPostalCode" TEXT,
  ADD COLUMN "shopCity" TEXT,
  ADD COLUMN "shopCountry" TEXT,
  ADD COLUMN "shopPhone" TEXT,
  ADD COLUMN "shopEmail" TEXT,
  ADD COLUMN "shopOpeningHours" TEXT,
  ADD COLUMN "shopLatitude" DOUBLE PRECISION,
  ADD COLUMN "shopLongitude" DOUBLE PRECISION,
  ADD COLUMN "shopCapacityPerDay" INTEGER NOT NULL DEFAULT 8;
