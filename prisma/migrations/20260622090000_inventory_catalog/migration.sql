ALTER TABLE "InventoryItem" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'PIECE';
ALTER TABLE "InventoryItem" ADD COLUMN "reference" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN "unitPriceCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "InventoryItem" ADD COLUMN "supplier" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN "location" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN "notes" TEXT;

CREATE INDEX "InventoryItem_category_idx" ON "InventoryItem"("category");
