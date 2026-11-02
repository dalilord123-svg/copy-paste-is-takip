-- CreateTable
CREATE TABLE "DashboardSetting" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "jobs" BOOLEAN NOT NULL DEFAULT true,
    "production" BOOLEAN NOT NULL DEFAULT true,
    "employees" BOOLEAN NOT NULL DEFAULT true,
    "customers" BOOLEAN NOT NULL DEFAULT true,
    "deliveries" BOOLEAN NOT NULL DEFAULT true,
    "reports" BOOLEAN NOT NULL DEFAULT false,
    "photos" BOOLEAN NOT NULL DEFAULT false,
    "files" BOOLEAN NOT NULL DEFAULT false,
    "notes" BOOLEAN NOT NULL DEFAULT false,
    "calendar" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DashboardSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DashboardSetting_employeeId_key" ON "DashboardSetting"("employeeId");

-- AddForeignKey
ALTER TABLE "DashboardSetting" ADD CONSTRAINT "DashboardSetting_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
