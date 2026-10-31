import Link from "next/link";
import { prisma } from "../../../lib/prisma";

export default async function RecentJobs() {
  const jobs = await prisma.job.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: true,
    },
  });

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-5 text-xl font-bold">
        Son İşler
      </h2>

      <table className="w-full">
        <thead>
          <tr>
            <th>İş No</th>
            <th>Başlık</th>
            <th>Müşteri</th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <Link href={`/jobs/${job.id}`}>
                  {job.jobNo}
                </Link>
              </td>

              <td>{job.title}</td>

              <td>{job.customer.company}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}