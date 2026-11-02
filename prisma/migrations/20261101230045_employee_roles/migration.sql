/*
  Warnings:

  - The values [GRAFIK,URETIM,MONTAJ] on the enum `EmployeeRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmployeeRole_new" AS ENUM ('ADMIN', 'YONETICI', 'PERSONEL');
ALTER TABLE "Employee" ALTER COLUMN "role" TYPE "EmployeeRole_new" USING ("role"::text::"EmployeeRole_new");
ALTER TYPE "EmployeeRole" RENAME TO "EmployeeRole_old";
ALTER TYPE "EmployeeRole_new" RENAME TO "EmployeeRole";
DROP TYPE "public"."EmployeeRole_old";
COMMIT;
