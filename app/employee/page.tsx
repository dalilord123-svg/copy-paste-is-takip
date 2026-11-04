
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProductionStepStatus } from "@prisma/client";
import EmployeeTable from "@/app/components/employees/EmployeeTable";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      assignments: {
        where: {
          status: {
            in: [
              ProductionStepStatus.BEKLIYOR,
              ProductionStepStatus.DEVAM_EDIYOR,
            ],
          },
        },
        include: {
          productionStep: {
            include: {
              station: true,
              job: true,
            },
          },
        },
      },
    },
  });

  // EmployeeTable bileşeninin beklediği productionSteps alanını oluştur.
  const employeesWithSteps = employees.map((employee) => ({
    ...employee,
    productionSteps: employee.assignments.map(
      (assignment) => assignment.productionStep
    ),
  }));

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold">
              Personel Yönetimi
            </h1>

            <p className="text-gray-500 mt-2">
              Toplam {employees.length} personel
            </p>
          </div>

          <Link
            href="/employees/new"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 font-semibold"
          >
            + Yeni Personel
          </Link>
        </div>

        <EmployeeTable employees={employeesWithSteps} />
      </div>
    </main>
  );
}
