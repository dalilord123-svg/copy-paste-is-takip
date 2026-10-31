import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductionStepStatus } from "@prisma/client";
import RestoreJobButton from "../components/jobs/RestoreJobButton";

function getProgress(job: {
  productionSteps: {
    status: ProductionStepStatus;
  }[];
}) {
  const total = job.productionSteps.length;

  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      percent: 0,
    };
  }

  const completed = job.productionSteps.filter(
    (s) => s.status === ProductionStepStatus.TAMAMLANDI
  ).length;

  return {
    total,
    completed,
    percent: Math.round((completed * 100) / total),
  };
}

export default async function ArchivePage() {
  const jobs = await prisma.job.findMany({
    where: {
      isArchived: true,
    },

    include: {
      customer: true,

      productionSteps: {
        include: {
          station: true,
        },

        orderBy: {
          stepOrder: "asc",
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <main className="max-w-7xl mx-auto p-8">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            Arşiv
          </h1>

          <p className="text-gray-500 mt-2">
            {jobs.length} arşivlenmiş iş
          </p>

        </div>

        <Link
          href="/jobs"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
        >
          Aktif İşlere Dön
        </Link>

      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">

        {jobs.length === 0 ? (

          <div className="p-8 text-center text-gray-500">
            Arşiv boş.
          </div>

        ) : (

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4 text-left">
                  İş No
                </th>

                <th className="p-4 text-left">
                  Firma
                </th>

                <th className="p-4 text-left">
                  İş
                </th>

                <th className="p-4 text-left">
                  İlerleme
                </th>

                <th className="p-4 text-left">
                  Teslim
                </th>

                <th className="p-4 text-right">
                  İşlem
                </th>

              </tr>

            </thead>

            <tbody>

              {jobs.map((job) => {

                const progress = getProgress(job);

                const currentStep =
                  job.productionSteps.find(
                    (x) =>
                      x.status !==
                      ProductionStepStatus.TAMAMLANDI
                  );

                return (

                  <tr
                    key={job.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-4 font-semibold">
                      {job.jobNo}
                    </td>

                    <td className="p-4">
                      {job.customer.company}
                    </td>

                    <td className="p-4">
                      {job.title}
                    </td>

                    <td className="p-4">

                      <div className="w-48">

                        <div className="flex justify-between text-xs mb-1">

                          <span>
                            {progress.completed}/{progress.total}
                          </span>

                          <span>
                            %{progress.percent}
                          </span>

                        </div>

                        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">

                          <div
                            className="h-full bg-green-600"
                            style={{
                              width: `${progress.percent}%`,
                            }}
                          />

                        </div>

                        <div className="text-xs text-gray-500 mt-1">

                          {progress.percent === 100
                            ? "Tamamlandı"
                            : currentStep?.station.name ||
                              "-"}

                        </div>

                      </div>

                    </td>

                    <td className="p-4">

                      {job.deliveryDate
                        ? new Date(
                            job.deliveryDate
                          ).toLocaleDateString("tr-TR")
                        : "-"}

                    </td>

                    <td className="p-4 text-right">

                      <RestoreJobButton
                        jobId={job.id}
                      />

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        )}

      </div>

    </main>
  );
}