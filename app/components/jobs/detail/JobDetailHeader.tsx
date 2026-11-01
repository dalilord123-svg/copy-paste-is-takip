import Link from "next/link";

type Props = {
  job: any;
};

export default function JobDetailHeader({
  job,
}: Props) {

  const priorityColor = {
    DUSUK: "bg-gray-200 text-gray-700",
    NORMAL: "bg-blue-100 text-blue-700",
    YUKSEK: "bg-orange-100 text-orange-700",
    ACIL: "bg-red-100 text-red-700",
  };

  const activeStep = job.productionSteps.find(
    (x: any) => x.status === "DEVAM_EDIYOR"
  );

  return (

    <div className="bg-white rounded-xl border shadow-sm p-8">

      <div className="flex flex-col lg:flex-row justify-between gap-8">

        <div>

          <div className="text-gray-500 text-sm">

            İş No

          </div>

          <h1 className="text-4xl font-bold mt-2">

            {job.jobNo}

          </h1>

          <h2 className="text-2xl font-semibold mt-4">

            {job.title}

          </h2>

          {job.description && (

            <p className="text-gray-600 mt-3">

              {job.description}

            </p>

          )}

          <div className="flex flex-wrap gap-3 mt-6">

            <span className="px-4 py-2 rounded-lg bg-slate-100">

              👤 {job.customer.company}

            </span>

            <span
              className={`px-4 py-2 rounded-lg font-semibold ${
                priorityColor[
                  job.priority as keyof typeof priorityColor
                ]
              }`}
            >
              {job.priority}
            </span>

            {activeStep && (

              <span className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold">

                🟢 {activeStep.station.name}

              </span>

            )}

          </div>

        </div>

        <div className="flex flex-col gap-3 min-w-[220px]">          <div className="bg-slate-50 rounded-xl p-5 border">

            <div className="text-sm text-gray-500 mb-1">
              Oluşturulma
            </div>

            <div className="font-semibold">
              {new Date(
                job.createdAt
              ).toLocaleDateString("tr-TR")}
            </div>

          </div>

          <div className="bg-slate-50 rounded-xl p-5 border">

            <div className="text-sm text-gray-500 mb-1">
              Teslim Tarihi
            </div>

            <div className="font-semibold">
              {job.deliveryDate
                ? new Date(
                    job.deliveryDate
                  ).toLocaleDateString("tr-TR")
                : "-"}
            </div>

          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">

            <Link
              href={`/jobs/${job.id}/edit`}
              className="text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition"
            >
              Düzenle
            </Link>

            <button
              type="button"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 font-semibold transition"
            >
              Arşivle
            </button>

            <button
              type="button"
              className="bg-gray-700 hover:bg-black text-white rounded-lg py-3 font-semibold transition"
            >
              Yazdır
            </button>

            <button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold transition"
            >
              PDF
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}