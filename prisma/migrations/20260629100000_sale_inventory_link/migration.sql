-- AccountingSale : lien optionnel vers l'article de stock vendu (traçabilité)
ALTER TABLE "AccountingSale" ADD COLUMN "inventoryItemId" TEXT;
