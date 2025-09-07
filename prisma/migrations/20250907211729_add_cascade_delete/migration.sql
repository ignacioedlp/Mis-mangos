-- DropForeignKey
ALTER TABLE "public"."expense" DROP CONSTRAINT "expense_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."expense" DROP CONSTRAINT "expense_subcategoryId_fkey";

-- AddForeignKey
ALTER TABLE "public"."expense" ADD CONSTRAINT "expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expense" ADD CONSTRAINT "expense_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "public"."subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
