import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Deliveries() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const jobs = await prisma.job.findMany({
    where: {
      isArchived: false,
      status: {
        not: "TESLIM",
      },
      deliveryDate: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      customer: true,
    },
    orderBy: [
      {
        priority: "desc",
      },
      {
        deliveryDate: "asc",
      },
    ],
  });

  return (
    <div className="bg-white rounded-2xl shadow">

      <div className="flex items-center justify-between border-b p-6">

        <h2 className="text-2xl font-bold">
          🚚 Bugünkü Teslimatlar
        </h2>

        <Link
          href="/jobs"
          className="text-blue-600 hover:underline font-semibold"
        >
          Tüm İşler
        </Link>

      </div>

      {jobs.length === 0 ? (

        <div className="p-10 text-center text-gray-500">
          🎉 Bugün teslim edilecek iş bulunmuyor.
        </div>

      ) : (

        <div className="divide-y">

          {jobs.map((job) => (

            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block hover:bg-slate-50 transition"
            >
              <div className="flex justify-between items-center p-5">

                <div>

                  <div className="font-bold text-lg">
                    {job.title}
                  </div>

                  <div className="text-sm text-gray-500 mt-1">
                    {job.jobNo}
                  </div>

                  <div className="mt-2 text-gray-500">
                    👤 {job.customer.company}
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

                  <div className="mt-3 text-sm text-gray-500">
                    {job.deliveryDate
                      ? job.deliveryDate.toLocaleDateString("tr-TR")
                      : "-"}
                  </div>

                </div>

              </div>
            </Link>
          ))}

        </div>

      )}

    </div>
  );
}