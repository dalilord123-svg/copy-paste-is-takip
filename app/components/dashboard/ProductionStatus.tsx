import { prisma } from "../../../lib/prisma";

export default async function ProductionStatus() {
  const stations = await prisma.station.findMany({
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      productionSteps: {
        where: {
          status: "DEVAM_EDIYOR",
        },
      },
    },
  });

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-5 text-xl font-bold">
        Üretim Durumu
      </h2>

      <div className="space-y-4">
        {stations.map((station) => (
          <div
            key={station.id}
            className="flex justify-between border-b pb-2"
          >
            <span>{station.name}</span>

            <span className="font-bold">
              {station.productionSteps.length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}