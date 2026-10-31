import JobStatusBadge from "@/app/components/jobs/JobStatusBadge";
import {
  JobPriority,
  ProductionStep,
} from "@prisma/client";

import PriorityBadge from "./PriorityBadge";
import ProgressBar from "./ProgressBar";
import DeliveryBadge from "./DeliveryBadge";

type Props = {
  job: {
    id: string;
    jobNo: string;
    title: string;

    priority: JobPriority;

    width: number | null;
    height: number | null;
    quantity: number | null;

    deliveryDate: Date | null;

    customer: {
      company: string;
    };

    productionSteps: (ProductionStep & {
      station: {
        name: string;
      };
      employee: {
        name: string;
      } | null;
    })[];
  };
};

export default function ProductionCard({
  job,
}: Props) {
  const total = job.productionSteps.length;

  const completed = job.productionSteps.filter(
    (x) => x.status === "TAMAMLANDI"
  ).length;

  const progress =
    total === 0
      ? 0
      : Math.round((completed * 100) / total);

  const current =
    job.productionSteps.find(
      (x) => x.status !== "TAMAMLANDI"
    ) ??
    job.productionSteps.at(-1);

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition p-5">

      <div className="flex justify-between items-start">

        <div>

          <div className="text-xs text-gray-500">
            {job.jobNo}
          </div>

          <h3 className="font-bold text-lg mt-1">
            {job.title}
          </h3>

          <div className="text-sm text-gray-500 mt-1">
            {job.customer.company}
          </div>

        </div>

        <PriorityBadge priority={job.priority} />

      </div>

      <div className="mt-5">
        <ProgressBar value={progress} />
      </div>

      <div className="mt-5 flex justify-between items-center">

        <div>

          <div className="text-xs text-gray-500">
            Mevcut İstasyon
          </div>

          <div className="font-semibold">

            {current
              ? current.station.name
              : "-"}

          </div>

        </div>

        <DeliveryBadge
          deliveryDate={job.deliveryDate}
        />

      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">

        <div className="rounded-lg bg-gray-100 p-3">

          <div className="text-xs text-gray-500">
            Ölçü
          </div>

          <div className="font-semibold">

            {job.width && job.height
              ? `${job.width} × ${job.height}`
              : "-"}

          </div>

        </div>

        <div className="rounded-lg bg-gray-100 p-3">

          <div className="text-xs text-gray-500">
            Adet
          </div>

          <div className="font-semibold">
            {job.quantity ?? "-"}
          </div>

        </div>

      </div>

      <button className="w-full mt-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3 transition">

        ▶ Sonraki Aşama

      </button>

      <div className="mt-6 border-t pt-4 space-y-3">

        <div className="flex justify-between items-center">

          <span className="text-sm text-gray-500">
            Durum
          </span>

          <JobStatusBadge
            status={
              current?.status ?? "BEKLIYOR"
            }
          />

        </div>

        <div className="flex justify-between items-center">

          <span className="text-sm text-gray-500">
            Personel
          </span>

          <span className="font-medium">

            {current?.employee?.name ?? "-"}

          </span>

        </div>

      </div>

    </div>
  );
}