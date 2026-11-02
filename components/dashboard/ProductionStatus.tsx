import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ProductionStatus() {
  const stations = await prisma.station.findMany({
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
      sortOrder: "asc",
    },
  });

  const maxJobs = Math.max(
    ...stations.map((s) => s.productionSteps.length),
    1
  );

  return (
    <div className="bg-white rounded-2xl shadow">

      <div className="flex items-center justify-between border-b p-6">

        <h2 className="text-2xl font-bold">
          Üretim Durumu
        </h2>

        <Link
          href="/stations"
          className="text-blue-600 hover:underline font-semibold"
        >
          İstasyonlar
        </Link>

      </div>

      {stations.length === 0 ? (

        <div className="p-8 text-center text-gray-500">
          Henüz istasyon eklenmemiş.
        </div>

      ) : (

        <div className="p-6 space-y-6">

          {stations.map((station) => {

            const total = station.productionSteps.length;

            const percent =
              (total / maxJobs) * 100;

            let color = "bg-green-500";

            if (total >= 5) {
              color = "bg-red-500";
            } else if (total >= 3) {
              color = "bg-yellow-500";
            }

            return (

              <div key={station.id}>

                <div className="flex justify-between mb-2">

                  <div className="font-semibold">

                    {station.name}

                  </div>

                  <div className="font-bold">

                    {total} İş

                  </div>

                </div>

                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">

                  <div
                    className={`${color} h-full transition-all`}
                    style={{
                      width: `${percent}%`,
                    }}
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