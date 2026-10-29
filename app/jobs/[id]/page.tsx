import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "../../lib/prisma";

import JobStatusBadge from "../../components/jobs/JobStatusBadge";
import JobInfoCard from "../../components/jobs/JobInfoCard";
import FileList from "../../components/jobs/FileList";
import FileUpload from "../../components/jobs/FileUpload";
import StatusSelect from "../../components/jobs/StatusSelect";
import ArchiveJobButton from "../../components/jobs/ArchiveJobButton";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      files: true,
    },
  });

  if (!job) {
    notFound();
  }

  return (
    <main className="max-w-6xl mx-auto p-8">

      <Link
        href="/jobs"
        className="text-blue-600 hover:underline"
      >
        ← İşlere Dön
      </Link>

      <div className="flex items-start justify-between mt-6">

        <div>

          <h1 className="text-4xl font-bold">
            {job.title}
          </h1>

          <p className="text-gray-500 mt-2">
            {job.jobNo}
          </p>

        </div>

        <div className="flex items-center gap-3">

          <JobStatusBadge status={job.status} />

          <Link
            href={`/jobs/${job.id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg"
          >
            Düzenle
          </Link>

          <ArchiveJobButton
            jobId={job.id}
          />

        </div>

      </div>

      <div className="mt-8">

        <StatusSelect
          jobId={job.id}
          currentStatus={job.status}
        />

      </div>

      <div className="grid grid-cols-2 gap-6 mt-10">

        <JobInfoCard
          title="Firma"
          value={job.customer.company}
        />

        <JobInfoCard
          title="Yetkili"
          value={job.customer.contact || "-"}
        />

        <JobInfoCard
          title="Malzeme"
          value={job.material || "-"}
        />

        <JobInfoCard
          title="Makine"
          value={job.machine || "-"}
        />

        <JobInfoCard
          title="Ölçü"
          value={
            job.width && job.height
              ? `${job.width} x ${job.height} cm`
              : "-"
          }
        />

        <JobInfoCard
          title="Adet"
          value={
            job.quantity
              ? job.quantity.toString()
              : "-"
          }
        />

        <JobInfoCard
          title="Teslim Tarihi"
          value={
            job.deliveryDate
              ? new Date(job.deliveryDate).toLocaleDateString("tr-TR")
              : "-"
          }
        />

      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-10">

        <h2 className="text-2xl font-bold mb-4">
          Açıklama
        </h2>

        <p className="whitespace-pre-wrap text-gray-700">
          {job.description || "Açıklama girilmemiş."}
        </p>

      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-10">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold">
            Dosyalar
          </h2>

          <FileUpload jobId={job.id} />

        </div>

        <FileList files={job.files} />

      </div>

    </main>
  );
}