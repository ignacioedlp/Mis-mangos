-- CreateEnum
CREATE TYPE "public"."GoalType" AS ENUM ('SAVINGS', 'DEBT_PAYMENT', 'EXPENSE_REDUCTION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED');

-- CreateTable
CREATE TABLE "public"."goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."GoalType" NOT NULL,
    "status" "public"."GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "currentAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goal_userId_status_idx" ON "public"."goal"("userId", "status");

-- CreateIndex
CREATE INDEX "goal_userId_createdAt_idx" ON "public"."goal"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."goal" ADD CONSTRAINT "goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goal" ADD CONSTRAINT "goal_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
