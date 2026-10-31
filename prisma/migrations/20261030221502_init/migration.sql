-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('BEKLIYOR', 'DEVAM_EDIYOR', 'TAMAMLANDI', 'TESLIM', 'IPTAL');

-- CreateEnum
CREATE TYPE "public"."ProductionStepStatus" AS ENUM ('BEKLIYOR', 'HAZIR', 'DEVAM_EDIYOR', 'BEKLEMEDE', 'TAMAMLANDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "public"."WaitingReason" AS ENUM ('MALZEME', 'MUSTERI_ONAYI', 'TASARIM', 'MAKINE_ARIZASI', 'PERSONEL', 'DIGER');

-- CreateEnum
CREATE TYPE "public"."FileCategory" AS ENUM ('TASARIM', 'PDF', 'GORSEL', 'FOTOGRAF', 'SOZLESME', 'DIGER');

-- CreateEnum
CREATE TYPE "public"."EmployeeRole" AS ENUM ('ADMIN', 'YONETICI', 'GRAFIK', 'URETIM', 'MONTAJ');

-- CreateEnum
CREATE TYPE "public"."JobPriority" AS ENUM ('DUSUK', 'NORMAL', 'YUKSEK', 'ACIL');

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" "public"."EmployeeRole" NOT NULL DEFAULT 'URETIM',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Station" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requirePhotoCount" INTEGER NOT NULL DEFAULT 0,
    "requireFile" BOOLEAN NOT NULL DEFAULT false,
    "requireNote" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "jobNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "quantity" INTEGER,
    "material" TEXT,
    "machine" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "priority" "public"."JobPriority" NOT NULL DEFAULT 'NORMAL',
    "customerId" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobFile" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "category" "public"."FileCategory" NOT NULL DEFAULT 'DIGER',
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductionStep" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "employeeId" TEXT,
    "stepOrder" INTEGER NOT NULL,
    "status" "public"."ProductionStepStatus" NOT NULL DEFAULT 'BEKLIYOR',
    "waitingReason" "public"."WaitingReason",
    "waitingNote" TEXT,
    "estimatedMinutes" INTEGER,
    "actualMinutes" INTEGER,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "photoCount" INTEGER NOT NULL DEFAULT 0,
    "fileCount" INTEGER NOT NULL DEFAULT 0,
    "noteCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TemplateStep" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 0,
    "requirePhotoCount" INTEGER NOT NULL DEFAULT 0,
    "requireFile" BOOLEAN NOT NULL DEFAULT false,
    "requireNote" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TemplateStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobNote" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "employeeId" TEXT,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobPhoto" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "employeeId" TEXT,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobHistory" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "employeeId" TEXT,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_company_idx" ON "public"."Customer"("company");

-- CreateIndex
CREATE INDEX "Employee_name_idx" ON "public"."Employee"("name");

-- CreateIndex
CREATE INDEX "Employee_role_idx" ON "public"."Employee"("role");

-- CreateIndex
CREATE INDEX "Employee_isActive_idx" ON "public"."Employee"("isActive");

-- CreateIndex
CREATE INDEX "Station_sortOrder_idx" ON "public"."Station"("sortOrder");

-- CreateIndex
CREATE INDEX "Station_isActive_idx" ON "public"."Station"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNo_key" ON "public"."Job"("jobNo");

-- CreateIndex
CREATE INDEX "Job_customerId_idx" ON "public"."Job"("customerId");

-- CreateIndex
CREATE INDEX "Job_priority_idx" ON "public"."Job"("priority");

-- CreateIndex
CREATE INDEX "Job_deliveryDate_idx" ON "public"."Job"("deliveryDate");

-- CreateIndex
CREATE INDEX "Job_isArchived_idx" ON "public"."Job"("isArchived");

-- CreateIndex
CREATE INDEX "JobFile_jobId_idx" ON "public"."JobFile"("jobId");

-- CreateIndex
CREATE INDEX "JobFile_category_idx" ON "public"."JobFile"("category");

-- CreateIndex
CREATE INDEX "ProductionStep_jobId_idx" ON "public"."ProductionStep"("jobId");

-- CreateIndex
CREATE INDEX "ProductionStep_stationId_idx" ON "public"."ProductionStep"("stationId");

-- CreateIndex
CREATE INDEX "ProductionStep_employeeId_idx" ON "public"."ProductionStep"("employeeId");

-- CreateIndex
CREATE INDEX "ProductionStep_status_idx" ON "public"."ProductionStep"("status");

-- CreateIndex
CREATE INDEX "ProductionStep_stepOrder_idx" ON "public"."ProductionStep"("stepOrder");

-- CreateIndex
CREATE INDEX "Template_name_idx" ON "public"."Template"("name");

-- CreateIndex
CREATE INDEX "Template_isActive_idx" ON "public"."Template"("isActive");

-- CreateIndex
CREATE INDEX "TemplateStep_templateId_idx" ON "public"."TemplateStep"("templateId");

-- CreateIndex
CREATE INDEX "TemplateStep_stationId_idx" ON "public"."TemplateStep"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateStep_templateId_stepOrder_key" ON "public"."TemplateStep"("templateId", "stepOrder");

-- CreateIndex
CREATE INDEX "JobNote_jobId_idx" ON "public"."JobNote"("jobId");

-- CreateIndex
CREATE INDEX "JobPhoto_jobId_idx" ON "public"."JobPhoto"("jobId");

-- CreateIndex
CREATE INDEX "JobHistory_jobId_idx" ON "public"."JobHistory"("jobId");

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobFile" ADD CONSTRAINT "JobFile_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductionStep" ADD CONSTRAINT "ProductionStep_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductionStep" ADD CONSTRAINT "ProductionStep_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "public"."Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductionStep" ADD CONSTRAINT "ProductionStep_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateStep" ADD CONSTRAINT "TemplateStep_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TemplateStep" ADD CONSTRAINT "TemplateStep_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "public"."Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobNote" ADD CONSTRAINT "JobNote_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobNote" ADD CONSTRAINT "JobNote_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobPhoto" ADD CONSTRAINT "JobPhoto_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobPhoto" ADD CONSTRAINT "JobPhoto_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobHistory" ADD CONSTRAINT "JobHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobHistory" ADD CONSTRAINT "JobHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
