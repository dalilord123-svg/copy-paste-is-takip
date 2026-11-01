import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import JobDetailHeader from "@/app/components/jobs/detail/JobDetailHeader";
import JobInfoCard from "@/app/components/jobs/detail/JobInfoCard";
import ProductionTimeline from "@/app/components/jobs/detail/ProductionTimeline";
import FilesCard from "@/app/components/jobs/detail/FilesCard";
import PhotosCard from "@/app/components/jobs/detail/PhotosCard";
import NotesCard from "@/app/components/jobs/detail/NotesCard";
import HistoryCard from "@/app/components/jobs/detail/HistoryCard";
import ActionButtons from "@/app/components/jobs/detail/ActionButtons";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: {
      id,
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

      files: {
        orderBy: {
          uploadedAt: "desc",
        },
      },

      photos: {
        orderBy: {
          uploadedAt: "desc",
        },
      },

      notes: {
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
    },
  });

  if (!job) {
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto p-8 space-y-6">

      <JobDetailHeader job={job} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <div className="xl:col-span-2 space-y-6">

          <JobInfoCard job={job} />

          <ProductionTimeline job={job} />

          <FilesCard
            jobId={job.id}
            files={job.files}
          />

          <PhotosCard
            jobId={job.id}
            photos={job.photos}
          />

        </div>

        <div className="space-y-6">

          <NotesCard
            jobId={job.id}
            notes={job.notes}
          />

          <HistoryCard
            history={job.history}
          />

          <ActionButtons
            job={{
              id: job.id,
              isArchived: job.isArchived,
            }}
          />

        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-lg mb-4">
            Dosya Sayısı
          </h3>

          <div className="text-5xl font-bold text-blue-600">
            {job.files.length}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-lg mb-4">
            Fotoğraf
          </h3>

          <div className="text-5xl font-bold text-green-600">
            {job.photos.length}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-lg mb-4">
            Not
          </h3>

          <div className="text-5xl font-bold text-orange-500">
            {job.notes.length}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-lg mb-4">
            Üretim Adımı
          </h3>

          <div className="text-5xl font-bold text-purple-600">
            {job.productionSteps.length}
          </div>
        </div>

      </div>

      <div className="bg-white rounded-xl border p-6">

        <h2 className="text-xl font-bold mb-6">
          Üretim Özeti
        </h2>

        <div className="space-y-4">

          {job.productionSteps.map((step) => (

            <div
              key={step.id}
              className="flex justify-between items-center border rounded-lg p-4"
            >

              <div>

                <div className="font-semibold">
                  {step.station.name}
                </div>

                <div className="text-sm text-gray-500">
                  {step.employee?.name ?? "Personel Atanmadı"}
                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="font-semibold">
                  %{step.progress}
                </div>

                <div>
                  {step.status}
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      <div className="bg-white rounded-xl border p-6">

        <h2 className="text-xl font-bold mb-6">
          Genel Bilgiler
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <div className="text-sm text-gray-500">
              İş Numarası
            </div>

            <div className="font-semibold text-lg">
              {job.jobNo}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">
              Müşteri
            </div>

            <div className="font-semibold text-lg">
              {job.customer.company}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">
              Oluşturulma Tarihi
            </div>

            <div className="font-semibold">
              {new Date(job.createdAt).toLocaleString("tr-TR")}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">
              Son Güncelleme
            </div>

            <div className="font-semibold">
              {new Date(job.updatedAt).toLocaleString("tr-TR")}
            </div>
          </div>

        </div>

      </div>

    </main>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
      jobNo: true,
    },
  });

  if (!job) {
    return {
      title: "İş Bulunamadı",
    };
  }

  return {
    title: `${job.jobNo} - ${job.title}`,
    description: "COPY PASTE İş Takip",
  };
}