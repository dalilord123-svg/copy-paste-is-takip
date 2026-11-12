-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('BEKLIYOR', 'DEVAM_EDIYOR', 'TAMAMLANDI', 'TESLIM', 'IPTAL');

-- CreateEnum
CREATE TYPE "ProductionStepStatus" AS ENUM ('BEKLIYOR', 'HAZIR', 'DEVAM_EDIYOR', 'BEKLEMEDE', 'TAMAMLANDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "WaitingReason" AS ENUM ('MALZEME', 'MUSTERI_ONAYI', 'TASARIM', 'MAKINE_ARIZASI', 'PERSONEL', 'DIGER');

-- CreateEnum
CREATE TYPE "FileCategory" AS ENUM ('TASARIM', 'PDF', 'GORSEL', 'FOTOGRAF', 'SOZLESME', 'DIGER');

-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('ADMIN', 'YONETICI', 'PERSONEL');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('DUSUK', 'NORMAL', 'YUKSEK', 'ACIL');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" "EmployeeRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardSetting" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "jobs" BOOLEAN NOT NULL DEFAULT true,
    "production" BOOLEAN NOT NULL DEFAULT true,
    "employees" BOOLEAN NOT NULL DEFAULT true,
    "customers" BOOLEAN NOT NULL DEFAULT true,
    "deliveries" BOOLEAN NOT NULL DEFAULT true,
    "reports" BOOLEAN NOT NULL DEFAULT true,
    "photos" BOOLEAN NOT NULL DEFAULT false,
    "files" BOOLEAN NOT NULL DEFAULT false,
    "notes" BOOLEAN NOT NULL DEFAULT false,
    "calendar" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DashboardSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowMultipleEmployees" BOOLEAN NOT NULL DEFAULT true,
    "requirePhotoCount" INTEGER NOT NULL DEFAULT 0,
    "requireFile" BOOLEAN NOT NULL DEFAULT false,
    "requireNote" BOOLEAN NOT NULL DEFAULT false,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
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
    "priority" "JobPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "JobStatus" NOT NULL DEFAULT 'BEKLIYOR',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "customerId" TEXT NOT NULL,
    "leaderId" TEXT,
    "templateId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionStep" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "status" "ProductionStepStatus" NOT NULL DEFAULT 'BEKLIYOR',
    "waitingReason" "WaitingReason",
    "waitingNote" TEXT,
    "estimatedMinutes" INTEGER,
    "actualMinutes" INTEGER,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "photoCount" INTEGER NOT NULL DEFAULT 0,
    "fileCount" INTEGER NOT NULL DEFAULT 0,
    "noteCount" INTEGER NOT NULL DEFAULT 0,
    "isSkipped" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionStep_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateStep" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 0,
    "requirePhotoCount" INTEGER NOT NULL DEFAULT 0,
    "requireFile" BOOLEAN NOT NULL DEFAULT false,
    "requireNote" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TemplateStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobFile" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "category" "FileCategory" NOT NULL DEFAULT 'DIGER',
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPhoto" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "productionStepId" TEXT,
    "employeeId" TEXT,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobNote" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "employeeId" TEXT,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobHistory" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "employeeId" TEXT,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_company_idx" ON "Customer"("company");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_username_key" ON "Employee"("username");

-- CreateIndex
CREATE INDEX "Employee_name_idx" ON "Employee"("name");

-- CreateIndex
CREATE INDEX "Employee_role_idx" ON "Employee"("role");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardSetting_employeeId_key" ON "DashboardSetting"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Station_name_key" ON "Station"("name");

-- CreateIndex
CREATE INDEX "Station_sortOrder_idx" ON "Station"("sortOrder");

-- CreateIndex
CREATE INDEX "Station_isActive_idx" ON "Station"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNo_key" ON "Job"("jobNo");

-- CreateIndex
CREATE INDEX "Job_customerId_idx" ON "Job"("customerId");

-- CreateIndex
CREATE INDEX "Job_leaderId_idx" ON "Job"("leaderId");

-- CreateIndex
CREATE INDEX "Job_templateId_idx" ON "Job"("templateId");

-- CreateIndex
CREATE INDEX "Job_deliveryDate_idx" ON "Job"("deliveryDate");

-- CreateIndex
CREATE INDEX "Job_priority_idx" ON "Job"("priority");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "ProductionStep_jobId_idx" ON "ProductionStep"("jobId");

-- CreateIndex
CREATE INDEX "ProductionStep_stationId_idx" ON "ProductionStep"("stationId");

-- CreateIndex
CREATE INDEX "ProductionStep_status_idx" ON "ProductionStep"("status");

-- CreateIndex
CREATE INDEX "ProductionStep_stepOrder_idx" ON "ProductionStep"("stepOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionStep_jobId_stepOrder_key" ON "ProductionStep"("jobId", "stepOrder");

-- CreateIndex
CREATE INDEX "ProductionAssignment_productionStepId_idx" ON "ProductionAssignment"("productionStepId");

-- CreateIndex
CREATE INDEX "ProductionAssignment_employeeId_idx" ON "ProductionAssignment"("employeeId");

-- CreateIndex
CREATE INDEX "ProductionAssignment_status_idx" ON "ProductionAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionAssignment_productionStepId_employeeId_key" ON "ProductionAssignment"("productionStepId", "employeeId");

-- CreateIndex
CREATE INDEX "Template_name_idx" ON "Template"("name");

-- CreateIndex
CREATE INDEX "Template_isDefault_idx" ON "Template"("isDefault");

-- CreateIndex
CREATE INDEX "Template_isActive_idx" ON "Template"("isActive");

-- CreateIndex
CREATE INDEX "TemplateStep_templateId_idx" ON "TemplateStep"("templateId");

-- CreateIndex
CREATE INDEX "TemplateStep_stationId_idx" ON "TemplateStep"("stationId");

-- CreateIndex
CREATE INDEX "TemplateStep_stepOrder_idx" ON "TemplateStep"("stepOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateStep_templateId_stepOrder_key" ON "TemplateStep"("templateId", "stepOrder");

-- CreateIndex
CREATE INDEX "JobFile_jobId_idx" ON "JobFile"("jobId");

-- CreateIndex
CREATE INDEX "JobFile_category_idx" ON "JobFile"("category");

-- CreateIndex
CREATE INDEX "JobPhoto_jobId_idx" ON "JobPhoto"("jobId");

-- CreateIndex
CREATE INDEX "JobPhoto_productionStepId_idx" ON "JobPhoto"("productionStepId");

-- CreateIndex
CREATE INDEX "JobPhoto_employeeId_idx" ON "JobPhoto"("employeeId");

-- CreateIndex
CREATE INDEX "JobNote_jobId_idx" ON "JobNote"("jobId");

-- CreateIndex
CREATE INDEX "JobNote_employeeId_idx" ON "JobNote"("employeeId");

-- CreateIndex
CREATE INDEX "JobHistory_jobId_idx" ON "JobHistory"("jobId");

-- CreateIndex
CREATE INDEX "JobHistory_employeeId_idx" ON "JobHistory"("employeeId");

-- CreateIndex
CREATE INDEX "JobHistory_action_idx" ON "JobHistory"("action");

-- AddForeignKey
ALTER TABLE "DashboardSetting" ADD CONSTRAINT "DashboardSetting_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionStep" ADD CONSTRAINT "ProductionStep_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionStep" ADD CONSTRAINT "ProductionStep_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAssignment" ADD CONSTRAINT "ProductionAssignment_productionStepId_fkey" FOREIGN KEY ("productionStepId") REFERENCES "ProductionStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAssignment" ADD CONSTRAINT "ProductionAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateStep" ADD CONSTRAINT "TemplateStep_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateStep" ADD CONSTRAINT "TemplateStep_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFile" ADD CONSTRAINT "JobFile_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPhoto" ADD CONSTRAINT "JobPhoto_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPhoto" ADD CONSTRAINT "JobPhoto_productionStepId_fkey" FOREIGN KEY ("productionStepId") REFERENCES "ProductionStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPhoto" ADD CONSTRAINT "JobPhoto_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobNote" ADD CONSTRAINT "JobNote_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobNote" ADD CONSTRAINT "JobNote_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobHistory" ADD CONSTRAINT "JobHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobHistory" ADD CONSTRAINT "JobHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
