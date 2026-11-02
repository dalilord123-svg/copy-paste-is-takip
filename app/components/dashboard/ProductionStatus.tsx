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
            in: ["BEKLIYOR", "HAZIR", "DEVAM_EDIYOR", "BEKLEMEDE"],
          },
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

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
          Tüm İstasyonlar
        </Link>

      </div>

      <div className="p-6 space-y-6">

        {stations.length === 0 && (

          <div className="text-center text-gray-500 py-8">
            Henüz istasyon oluşturulmamış.
          </div>

        )}

        {stations.map((station) => {

          const total = station.productionSteps.length;

          const progress =
            total === 0
              ? 0
              : Math.min(total * 12, 100);

          return (

            <div key={station.id}>

              <div className="flex justify-between items-center mb-2">

                <div>

                  <div className="font-bold">

                    {station.name}

                  </div>

                  <div className="text-sm text-gray-500">

                    Aktif İş

                  </div>

                </div>

                <div className="text-right">

                  <div className="text-2xl font-bold text-blue-600">

                    {total}

                  </div>

                </div>

              </div>

              <div className="h-3 rounded-full bg-gray-200 overflow-hidden">

                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}