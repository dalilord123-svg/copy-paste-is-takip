import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  JobPriority,
  ProductionStepStatus,
} from "@prisma/client";

import ProductionCard from "../components/production/ProductionCard";

const stations = [
  "Grafik",
  "Baskı",
  "CNC",
  "Elektrik",
  "Kaynak",
  "Boya",
  "Montaj",
  "Kalite Kontrol",
  "Teslim",
];

export default async function ProductionPage() {
  const jobs = await prisma.job.findMany({
    where: {
      isArchived: false,
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
    },

    orderBy: [
      {
        priority: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  function currentStep(job: (typeof jobs)[0]) {
    const active = job.productionSteps.find(
      (x) =>
        x.status !==
        ProductionStepStatus.TAMAMLANDI
    );

    return (
      active ??
      job.productionSteps[
        job.productionSteps.length - 1
      ]
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            Üretim Panosu
          </h1>

          <p className="text-gray-500 mt-2">
            Tüm üretim aşamaları
          </p>

        </div>

        <Link
          href="/jobs"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
        >
          İşler
        </Link>

      </div>

      <div className="flex gap-5 overflow-x-auto pb-8">

        {stations.map((stationName) => {

          const stationJobs = jobs.filter((job) => {
            const step = currentStep(job);

            if (!step) return false;

            return (
              step.station.name ===
              stationName
            );
          });

          return (

            <div
              key={stationName}
              className="min-w-[360px] bg-gray-50 rounded-2xl border border-gray-200 p-4"
            >

              <div className="flex items-center justify-between mb-5">

                <h2 className="font-bold text-xl">
                  {stationName}
                </h2>

                <span className="bg-blue-600 text-white rounded-full px-3 py-1 text-sm">
                  {stationJobs.length}
                </span>

              </div>

              <div className="space-y-4">

                {stationJobs.length === 0 ? (

                  <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-400">
                    İş bulunmuyor
                  </div>

                ) : (

                  stationJobs.map((job) => {

                    const step =
                      currentStep(job);

                    return (

                      <ProductionCard
  key={job.id}
  job={{
    id: job.id,
    jobNo: job.jobNo,
    title: job.title,

    priority: job.priority,

    width: job.width,
    height: job.height,
    quantity: job.quantity,

    deliveryDate: job.deliveryDate,

    customer: job.customer,

    productionSteps: job.productionSteps,
  }}
/>

                    );

                  })

                )}

              </div>

            </div>

          );

        })}

      </div>
            <div className="mt-10 bg-white rounded-2xl shadow p-6">

        <h2 className="text-2xl font-bold mb-4">
          Üretim Özeti
        </h2>

        <div className="grid grid-cols-4 gap-6">

          <div className="bg-blue-50 rounded-xl p-5">

            <div className="text-gray-500">
              Toplam İş
            </div>

            <div className="text-3xl font-bold mt-2">
              {jobs.length}
            </div>

          </div>

          <div className="bg-red-50 rounded-xl p-5">

            <div className="text-gray-500">
              Acil İş
            </div>

            <div className="text-3xl font-bold mt-2">
              {
                jobs.filter(
                  (j) =>
                    j.priority ===
                    JobPriority.ACIL
                ).length
              }
            </div>

          </div>

          <div className="bg-orange-50 rounded-xl p-5">

            <div className="text-gray-500">
              Devam Eden
            </div>

            <div className="text-3xl font-bold mt-2">
              {
                jobs.filter((job) => {
                  const step =
                    currentStep(job);

                  return (
                    step &&
                    step.status !==
                      ProductionStepStatus.TAMAMLANDI
                  );
                }).length
              }
            </div>

          </div>

          <div className="bg-green-50 rounded-xl p-5">

            <div className="text-gray-500">
              Tamamlanan
            </div>

            <div className="text-3xl font-bold mt-2">
              {
                jobs.filter((job) => {
                  const step =
                    currentStep(job);

                  return (
                    step &&
                    step.status ===
                      ProductionStepStatus.TAMAMLANDI
                  );
                }).length
              }
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}