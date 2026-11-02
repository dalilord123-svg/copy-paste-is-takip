import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RecentJobs() {
  const jobs = await prisma.job.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
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
  });

  return (
    <div className="bg-white rounded-2xl shadow">

      <div className="flex items-center justify-between p-6 border-b">

        <h2 className="text-2xl font-bold">
          Son İşler
        </h2>

        <Link
          href="/jobs"
          className="text-blue-600 font-semibold hover:underline"
        >
          Tümünü Gör
        </Link>

      </div>

      {jobs.length === 0 && (
        <div className="p-10 text-center text-gray-500">
          Henüz iş bulunmuyor.
        </div>
      )}

      <div className="divide-y">

        {jobs.map((job) => {

          const activeStep = job.productionSteps.find(
            (x) => x.status === "DEVAM_EDIYOR"
          );

          return (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block hover:bg-slate-50 transition"
            >
              <div className="p-5 flex justify-between">

                <div>

                  <div className="text-sm text-gray-500">
                    {job.jobNo}
                  </div>

                  <div className="font-bold text-lg mt-1">
                    {job.title}
                  </div>

                  <div className="mt-2 text-gray-500">

                    👤 {job.customer.company}

                  </div>

                  <div className="mt-2">

                    📍{" "}

                    <span className="font-semibold text-blue-600">

                      {activeStep?.station.name ?? "Tamamlandı"}

                    </span>

                  </div>

                </div>

                <div className="text-right">

                  <div className="font-semibold">

                    {activeStep?.employee?.name ?? "-"}

                  </div>

                  <div className="mt-3">

                    <span className="rounded-full bg-blue-100 px-4 py-2 text-blue-700 text-sm font-semibold">

                      {activeStep?.status.replaceAll("_", " ") ??
                        "TAMAMLANDI"}

                    </span>

                  </div>

                  <div className="text-sm text-gray-500 mt-4">

                    {job.deliveryDate
                      ? new Date(
                          job.deliveryDate
                        ).toLocaleDateString("tr-TR")
                      : "-"}

                  </div>

                </div>

              </div>

            </Link>
          );
        })}

      </div>

    </div>
  );
}