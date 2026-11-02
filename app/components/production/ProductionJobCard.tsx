"use client";

type Props = {
  job: any;
};

const priorityColor = {
  DUSUK: "bg-gray-100 text-gray-700",
  NORMAL: "bg-blue-100 text-blue-700",
  YUKSEK: "bg-orange-100 text-orange-700",
  ACIL: "bg-red-100 text-red-700",
};

const statusColor = {
  BEKLIYOR: "bg-gray-100 text-gray-700",
  HAZIR: "bg-cyan-100 text-cyan-700",
  DEVAM_EDIYOR: "bg-green-100 text-green-700",
  BEKLEMEDE: "bg-yellow-100 text-yellow-700",
  TAMAMLANDI: "bg-emerald-100 text-emerald-700",
  IPTAL: "bg-red-100 text-red-700",
};

export default function ProductionJobCard({ job }: Props) {
  const activeStep = job.productionSteps.find(
    (x: any) => x.status === "DEVAM_EDIYOR"
  );

  const nextStep =
    activeStep ??
    job.productionSteps.find((x: any) => x.status === "BEKLIYOR");

  const completed = job.productionSteps.filter(
    (x: any) => x.status === "TAMAMLANDI"
  ).length;

  const progress =
    job.productionSteps.length === 0
      ? 0
      : Math.round((completed / job.productionSteps.length) * 100);

  async function startStep() {
    if (!nextStep) {
      alert("Başlatılacak üretim adımı bulunamadı.");
      return;
    }

    try {
      const response = await fetch("/api/production-steps/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stepId: nextStep.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error ?? "Üretim başlatılamadı.");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Sunucu hatası oluştu.");
    }
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition p-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-500">
            {job.jobNo}
          </div>

          <h3 className="text-xl font-bold mt-1">
            {job.title}
          </h3>

          <div className="text-gray-500 mt-2">
            👤 {job.customer.company}
          </div>
        </div>

        <span
          className={`px-3 py-2 rounded-lg font-semibold ${
            priorityColor[
              job.priority as keyof typeof priorityColor
            ]
          }`}
        >
          {job.priority}
        </span>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span>İlerleme</span>
          <span>%{progress}</span>
        </div>

        <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-green-600 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <div className="text-gray-500 text-sm">
            İstasyon
          </div>

          <div className="font-semibold mt-1">
            {nextStep
              ? nextStep.station.name
              : "Tamamlandı"}
          </div>
        </div>

        <div>
          <div className="text-gray-500 text-sm">
            Personel
          </div>

          <div className="font-semibold mt-1">
            {nextStep?.employee?.name ?? "-"}
          </div>
        </div>

        <div>
          <div className="text-gray-500 text-sm">
            Teslim
          </div>

          <div className="font-semibold mt-1">
            {job.deliveryDate
              ? new Date(job.deliveryDate).toLocaleDateString("tr-TR")
              : "-"}
          </div>
        </div>

        <div>
          <div className="text-gray-500 text-sm">
            Durum
          </div>

          <div
            className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
              statusColor[
                (nextStep?.status ??
                  "TAMAMLANDI") as keyof typeof statusColor
              ]
            }`}
          >
            {nextStep
              ? nextStep.status.replaceAll("_", " ")
              : "TAMAMLANDI"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={startStep}
          disabled={!nextStep}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 font-semibold transition"
        >
          ▶ Başlat
        </button>

        <button className="rounded-lg bg-green-600 hover:bg-green-700 text-white py-2 font-semibold">
          ✓ Tamamla
        </button>

        <button className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white py-2 font-semibold">
          📷 Fotoğraf
        </button>

        <button className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white py-2 font-semibold">
          📎 Dosya
        </button>

        <button className="rounded-lg bg-slate-600 hover:bg-slate-700 text-white py-2 font-semibold">
          📝 Not
        </button>

        <button className="rounded-lg bg-gray-700 hover:bg-black text-white py-2 font-semibold">
          👤 Personel
        </button>
      </div>
    </div>
  );
}