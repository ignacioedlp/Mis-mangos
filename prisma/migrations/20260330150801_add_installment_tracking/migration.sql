-- CreateTable
CREATE TABLE "public"."installment_purchase" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "installmentAmount" DECIMAL(12,2) NOT NULL,
    "startYear" INTEGER NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installment_purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."installment_payment" (
    "id" TEXT NOT NULL,
    "installmentPurchaseId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installment_payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "installment_purchase_expenseId_idx" ON "public"."installment_purchase"("expenseId");

-- CreateIndex
CREATE INDEX "installment_purchase_startYear_startMonth_idx" ON "public"."installment_purchase"("startYear", "startMonth");

-- CreateIndex
CREATE INDEX "installment_payment_year_month_idx" ON "public"."installment_payment"("year", "month");

-- CreateIndex
CREATE INDEX "installment_payment_isPaid_idx" ON "public"."installment_payment"("isPaid");

-- CreateIndex
CREATE UNIQUE INDEX "installment_payment_installmentPurchaseId_installmentNumber_key" ON "public"."installment_payment"("installmentPurchaseId", "installmentNumber");

-- AddForeignKey
ALTER TABLE "public"."installment_purchase" ADD CONSTRAINT "installment_purchase_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "public"."expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."installment_payment" ADD CONSTRAINT "installment_payment_installmentPurchaseId_fkey" FOREIGN KEY ("installmentPurchaseId") REFERENCES "public"."installment_purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
