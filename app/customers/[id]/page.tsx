
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

function getPriorityText(priority: string) {
  const priorities: Record<string, string> = {
    DUSUK: "Düşük",
    NORMAL: "Normal",
    YUKSEK: "Yüksek",
    ACIL: "Acil",
  };

  return priorities[priority] ?? priority;
}

function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    DUSUK: "bg-gray-100 text-gray-700",
    NORMAL: "bg-blue-100 text-blue-700",
    YUKSEK: "bg-orange-100 text-orange-700",
    ACIL: "bg-red-100 text-red-700",
  };

  return colors[priority] ?? "bg-gray-100 text-gray-700";
}

function getJobProgress(job: {
  productionSteps: { status: string }[];
}) {
  const total = job.productionSteps.length;

  const completed = job.productionSteps.filter(
    (step) => step.status === "TAMAMLANDI"
  ).length;

  const percent =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    completed,
    percent,
  };
}

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("tr-TR");
}

export default async function CustomerDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: {
      id,
    },
    include: {
      jobs: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          productionSteps: {
            orderBy: {
              stepOrder: "asc",
            },
            include: {
              station: true,
            },
          },
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const totalJobs = customer.jobs.length;

  const activeJobs = customer.jobs.filter(
    (job) => !job.isArchived
  );

  const archivedJobs = customer.jobs.filter(
    (job) => job.isArchived
  );

  const completedJobs = customer.jobs.filter(
    (job) =>
      job.productionSteps.length > 0 &&
      job.productionSteps.every(
        (step) =>
          step.status === "TAMAMLANDI" ||
          step.status === "IPTAL"
      )
  );

  const overdueJobs = activeJobs.filter(
    (job) =>
      job.deliveryDate &&
      new Date(job.deliveryDate) < new Date() &&
      !(
        job.productionSteps.length > 0 &&
        job.productionSteps.every(
          (step) =>
            step.status === "TAMAMLANDI" ||
            step.status === "IPTAL"
        )
      )
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ÜST MENÜ */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/customers"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Müşterilere Dön
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 mt-3">
              {customer.company}
            </h1>

            <p className="text-gray-500 mt-1">
              Müşteri detayları ve iş takip ekranı
            </p>
          </div>

          <Link
            href="/jobs/new"
            className="rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            + Yeni İş Oluştur
          </Link>
        </div>

        {/* MÜŞTERİ BİLGİLERİ */}
        <section className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
              🏢
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Müşteri Bilgileri
              </h2>

              <p className="text-sm text-gray-500">
                Kayıtlı iletişim bilgileri
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <div className="text-sm text-gray-500">
                Yetkili Kişi
              </div>
              <div className="font-semibold mt-1">
                {customer.contact || "-"}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">
                Telefon
              </div>
              <div className="font-semibold mt-1">
                {customer.phone || "-"}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">
                E-posta
              </div>
              <div className="font-semibold mt-1 break-all">
                {customer.email || "-"}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">
                Adres
              </div>
              <div className="font-semibold mt-1">
                {customer.address || "-"}
              </div>
            </div>
          </div>

          {customer.notes && (
            <div className="mt-5 border-t pt-4">
              <div className="text-sm text-gray-500 mb-1">
                Notlar
              </div>

              <p className="text-gray-700 whitespace-pre-wrap">
                {customer.notes}
              </p>
            </div>
          )}
        </section>

        {/* İSTATİSTİKLER */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className="text-sm text-gray-500">
              Toplam İş
            </div>
            <div className="text-3xl font-bold mt-2">
              {totalJobs}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className="text-sm text-gray-500">
              Aktif İş
            </div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {activeJobs.length}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className="text-sm text-gray-500">
              Tamamlanan
            </div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {completedJobs.length}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className="text-sm text-gray-500">
              Geciken İş
            </div>
            <div className="text-3xl font-bold text-red-600 mt-2">
              {overdueJobs.length}
            </div>
          </div>
        </section>

        {/* İŞ LİSTESİ */}
        <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-6 border-b">
            <div>
              <h2 className="text-xl font-bold">
                Müşterinin İşleri
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Bu müşteriye ait tüm iş kayıtları
              </p>
            </div>

            <span className="bg-blue-100 text-blue-700 rounded-lg px-3 py-2 text-sm font-semibold">
              {totalJobs} İş
            </span>
          </div>

          {totalJobs === 0 ? (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4">📦</div>

              <h3 className="text-xl font-bold">
                Henüz iş bulunmuyor
              </h3>

              <p className="text-gray-500 mt-2">
                Bu müşteri için henüz iş oluşturulmamış.
              </p>

              <Link
                href="/jobs/new"
                className="inline-block mt-5 bg-blue-600 text-white rounded-xl px-5 py-3 hover:bg-blue-700"
              >
                İlk İşi Oluştur
              </Link>
            </div>
          ) : (
            <>
              {/* MASAÜSTÜ TABLO */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-4 text-left">İş No</th>
                      <th className="p-4 text-left">İş Adı</th>
                      <th className="p-4 text-left">Öncelik</th>
                      <th className="p-4 text-left">Üretim İlerlemesi</th>
                      <th className="p-4 text-left">Teslim Tarihi</th>
                      <th className="p-4 text-left">Durum</th>
                      <th className="p-4 text-right">İşlem</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {customer.jobs.map((job) => {
                      const progress = getJobProgress(job);

                      const currentStep =
                        job.productionSteps.find(
                          (step) =>
                            step.status !== "TAMAMLANDI" &&
                            step.status !== "IPTAL"
                        );

                      return (
                        <tr
                          key={job.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="p-4 font-bold">
                            {job.jobNo}
                          </td>

                          <td className="p-4 font-medium">
                            {job.title}
                          </td>

                          <td className="p-4">
                            <span
                              className={`rounded-lg px-3 py-1 text-xs font-medium ${getPriorityColor(job.priority)}`}
                            >
                              {getPriorityText(job.priority)}
                            </span>
                          </td>

                          <td className="p-4 min-w-52">
                            <div className="flex justify-between text-xs mb-1">
                              <span>
                                {progress.completed}/{progress.total}
                              </span>

                              <span>
                                %{progress.percent}
                              </span>
                            </div>

                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-600"
                                style={{
                                  width: `${progress.percent}%`,
                                }}
                              />
                            </div>

                            <div className="text-xs text-gray-500 mt-1">
                              {progress.total === 0
                                ? "Henüz üretim planı yok"
                                : progress.percent === 100
                                  ? "Tamamlandı"
                                  : currentStep?.station.name || "-"}
                            </div>
                          </td>

                          <td className="p-4">
                            {formatDate(job.deliveryDate)}
                          </td>

                          <td className="p-4">
                            {job.isArchived ? (
                              <span className="text-gray-500 bg-gray-100 rounded-lg px-3 py-1 text-xs">
                                Arşiv
                              </span>
                            ) : (
                              <span className="text-green-700 bg-green-100 rounded-lg px-3 py-1 text-xs">
                                Aktif
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              Görüntüle
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBİL KARTLAR */}
              <div className="lg:hidden p-4 space-y-4">
                {customer.jobs.map((job) => {
                  const progress = getJobProgress(job);

                  const currentStep =
                    job.productionSteps.find(
                      (step) =>
                        step.status !== "TAMAMLANDI" &&
                        step.status !== "IPTAL"
                    );

                  return (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-bold text-lg">
                          {job.jobNo}
                        </div>

                        <span
                          className={`rounded-lg px-3 py-1 text-xs font-medium ${getPriorityColor(job.priority)}`}
                        >
                          {getPriorityText(job.priority)}
                        </span>
                      </div>

                      <div className="mt-4 text-xl font-semibold">
                        {job.title}
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span>
                            {progress.completed}/{progress.total}
                          </span>

                          <span>
                            %{progress.percent}
                          </span>
                        </div>

                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600"
                            style={{
                              width: `${progress.percent}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 text-sm text-gray-500">
                          {progress.total === 0
                            ? "Henüz üretim planı yok"
                            : progress.percent === 100
                              ? "Tamamlandı"
                              : currentStep?.station.name || "-"}
                        </div>
                      </div>

                      <div className="mt-5 flex justify-between text-sm">
                        <span className="text-gray-500">
                          Teslim Tarihi
                        </span>

                        <span className="font-medium text-gray-900">
                          {formatDate(job.deliveryDate)}
                        </span>
                      </div>

                      {job.isArchived && (
                        <div className="mt-3 text-xs text-gray-500">
                          Arşivlenmiş iş
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* ALT BİLGİ */}
        <div className="text-sm text-gray-400 text-center">
          COPY PASTE İş Takip Sistemi
        </div>
      </div>
    </main>
  );
}
