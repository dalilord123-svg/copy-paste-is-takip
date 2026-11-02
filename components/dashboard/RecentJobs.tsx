import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RecentJobs() {
  const jobs = await prisma.job.findMany({
    take: 10,
    where: {
      isArchived: false,
    },
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
          className="text-blue-600 hover:underline font-semibold"
        >
          Tümünü Gör
        </Link>

      </div>

      {jobs.length === 0 ? (

        <div className="p-10 text-center text-gray-500">
          Henüz kayıtlı iş bulunmuyor.
        </div>

      ) : (

        <div className="divide-y">

          {jobs.map((job) => {

            const activeStep = job.productionSteps.find(
              (x) =>
                x.status === "DEVAM_EDIYOR" ||
                x.status === "HAZIR" ||
                x.status === "BEKLIYOR" ||
                x.status === "BEKLEMEDE"
            );

            return (

              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block hover:bg-slate-50 transition"
              >

                <div className="flex justify-between items-center p-5">

                  <div>

                    <div className="text-sm text-gray-500">

                      {job.jobNo}

                    </div>

                    <div className="font-bold text-lg mt-1">

                      {job.title}

                    </div>

                    <div className="text-gray-500 mt-2">

                      👤 {job.customer.company}

                    </div>

                    <div className="text-blue-600 mt-2 font-semibold">

                      📍 {activeStep?.station.name ?? "Tamamlandı"}

                    </div>

                  </div>

                  <div className="text-right">

                    <div
                      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold
                      ${
                        job.priority === "ACIL"
                          ? "bg-red-100 text-red-700"
                          : job.priority === "YUKSEK"
                          ? "bg-orange-100 text-orange-700"
                          : job.priority === "NORMAL"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {job.priority}
                    </div>

                    <div className="mt-3 text-sm">

                      {activeStep?.employee?.name ?? "-"}

                    </div>

                    <div className="text-xs text-gray-500 mt-2">

                      {job.deliveryDate
                        ? job.deliveryDate.toLocaleDateString("tr-TR")
                        : "-"}

                    </div>

                  </div>

                </div>

              </Link>

            );

          })}

        </div>

      )}

    </div>
  );
}