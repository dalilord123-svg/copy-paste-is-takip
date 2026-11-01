/*
  Warnings:

  - You are about to drop the column `createdAt` on the `JobPhoto` table. All the data in the column will be lost.
  - Added the required column `fileSize` to the `JobPhoto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `JobPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobPhoto" DROP COLUMN "createdAt",
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "fileType" TEXT NOT NULL,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "JobPhoto_employeeId_idx" ON "JobPhoto"("employeeId");
