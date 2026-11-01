type Props = {
  job: any;
};

const statusColor = {
  BEKLIYOR:
    "bg-gray-100 text-gray-600 border-gray-300",
  DEVAM_EDIYOR:
    "bg-blue-100 text-blue-700 border-blue-500",
  TAMAMLANDI:
    "bg-green-100 text-green-700 border-green-500",
  BEKLEMEDE:
    "bg-yellow-100 text-yellow-700 border-yellow-500",
  IPTAL:
    "bg-red-100 text-red-700 border-red-500",
};

const statusIcon = {
  BEKLIYOR: "⚪",
  DEVAM_EDIYOR: "🟢",
  TAMAMLANDI: "✅",
  BEKLEMEDE: "🟡",
  IPTAL: "🔴",
};

export default function ProductionTimeline({
  job,
}: Props) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold">
          Üretim Süreci
        </h2>

        <div className="text-sm text-gray-500">
          {job.productionSteps.length} Adım
        </div>
      </div>

      <div className="space-y-6">
        {job.productionSteps.map(
          (
            step: any,
            index: number
          ) => (
            <div
              key={step.id}
              className="relative"
            >
              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl ${
                      statusColor[
                        step.status as keyof typeof statusColor
                      ]
                    }`}
                  >
                    {
                      statusIcon[
                        step.status as keyof typeof statusIcon
                      ]
                    }
                  </div>

                  {index !==
                    job.productionSteps.length - 1 && (
                    <div className="w-1 flex-1 bg-gray-300 min-h-16 mt-2 rounded-full" />
                  )}
                </div>

                <div className="flex-1 border rounded-xl p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">
                        {step.station.name}
                      </h3>

                      <p className="text-gray-500 mt-1">
                        {step.employee
                          ? step.employee.name
                          : "Personel Atanmadı"}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        statusColor[
                          step.status as keyof typeof statusColor
                        ]
                      }`}
                    >
                      {step.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span>İlerleme</span>
                      <span>%{step.progress}</span>
                    </div>

                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all duration-500"
                        style={{
                          width: `${step.progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div>
                      <div className="text-sm text-gray-500">
                        Fotoğraf
                      </div>
                      <div className="font-semibold">
                        {step.photoCount}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">
                        Dosya
                      </div>
                      <div className="font-semibold">
                        {step.fileCount}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">
                        Not
                      </div>
                      <div className="font-semibold">
                        {step.noteCount}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">
                        Süre
                      </div>
                      <div className="font-semibold">
                        {step.actualMinutes
                          ? `${step.actualMinutes} dk`
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {step.status === "BEKLIYOR" && (
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                      >
                        ▶ Başlat
                      </button>
                    )}

                    {step.status === "DEVAM_EDIYOR" && (
                      <>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                        >
                          ✓ Tamamla
                        </button>

                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition"
                        >
                          ⏸ Beklemeye Al
                        </button>
                      </>
                    )}

                    {step.status === "BEKLEMEDE" && (
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
                      >
                        ▶ Devam Et
                      </button>
                    )}

                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-black text-white font-semibold transition"
                    >
                      👤 Personel Ata
                    </button>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
                    >
                      📷 Fotoğraf
                    </button>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition"
                    >
                      📎 Dosya
                    </button>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-semibold transition"
                    >
                      📝 Not
                    </button>
                  </div>

                  {step.waitingNote && (
                    <div className="mt-5 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                      <div className="mb-1 font-semibold text-yellow-700">
                        Bekleme Nedeni
                      </div>

                      <div className="text-sm text-yellow-800">
                        {step.waitingReason}
                      </div>

                      <div className="mt-2 text-sm">
                        {step.waitingNote}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 border-t pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">
                        Başlangıç
                      </div>
                      <div className="font-semibold">
                        {formatDate(step.startedAt)}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Bitiş
                      </div>
                      <div className="font-semibold">
                        {formatDate(step.finishedAt)}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Toplam Süre
                      </div>
                      <div className="font-semibold">
                        {calculateDuration(
                          step.startedAt,
                          step.finishedAt
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500">
                        Sıra
                      </div>
                      <div className="font-semibold">
                        {step.stepOrder}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function formatDate(
  date: Date | string | null | undefined
) {
  if (!date) return "-";
  return new Date(date).toLocaleString("tr-TR");
}

function calculateDuration(
  start?: Date | string | null,
  finish?: Date | string | null
) {
  if (!start || !finish) {
    return "-";
  }

  const diff =
    new Date(finish).getTime() -
    new Date(start).getTime();

  const minutes = Math.floor(diff / 1000 / 60);

  if (minutes < 60) {
    return `${minutes} dk`;
  }

  const hour = Math.floor(minutes / 60);
  const min = minutes % 60;

  return `${hour} sa ${min} dk`;
}