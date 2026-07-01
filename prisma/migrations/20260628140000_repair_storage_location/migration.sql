-- Repair : emplacement physique de l'appareil dans l'atelier (tiroir, étagère…)
ALTER TABLE "Repair" ADD COLUMN "storageLocation" TEXT;
