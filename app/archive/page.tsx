import Link from "next/link";

import { prisma } from "../lib/prisma";

import JobStatusBadge from "../components/jobs/JobStatusBadge";
import RestoreJobButton from "../components/jobs/RestoreJobButton";

export default async function ArchivePage() {
  const jobs = await prisma.job.findMany({
    where: {
      isArchived: true,
    },
    include: {
      customer: true,
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
            İş Arşivi
          </h1>

          <p className="text-gray-500 mt-2">
            Toplam {jobs.length} arşivlenmiş iş
          </p>

        </div>

        <Link
          href="/jobs"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Aktif İşler
        </Link>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {jobs.length === 0 ? (

          <div className="p-8 text-gray-500">
            Arşivde iş bulunmuyor.
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
                  Arşiv Tarihi
                </th>

                <th className="text-right p-4">
                  İşlemler
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
                    {new Date(
                      job.updatedAt
                    ).toLocaleDateString("tr-TR")}
                  </td>

                  <td className="p-4">

                    <div className="flex justify-end gap-3">

                      <Link
                        href={`/jobs/${job.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        Görüntüle
                      </Link>

                      <RestoreJobButton
                        jobId={job.id}
                      />

                    </div>

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