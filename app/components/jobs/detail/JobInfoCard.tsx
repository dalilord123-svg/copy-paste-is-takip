
type Props = {
  job: any;
};

export default function JobInfoCard({
  job,
}: Props) {

  const totalArea =
    job.width && job.height
      ? (
          (job.width * job.height) /
          10000
        ).toFixed(2)
      : "-";

  const completedSteps =
    job.productionSteps.filter(
      (x: any) =>
        x.status === "TAMAMLANDI"
    ).length;

  const totalSteps =
    job.productionSteps.length;

  const progress =
    totalSteps === 0
      ? 0
      : Math.round(
          (completedSteps /
            totalSteps) *
            100
        );

  const activeStep =
    job.productionSteps.find(
      (x: any) =>
        x.status ===
        "DEVAM_EDIYOR"
    );

  return (

    <div className="bg-white rounded-xl border shadow-sm p-6">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold">

          İş Bilgileri

        </h2>

        <div className="text-blue-600 font-bold">

          %{progress}

        </div>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

        <InfoItem
          title="En"
          value={
            job.width
              ? `${job.width} cm`
              : "-"
          }
        />

        <InfoItem
          title="Boy"
          value={
            job.height
              ? `${job.height} cm`
              : "-"
          }
        />

        <InfoItem
          title="Alan"
          value={`${totalArea} m²`}
        />

        <InfoItem
          title="Adet"
          value={
            job.quantity ?? "-"
          }
        />

        <InfoItem
          title="Malzeme"
          value={
            job.material ?? "-"
          }
        />

        <InfoItem
          title="Makine"
          value={
            job.machine ?? "-"
          }
        />        <InfoItem
          title="Aktif İstasyon"
          value={
            activeStep
              ? activeStep.station.name
              : "Tamamlandı"
          }
        />

        <InfoItem
          title="Tamamlanan Adım"
          value={`${completedSteps} / ${totalSteps}`}
        />

        <InfoItem
          title="Kalan Adım"
          value={String(totalSteps - completedSteps)}
        />

        <InfoItem
          title="Teslim Tarihi"
          value={
            job.deliveryDate
              ? new Date(
                  job.deliveryDate
                ).toLocaleDateString("tr-TR")
              : "-"
          }
        />

        <InfoItem
          title="Öncelik"
          value={job.priority}
        />

        <InfoItem
          title="Müşteri"
          value={job.customer.company}
        />

      </div>

      <div className="mt-8">

        <div className="flex justify-between text-sm mb-2">

          <span>Üretim İlerlemesi</span>

          <span>%{progress}</span>

        </div>

        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

          <div
            className="h-full bg-green-600 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

    </div>

  );

}

type InfoItemProps = {
  title: string;
  value: string | number;
};

function InfoItem({
  title,
  value,
}: InfoItemProps) {

  return (

    <div className="border rounded-xl p-4 bg-gray-50">

      <div className="text-sm text-gray-500 mb-1">

        {title}

      </div>

      <div className="font-semibold text-lg break-words">

        {value}

      </div>

    </div>

  );

}