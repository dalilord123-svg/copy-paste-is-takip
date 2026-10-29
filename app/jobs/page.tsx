import Link from "next/link";
import { prisma } from "../lib/prisma";
import JobStatusBadge from "../components/jobs/JobStatusBadge";

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    where: {
      isArchived: false,
    },
    include: {
      customer: true,
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

                <th className="text-left p-4">
                  İş No
                </th>

                <th className="text-left p-4">
                  Firma
                </th>

                <th className="text-left p-4">
                  İş
                </th>

                <th className="text-left p-4">
                  Durum
                </th>

                <th className="text-left p-4">
                  Teslim
                </th>

                <th className="text-right p-4">
                  İşlem
                </th>

              </tr>

            </thead>

            <tbody>

              {jobs.map((job) => (

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
                    <JobStatusBadge
                      status={job.status}
                    />
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

              ))}

            </tbody>

          </table>

        )}

      </div>

    </main>
  );
}