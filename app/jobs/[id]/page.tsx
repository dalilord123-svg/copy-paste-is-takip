import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ProductionStepStatus, JobPriority } from "@prisma/client";

import JobInfoCard from "../../components/jobs/JobInfoCard";
import FileList from "../../components/jobs/FileList";
import FileUpload from "../../components/jobs/FileUpload";
import ArchiveJobButton from "../../components/jobs/ArchiveJobButton";
import StatusSelect from "../../components/jobs/StatusSelect";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function priorityColor(priority: JobPriority) {
  switch (priority) {
    case "ACIL":
      return "bg-red-600 text-white";
    case "YUKSEK":
      return "bg-orange-500 text-white";
    case "NORMAL":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

function priorityText(priority: JobPriority) {
  switch (priority) {
    case "ACIL":
      return "Acil";
    case "YUKSEK":
      return "Yüksek";
    case "NORMAL":
      return "Normal";
    default:
      return "Düşük";
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      files: true,
      notes: {
        include: {
          employee: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      photos: {
        include: {
          employee: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      history: {
        include: {
          employee: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
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

  if (!job) {
    notFound();
  }

  const totalSteps = job.productionSteps.length;

  const completedSteps = job.productionSteps.filter(
    (x) => x.status === ProductionStepStatus.TAMAMLANDI
  ).length;

  const progress =
    totalSteps === 0 ? 0 : Math.round((completedSteps * 100) / totalSteps);

  return (
    <main className="max-w-7xl mx-auto p-8">
      <Link href="/jobs" className="text-blue-600 hover:underline">
        ← İşlere Dön
      </Link>

      <div className="flex justify-between items-start mt-8">
        <div>
          <h1 className="text-4xl font-bold">{job.title}</h1>
          <p className="text-gray-500 mt-2">{job.jobNo}</p>
        </div>

        <div className="flex gap-3">
          <span
            className={`px-4 py-2 rounded-lg font-semibold ${priorityColor(job.priority)}`}
          >
            {priorityText(job.priority)}
          </span>

          <Link
            href={`/jobs/${job.id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg"
          >
            Düzenle
          </Link>

          <ArchiveJobButton jobId={job.id} />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between text-sm mb-2">
          <span>Üretim İlerlemesi</span>
          <span>%{progress}</span>
        </div>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-3 bg-green-600 rounded-full transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-10">
        <JobInfoCard title="Firma" value={job.customer.company} />
        <JobInfoCard title="Yetkili" value={job.customer.contact || "-"} />
        <JobInfoCard title="Malzeme" value={job.material || "-"} />
        <JobInfoCard title="Makine" value={job.machine || "-"} />
        <JobInfoCard
          title="Ölçü"
          value={
            job.width && job.height ? `${job.width} x ${job.height} cm` : "-"
          }
        />
        <JobInfoCard
          title="Adet"
          value={job.quantity ? job.quantity.toString() : "-"}
        />
        <JobInfoCard
          title="Teslim Tarihi"
          value={
            job.deliveryDate
              ? new Date(job.deliveryDate).toLocaleDateString("tr-TR")
              : "-"
          }
        />
        <JobInfoCard
          title="Tamamlanan Adım"
          value={`${completedSteps} / ${totalSteps}`}
        />
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-10">
        <h2 className="text-2xl font-bold mb-5">Üretim Adımları</h2>

        {job.productionSteps.length === 0 ? (
          <p className="text-gray-500">
            Bu iş için henüz üretim planı oluşturulmamış.
          </p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Sıra</th>
                <th className="p-3 text-left">İstasyon</th>
                <th className="p-3 text-left">Personel</th>
                <th className="p-3 text-left">Durum</th>
                <th className="p-3 text-left">İlerleme</th>
              </tr>
            </thead>

            <tbody>
              {job.productionSteps.map((step) => (
                <tr key={step.id} className="border-t">
                  <td className="p-3">{step.stepOrder}</td>

                  <td className="p-3">{step.station.name}</td>

                  <td className="p-3">
                    <div className="font-medium">{step.employee?.name || "-"}</div>
                    <div className="text-xs text-gray-500">
                      {step.station.name}
                    </div>
                  </td>

                  <td className="p-3">
                    <StatusSelect
                      jobId={job.id}
                      stepId={step.id}
                      currentStatus={step.status}
                    />
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-40 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{
                            width: `${step.progress}%`,
                          }}
                        />
                      </div>

                      <span className="text-sm">%
                        {step.progress}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold">Dosyalar</h2>
          <FileUpload jobId={job.id} />
        </div>

        <FileList files={job.files} />
      </div>

      <div className="bg-white rounded-xl shadow p-6 mt-10">
        <h2 className="text-2xl font-bold mb-4">Açıklama</h2>

        <p className="whitespace-pre-wrap">
          {job.description || "Açıklama girilmemiş."}
        </p>
      </div>
    </main>
  );
}