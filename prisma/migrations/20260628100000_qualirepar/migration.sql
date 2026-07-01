-- ProAccount : identifiants AgoraPlus (QualiRépar) propres à chaque atelier
ALTER TABLE "ProAccount" ADD COLUMN "qualireparApiKey" TEXT;
ALTER TABLE "ProAccount" ADD COLUMN "qualireparSiteId" TEXT;

-- Repair : suivi du bonus QualiRépar et du dossier éco-organisme
ALTER TABLE "Repair" ADD COLUMN "qualireparApplied" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Repair" ADD COLUMN "qualireparBonusCents" INTEGER;
ALTER TABLE "Repair" ADD COLUMN "qualireparEcoOrg" TEXT;
ALTER TABLE "Repair" ADD COLUMN "qualireparBrandId" TEXT;
ALTER TABLE "Repair" ADD COLUMN "qualireparProductId" TEXT;
ALTER TABLE "Repair" ADD COLUMN "qualireparSymptom" TEXT;
ALTER TABLE "Repair" ADD COLUMN "qualireparRequestId" TEXT;
ALTER TABLE "Repair" ADD COLUMN "qualireparStatus" TEXT;
ALTER TABLE "Repair" ADD COLUMN "qualireparError" TEXT;
