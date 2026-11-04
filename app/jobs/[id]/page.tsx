import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetailPage({ params }: Props) {
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
          leader: true,
          assignments: {
            include: {
              employee: true,
            },
          },
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
          className="rounded-lg border px-5 py-3 text-center hover:bg-gray-50"
        >
          ← İşlere Dön
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">
            Durum
          </div>

          <div className="mt-1 text-lg font-bold">
            {job.status}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">
            Öncelik
          </div>

          <div className="mt-1 text-lg font-bold">
            {job.priority}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">
            Teslim
          </div>

          <div className="mt-1 text-lg font-bold">
            {job.deliveryDate
              ? new Date(job.deliveryDate).toLocaleDateString("tr-TR")
              : "-"}
          </div>
        </div>

        <div className="rounded-xl border p-4">
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
          <div className="rounded-xl border p-5 text-gray-500">
            Bu işe henüz üretim adımı eklenmemiş.
          </div>
        ) : (
          job.productionSteps.map((step) => (
            <div
              key={step.id}
              className="rounded-xl border p-5"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <h3 className="text-lg font-bold">
                    {step.stepOrder}. {step.station.name}
                  </h3>

                  <div className="mt-2 text-sm text-gray-500">
                    Durum: {step.status}
                  </div>

                  <div className="text-sm text-gray-500">
                    İlerleme: %{step.progress}
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="font-semibold">
                    Ustabaşı
                  </div>

                  <div>
                    {step.leader?.name ?? "-"}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 font-semibold">
                  Personeller
                </div>

                {step.assignments.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Henüz personel atanmamış.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {step.assignments.map((assignment) => (
                      <span
                        key={assignment.id}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                      >
                        {assignment.employee.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <h3 className="mb-4 font-bold">
            Notlar
          </h3>

          <div className="space-y-3">
            {job.notes.length === 0 ? (
              <p className="text-sm text-gray-400">
                Henüz not eklenmemiş.
              </p>
            ) : (
              job.notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border p-3"
                >
                  <div className="font-medium">
                    {note.employee?.name ?? "Sistem"}
                  </div>

                  <div className="mt-1 text-sm">
                    {note.note}
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleString("tr-TR")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <h3 className="mb-4 font-bold">
            Fotoğraflar
          </h3>

          <div className="text-3xl font-bold">
            {job.photos.length}
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <h3 className="mb-4 font-bold">
            Dosyalar
          </h3>

          <div className="text-3xl font-bold">
            {job.files.length}
          </div>
        </div>
      </div>
    </main>
  );
}