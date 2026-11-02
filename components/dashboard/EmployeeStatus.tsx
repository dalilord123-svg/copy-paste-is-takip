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
            in: [
              "BEKLIYOR",
              "HAZIR",
              "DEVAM_EDIYOR",
              "BEKLEMEDE",
            ],
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

      <div className="flex items-center justify-between border-b p-6">

        <h2 className="text-2xl font-bold">
          Personel Durumu
        </h2>

        <Link
          href="/employees"
          className="text-blue-600 hover:underline font-semibold"
        >
          Tüm Personeller
        </Link>

      </div>

      {employees.length === 0 ? (

        <div className="p-8 text-center text-gray-500">
          Personel bulunamadı.
        </div>

      ) : (

        <div className="divide-y">

          {employees.map((employee) => {

            const activeJobs = employee.productionSteps.length;

            let statusColor = "bg-green-500";
            let statusText = "Müsait";

            if (activeJobs >= 5) {
              statusColor = "bg-red-500";
              statusText = "Yoğun";
            } else if (activeJobs >= 1) {
              statusColor = "bg-yellow-500";
              statusText = "Çalışıyor";
            }

            return (

              <div
                key={employee.id}
                className="flex items-center justify-between p-5 hover:bg-slate-50"
              >

                <div>

                  <div className="font-bold">
                    {employee.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    {employee.role}
                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <div className="text-center">

                    <div className="text-xl font-bold text-blue-600">
                      {activeJobs}
                    </div>

                    <div className="text-xs text-gray-500">
                      Aktif İş
                    </div>

                  </div>

                  <div
                    className={`w-3 h-3 rounded-full ${statusColor}`}
                    title={statusText}
                  />

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
}