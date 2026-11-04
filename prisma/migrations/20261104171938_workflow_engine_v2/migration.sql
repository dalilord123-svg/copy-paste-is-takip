/*
  Warnings:

  - You are about to drop the column `employeeId` on the `ProductionStep` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductionStep" DROP CONSTRAINT "ProductionStep_employeeId_fkey";

-- DropIndex
DROP INDEX "Employee_isActive_idx";

-- DropIndex
DROP INDEX "Job_isArchived_idx";

-- DropIndex
DROP INDEX "ProductionStep_employeeId_idx";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "DashboardSetting" ALTER COLUMN "reports" SET DEFAULT true;

-- AlterTable
ALTER TABLE "ProductionStep" DROP COLUMN "employeeId",
ADD COLUMN     "leaderId" TEXT;

-- AlterTable
ALTER TABLE "Station" ADD COLUMN     "estimatedMinutes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ProductionAssignment" (
    "id" TEXT NOT NULL,
    "productionStepId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "workedMinutes" INTEGER,
    "status" "ProductionStepStatus" NOT NULL DEFAULT 'BEKLIYOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductionAssignment_productionStepId_idx" ON "ProductionAssignment"("productionStepId");

-- CreateIndex
CREATE INDEX "ProductionAssignment_employeeId_idx" ON "ProductionAssignment"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionAssignment_productionStepId_employeeId_key" ON "ProductionAssignment"("productionStepId", "employeeId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "JobHistory_employeeId_idx" ON "JobHistory"("employeeId");

-- CreateIndex
CREATE INDEX "JobNote_employeeId_idx" ON "JobNote"("employeeId");

-- CreateIndex
CREATE INDEX "ProductionStep_leaderId_idx" ON "ProductionStep"("leaderId");

-- AddForeignKey
ALTER TABLE "ProductionStep" ADD CONSTRAINT "ProductionStep_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAssignment" ADD CONSTRAINT "ProductionAssignment_productionStepId_fkey" FOREIGN KEY ("productionStepId") REFERENCES "ProductionStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAssignment" ADD CONSTRAINT "ProductionAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
