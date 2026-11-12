import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetailPage({
  params,
}: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: {
      id,
    },

    include: {
      customer: true,

      productionSteps: {
        orderBy: {
          stepOrder: "asc",
        },

        include: {
          station: true,

          assignments: {
            include: {
              employee: true,
            },
          },

          photos: true,
        },
      },

      photos: true,

      files: true,

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
    <main className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-3xl font-bold">
            {job.title}
          </h1>

          <p className="mt-2 text-gray-500">
            {job.customer.company}
          </p>

          <p className="mt-1 text-sm text-gray-400">
            {job.jobNo}
          </p>
        </div>

        <Link
          href="/jobs"
          className="rounded-lg border px-5 py-3 hover:bg-gray-50"
        >
          ← İşlere Dön
        </Link>

      </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">

        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">
            Durum
          </div>

          <div className="mt-1 text-lg font-bold">
            {job.status}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">
            Öncelik
          </div>

          <div className="mt-1 text-lg font-bold">
            {job.priority}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">
            Teslim Tarihi
          </div>

          <div className="mt-1 text-lg font-bold">
            {job.deliveryDate
              ? new Date(job.deliveryDate).toLocaleDateString("tr-TR")
              : "-"}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">
            Üretim Adımı
          </div>

          <div className="mt-1 text-lg font-bold">
            {job.productionSteps.length}
          </div>
        </div>

      </div>

      <section className="space-y-5">

        <h2 className="text-2xl font-bold">
          Üretim Akışı
        </h2>

        {job.productionSteps.length === 0 ? (

          <div className="rounded-xl border bg-white p-6 text-gray-500">
            Bu işe henüz üretim adımı eklenmemiş.
          </div>

        ) : (

          job.productionSteps.map((step) => (

            <div
              key={step.id}
              className="rounded-xl border bg-white p-6"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-bold">
                    {step.stepOrder}. {step.station.name}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Durum : {step.status}
                  </p>

                  <p className="text-sm text-gray-500">
                    İlerleme : %{step.progress}
                  </p>

                </div>

                <div className="text-right">

                  <div className="font-semibold">
                    Personel
                  </div>

                  <div className="text-2xl font-bold">
                    {step.assignments.length}
                  </div>

                </div>

              </div>
                            <div className="mt-6">

                <div className="mb-2 font-semibold">
                  Atanan Personeller
                </div>

                {step.assignments.length === 0 ? (

                  <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                    Bu istasyona personel atanmadı.
                  </div>

                ) : (

                  <div className="flex flex-wrap gap-2">

                    {step.assignments.map((assignment) => (

                      <span
                        key={assignment.id}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                      >
                        {assignment.employee.name}
                      </span>

                    ))}

                  </div>

                )}

              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">
                    Tahmini Süre
                  </div>

                  <div className="mt-1 font-semibold">
                    {step.estimatedMinutes ?? 0} dk
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">
                    Fotoğraf
                  </div>

                  <div className="mt-1 font-semibold">
                    {step.photoCount}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">
                    Dosya
                  </div>

                  <div className="mt-1 font-semibold">
                    {step.fileCount}
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">
                    Not
                  </div>

                  <div className="mt-1 font-semibold">
                    {step.noteCount}
                  </div>
                </div>

              </div>

            </div>

          ))

        )}

      </section>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* NOTLAR */}

        <div className="rounded-xl border bg-white p-6">

          <h2 className="mb-4 text-xl font-bold">
            Notlar
          </h2>

          {job.notes.length === 0 ? (

            <p className="text-sm text-gray-500">
              Henüz not eklenmemiş.
            </p>

          ) : (

            <div className="space-y-3">

              {job.notes.map((note) => (

                <div
                  key={note.id}
                  className="rounded-lg border p-3"
                >

                  <div className="font-semibold">
                    {note.employee?.name ?? "Sistem"}
                  </div>

                  <div className="mt-2 text-sm">
                    {note.note}
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleString("tr-TR")}
                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* FOTOĞRAFLAR */}

        <div className="rounded-xl border bg-white p-6">

          <h2 className="mb-4 text-xl font-bold">
            Fotoğraflar
          </h2>

          <div className="text-5xl font-bold text-blue-600">
            {job.photos.length}
          </div>

          <div className="mt-2 text-sm text-gray-500">
            Sisteme yüklenen toplam fotoğraf
          </div>

        </div>

        {/* DOSYALAR */}

        <div className="rounded-xl border bg-white p-6">

          <h2 className="mb-4 text-xl font-bold">
            Dosyalar
          </h2>

          <div className="text-5xl font-bold text-green-600">
            {job.files.length}
          </div>

          <div className="mt-2 text-sm text-gray-500">
            Sisteme yüklenen toplam dosya
          </div>

        </div>

      </div>
            <section className="rounded-xl border bg-white p-6">

        <h2 className="mb-5 text-2xl font-bold">
          İş Geçmişi
        </h2>

        {job.history.length === 0 ? (

          <p className="text-gray-500">
            Henüz işlem geçmişi bulunmuyor.
          </p>

        ) : (

          <div className="space-y-4">

            {job.history.map((history) => (

              <div
                key={history.id}
                className="border-l-4 border-blue-500 pl-4"
              >

                <div className="font-semibold">
                  {history.action}
                </div>

                {history.description && (

                  <div className="mt-1 text-sm text-gray-600">
                    {history.description}
                  </div>

                )}

                {(history.oldValue || history.newValue) && (

                  <div className="mt-2 text-xs text-gray-500">

                    {history.oldValue && (
                      <div>
                        <strong>Eski:</strong> {history.oldValue}
                      </div>
                    )}

                    {history.newValue && (
                      <div>
                        <strong>Yeni:</strong> {history.newValue}
                      </div>
                    )}

                  </div>

                )}

                <div className="mt-2 text-xs text-gray-400">

                  {history.employee?.name ?? "Sistem"}

                  {" • "}

                  {new Date(history.createdAt).toLocaleString("tr-TR")}

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}