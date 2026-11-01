"use client";

type Props = {
  job: {
    id: string;
    isArchived: boolean;
  };
};

export default function ActionButtons({
  job,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <h2 className="text-xl font-bold mb-6">
        İşlemler
      </h2>

      <div className="space-y-3">
        <button
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
        >
          Düzenle
        </button>

        <button
          className="w-full rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700"
        >
          Üretimi Başlat
        </button>

        <button
          className="w-full rounded-lg bg-yellow-500 px-4 py-3 text-white hover:bg-yellow-600"
        >
          Arşivle
        </button>

        <button
          className="w-full rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700"
        >
          Sil
        </button>
      </div>

      <div className="mt-6 rounded-lg bg-gray-100 p-4 text-sm">
        <div>
          <strong>İş ID:</strong> {job.id}
        </div>

        <div className="mt-2">
          <strong>Durum:</strong>{" "}
          {job.isArchived ? "Arşivde" : "Aktif"}
        </div>
      </div>
    </div>
  );
}