-- AlterTable
ALTER TABLE "public"."expense" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."expense_occurrence" ADD COLUMN     "isSkipped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "skippedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "expense_deletedAt_idx" ON "public"."expense"("deletedAt");

-- CreateIndex
CREATE INDEX "expense_occurrence_isSkipped_idx" ON "public"."expense_occurrence"("isSkipped");
