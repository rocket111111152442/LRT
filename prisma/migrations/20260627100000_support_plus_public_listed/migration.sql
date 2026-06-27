-- ProAccount : visibilité publique de la boutique (affichée par défaut)
ALTER TABLE "ProAccount" ADD COLUMN "publicListed" BOOLEAN NOT NULL DEFAULT true;

-- SupportMessage : enrichissement service client (catégorie, priorité, réf ticket, réponse)
ALTER TABLE "SupportMessage" ADD COLUMN "category" TEXT;
ALTER TABLE "SupportMessage" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "SupportMessage" ADD COLUMN "ticketRef" TEXT;
ALTER TABLE "SupportMessage" ADD COLUMN "replyText" TEXT;
ALTER TABLE "SupportMessage" ADD COLUMN "repliedAt" TIMESTAMP(3);
