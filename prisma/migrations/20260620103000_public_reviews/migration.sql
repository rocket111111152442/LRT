CREATE TABLE "PublicReview" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PublicReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PublicReview_createdAt_idx" ON "PublicReview"("createdAt");
CREATE INDEX "PublicReview_rating_idx" ON "PublicReview"("rating");
