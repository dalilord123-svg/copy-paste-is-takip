import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ProductionStepStatus, JobPriority } from "@prisma/client";

function getPriorityColor(priority: JobPriority) {
  switch (priority) {
    case "ACIL":
      return "bg-red-600 text-white";
    case "YUKSEK":
      return "bg-orange-500 text-white";
    case "NORMAL":
      return "bg-blue-500 text-white";
    case "DUSUK":
      return "bg-gray-400 text-white";
    default:
      return "bg-gray-300 text-black";
  }
}

function getPriorityText(priority: JobPriority) {
  switch (priority) {
    case "ACIL":
      return "Acil";
    case "YUKSEK":
      return "Yüksek";
    case "NORMAL":
      return "Normal";
    case "DUSUK":
      return "Düşük";
    default:
      return "-";
  }
}

function getJobProgress(job: {
  productionSteps: {
    status: ProductionStepStatus;
  }[];
}) {
  const total = job.productionSteps.length;

  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      percent: 0,
    };
  }

  const completed = job.productionSteps.filter(
    (step) => step.status === ProductionStepStatus.TAMAMLANDI
  ).length;

  return {
    total,
    completed,
    percent: Math.round((completed * 100) / total),
  };
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

 const customer = await prisma.customer.findUnique({
  where: {
    id,
  },
  include: {
    jobs: {
      where: {
        isArchived: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
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
    },
  },
});

  if (!customer) {
    notFound();
  }

  const totalJobs = customer.jobs.length;

  const activeJobs = customer.jobs.filter((job) => {
    const progress = getJobProgress(job);
    return progress.percent < 100;
  }).length;

  const completedJobs = customer.jobs.filter((job) => {
    const progress = getJobProgress(job);
    return progress.percent === 100;
  }).length;

  const waitingJobs = customer.jobs.filter((job) =>
    job.productionSteps.some(
      (step) => step.status === ProductionStepStatus.BEKLIYOR
    )
  ).length;

  const designJobs = customer.jobs.filter((job) =>
    job.productionSteps.some((step) => step.station.name === "Tasarım")
  ).length;

  const printJobs = customer.jobs.filter((job) =>
    job.productionSteps.some((step) => step.station.name === "Baskı")
  ).length;

  const cuttingJobs = customer.jobs.filter((job) =>
    job.productionSteps.some((step) => step.station.name === "Kesim")
  ).length;

  const assemblyJobs = customer.jobs.filter((job) =>
    job.productionSteps.some((step) => step.station.name === "Montaj")
  ).length;

  const lastDelivery = customer.jobs
    .filter((job) => job.deliveryDate)
    .sort(
      (a, b) =>
        new Date(b.deliveryDate!).getTime() -
        new Date(a.deliveryDate!).getTime()
    )[0];

  return (
    <main className="max-w-7xl mx-auto p-8">
      <Link
        href="/customers"
        className="text-blue-600 hover:underline"
      >
        ← Müşterilere Dön
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-6">
        <div>
          <h1 className="text-4xl font-bold">
            {customer.company}
          </h1>

          <p className="text-gray-500 mt-2">
            {customer.contact || "-"}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/jobs/new?customer=${customer.id}`}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl"
          >
            + Yeni İş
          </Link>

          <Link
            href={`/customers/${customer.id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-xl"
          >
            Düzenle
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-gray-500">
            👤 Yetkili
          </div>

          <div className="text-xl font-bold mt-2">
            {customer.contact || "-"}
          </div>

          <div className="mt-5 text-sm text-gray-500">
            📞 Telefon
          </div>

          <div className="font-semibold">
            {customer.phone || "-"}
          </div>

          <div className="mt-5 text-sm text-gray-500">
            ✉️ E-Posta
          </div>

          <div className="font-semibold break-all">
            {customer.email || "-"}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-gray-500">
            Toplam İş
          </div>

          <div className="text-5xl font-bold text-blue-600 mt-3">
            {totalJobs}
          </div>

          <div className="mt-6 flex justify-between">
            <span className="text-gray-500">
              Aktif
            </span>

            <span className="font-bold">
              {activeJobs}
            </span>
          </div>

          <div className="mt-2 flex justify-between">
            <span className="text-gray-500">
              Teslim
            </span>

            <span className="font-bold">
              {completedJobs}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-gray-500">
            Son Teslim
          </div>

          <div className="text-xl font-bold mt-3">
            {lastDelivery?.deliveryDate
              ? new Date(lastDelivery.deliveryDate).toLocaleDateString("tr-TR")
              : "-"}
          </div>

          <div className="mt-6 text-gray-500">
            Son İş
          </div>

          <div className="font-semibold mt-2">
            {lastDelivery?.title || "-"}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 lg:col-span-3">
          <h3 className="text-xl font-bold mb-6">
            Üretim Durumu
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-xl bg-yellow-50 p-4 text-center">
              <div className="text-sm text-gray-500">Bekliyor</div>
              <div className="text-3xl font-bold text-yellow-600">{waitingJobs}</div>
            </div>

            <div className="rounded-xl bg-blue-50 p-4 text-center">
              <div className="text-sm text-gray-500">Tasarım</div>
              <div className="text-3xl font-bold text-blue-600">{designJobs}</div>
            </div>

            <div className="rounded-xl bg-purple-50 p-4 text-center">
              <div className="text-sm text-gray-500">Baskı</div>
              <div className="text-3xl font-bold text-purple-600">{printJobs}</div>
            </div>

            <div className="rounded-xl bg-orange-50 p-4 text-center">
              <div className="text-sm text-gray-500">Kesim</div>
              <div className="text-3xl font-bold text-orange-600">{cuttingJobs}</div>
            </div>

            <div className="rounded-xl bg-green-50 p-4 text-center">
              <div className="text-sm text-gray-500">Montaj</div>
              <div className="text-3xl font-bold text-green-600">{assemblyJobs}</div>
            </div>

            <div className="rounded-xl bg-gray-100 p-4 text-center">
              <div className="text-sm text-gray-500">Teslim</div>
              <div className="text-3xl font-bold">{completedJobs}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow mt-10 overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">
            Bu Firmaya Ait İşler
          </h2>
        </div>

        {customer.jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Bu müşteriye ait iş bulunmuyor.
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4">
                      İş No
                    </th>

                    <th className="text-left p-4">
                      Başlık
                    </th>

                    <th className="text-left p-4">
                      Öncelik
                    </th>

                    <th className="text-left p-4">
                      İlerleme
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
                  {customer.jobs.map((job) => {
                    const progress = getJobProgress(job);
                    const currentStep = job.productionSteps.find(
                      (step) =>
                        step.status !== ProductionStepStatus.TAMAMLANDI
                    );

                    return (
                      <tr
                        key={job.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="p-4 font-semibold">
                          {job.jobNo}
                        </td>

                        <td className="p-4">
                          {job.title}
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-lg px-3 py-1 text-sm font-medium ${getPriorityColor(job.priority)}`}
                          >
                            {getPriorityText(job.priority)}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="w-48">
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
                          </div>
                        </td>

                        <td className="p-4">
                          {job.deliveryDate
                            ? new Date(job.deliveryDate).toLocaleDateString("tr-TR")
                            : "-"}
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

            <div className="lg:hidden p-4 space-y-4">
              {customer.jobs.map((job) => {
                const progress = getJobProgress(job);
                const currentStep = job.productionSteps.find(
                  (step) =>
                    step.status !== ProductionStepStatus.TAMAMLANDI
                );

                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
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

                    <div className="mt-5 text-sm text-gray-500">
                      Teslim Tarihi

                      <div className="mt-1 font-medium text-black">
                        {job.deliveryDate
                          ? new Date(job.deliveryDate).toLocaleDateString("tr-TR")
                          : "-"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}