
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function JobsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const jobs = await prisma.job.findMany({
    where: {
      isArchived: false,
    },
    include: {
      customer: true,
      productionSteps: {
        include: {
          station: true,
          leader: true,
          assignments: {
            include: {
              employee: true,
            },
          },
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
          <h1 className="text-3xl font-bold">
            İşler
          </h1>

          <p className="text-gray-500">
            Toplam {jobs.length} iş
          </p>
        </div>

        <Link
          href="/jobs/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
        >
          + Yeni İş
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
          Henüz aktif iş bulunmuyor.
        </div>
      ) : (
        <div className="grid gap-5">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block bg-white border rounded-xl p-6 hover:border-blue-500 transition"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {job.title}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {job.customer.company}
                  </p>

                  <p className="text-sm text-gray-400 mt-2">
                    {job.jobNo}
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    {job.priority}
                  </div>

                  <div className="text-sm text-gray-500">
                    {job.status.replaceAll("_", " ")}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {job.productionSteps.map((step) => (
                  <span
                    key={step.id}
                    className={`px-3 py-1 rounded-full text-sm ${
                      step.status === "TAMAMLANDI"
                        ? "bg-green-100 text-green-700"
                        : step.status === "DEVAM_EDIYOR"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {step.station.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
