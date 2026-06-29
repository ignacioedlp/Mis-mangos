-- CreateTable
CREATE TABLE "public"."usd_monthly_income" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usd_monthly_income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usd_transfer" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "transferredAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usd_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usd_monthly_income_year_month_idx" ON "public"."usd_monthly_income"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "usd_monthly_income_userId_year_month_key" ON "public"."usd_monthly_income"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "usd_transfer_userId_year_month_idx" ON "public"."usd_transfer"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "usd_transfer_transferredAt_idx" ON "public"."usd_transfer"("transferredAt");

-- AddForeignKey
ALTER TABLE "public"."usd_monthly_income" ADD CONSTRAINT "usd_monthly_income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usd_transfer" ADD CONSTRAINT "usd_transfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
