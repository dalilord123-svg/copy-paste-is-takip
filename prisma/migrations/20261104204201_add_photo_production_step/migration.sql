-- AlterTable
ALTER TABLE "JobPhoto" ADD COLUMN     "productionStepId" TEXT;

-- CreateIndex
CREATE INDEX "JobPhoto_productionStepId_idx" ON "JobPhoto"("productionStepId");

-- AddForeignKey
ALTER TABLE "JobPhoto" ADD CONSTRAINT "JobPhoto_productionStepId_fkey" FOREIGN KEY ("productionStepId") REFERENCES "ProductionStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
