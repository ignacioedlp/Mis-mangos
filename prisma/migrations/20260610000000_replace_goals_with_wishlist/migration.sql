-- Drop the unused goals feature and all existing goal data.
DROP TABLE IF EXISTS "public"."goal";
DROP TYPE IF EXISTS "public"."GoalStatus";
DROP TYPE IF EXISTS "public"."GoalType";

CREATE TYPE "public"."WishlistStatus" AS ENUM ('PLANNED', 'COMPLETED', 'DISCARDED');
CREATE TYPE "public"."WishlistPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE "public"."wishlist_item" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cashPrice" DECIMAL(12,2) NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "installmentAmount" DECIMAL(12,2) NOT NULL,
    "status" "public"."WishlistStatus" NOT NULL DEFAULT 'PLANNED',
    "priority" "public"."WishlistPriority" NOT NULL DEFAULT 'MEDIUM',
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_item_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "wishlist_item_userId_status_idx" ON "public"."wishlist_item"("userId", "status");
CREATE INDEX "wishlist_item_userId_priority_idx" ON "public"."wishlist_item"("userId", "priority");
CREATE INDEX "wishlist_item_subcategoryId_idx" ON "public"."wishlist_item"("subcategoryId");

ALTER TABLE "public"."wishlist_item"
ADD CONSTRAINT "wishlist_item_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."wishlist_item"
ADD CONSTRAINT "wishlist_item_subcategoryId_fkey"
FOREIGN KEY ("subcategoryId") REFERENCES "public"."subcategory"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
