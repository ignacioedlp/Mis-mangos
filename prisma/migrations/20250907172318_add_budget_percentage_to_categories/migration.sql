-- AlterTable
ALTER TABLE "public"."category" ADD COLUMN     "budgetPercentage" DECIMAL(5,2);

-- CreateIndex
CREATE INDEX "category_budgetPercentage_idx" ON "public"."category"("budgetPercentage");
