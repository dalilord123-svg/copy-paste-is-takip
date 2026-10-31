import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ProductionStepStatus,
  JobPriority,
} from "@prisma/client";

function getPriorityColor(priority: JobPriority) {
  switch (priority) {
    case "ACIL":
      return "bg-red-600 text-white";

    case "YUKSEK":
      return "bg-orange-500 text-white";

    case "NORMAL":
      return "bg-blue-500 text-white";

    case "DUSUK":
      return "bg-gray-400 text-white";

    default:
      return "bg-gray-300";
  }
}

function getPriorityText(priority: JobPriority) {
  switch (priority) {
    case "ACIL":
      return "Acil";

    case "YUKSEK":
      return "Yüksek";

    case "NORMAL":
      return "Normal";

    case "DUSUK":
      return "Düşük";

    default:
      return "-";
  }
}

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    where: {
      isArchived: false,
    },

    include: {
      customer: true,

      productionSteps: {
        include: {
          station: true,
          employee: true,
        },
        orderBy: {
          stepOrder: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="max-w-7xl mx-auto p-8">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            Aktif İşler
          </h1>

          <p className="text-gray-500 mt-2">
            Toplam {jobs.length} aktif iş
          </p>

        </div>

        <div className="flex gap-3">

          <Link
            href="/archive"
            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg"
          >
            Arşiv
          </Link>

          <Link
            href="/jobs/new"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            + Yeni İş
          </Link>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {jobs.length === 0 ? (

          <div className="p-8 text-gray-500">
            Aktif iş bulunmuyor.
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
                  Öncelik
                </th>

                <th className="p-4 text-left">
                  Üretim
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

                const total =
                  job.productionSteps.length;

                const completed =
                  job.productionSteps.filter(
                    (s) =>
                      s.status ===
                      ProductionStepStatus.TAMAMLANDI
                  ).length;

                const percent =
                  total === 0
                    ? 0
                    : Math.round(
                        (completed * 100) / total
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
                      <span
                        className={`rounded-lg px-3 py-1 text-sm font-medium ${getPriorityColor(
                          job.priority
                        )}`}
                      >
                        {getPriorityText(job.priority)}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="w-48">

                        <div className="flex justify-between text-xs mb-1">
                          <span>
                            {completed}/{total}
                          </span>

                          <span>
                            %{percent}
                          </span>
                        </div>

                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-green-600"
                            style={{
                              width: `${percent}%`,
                            }}
                          />

                        </div>

                        <div className="text-xs text-gray-500 mt-1">

                          {total === 0
                            ? "Henüz üretim planı yok"
                            : completed === total
                            ? "Tamamlandı"
                            : job.productionSteps.find(
                                (x) =>
                                  x.status !==
                                  ProductionStepStatus.TAMAMLANDI
                              )?.station.name}

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

                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Görüntüle
                      </Link>

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