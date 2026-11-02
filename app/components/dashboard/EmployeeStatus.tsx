import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function EmployeeStatus() {
  const employees = await prisma.employee.findMany({
    where: {
      isActive: true,
    },
    include: {
      productionSteps: {
        where: {
          status: {
            in: ["BEKLIYOR", "DEVAM_EDIYOR"],
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="bg-white rounded-2xl shadow">

      <div className="flex items-center justify-between p-6 border-b">

        <h2 className="text-xl font-bold">
          Personel Durumu
        </h2>

        <Link
          href="/employees"
          className="text-blue-600 hover:underline"
        >
          Tümü
        </Link>

      </div>

      <div className="divide-y">

        {employees.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Personel bulunamadı.
          </div>
        )}

        {employees.map((employee) => (

          <div
            key={employee.id}
            className="flex items-center justify-between p-4 hover:bg-slate-50"
          >

            <div>

              <div className="font-semibold">
                {employee.name}
              </div>

              <div className="text-sm text-gray-500">
                {employee.role}
              </div>

            </div>

            <div className="text-right">

              <div className="font-bold text-blue-600">
                {employee.productionSteps.length} İş
              </div>

              <div
                className={`text-xs mt-1 ${
                  employee.productionSteps.length === 0
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {employee.productionSteps.length === 0
                  ? "Müsait"
                  : "Çalışıyor"}
              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}