"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statuses = [
  "BEKLIYOR",
  "TASARIM",
  "BASKI",
  "KESIM",
  "MONTAJ",
  "TAMAMLANDI",
  "TESLIM",
];

type Props = {
  jobId: string;
  currentStatus: string;
};

export default function StatusSelect({
  jobId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function saveStatus() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/jobs/${jobId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      alert("Durum güncellendi.");

      router.refresh();
    } catch {
      alert("Durum güncellenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-xl p-6 bg-white">

      <h2 className="text-xl font-bold mb-4">
        İş Durumu
      </h2>

      <div className="flex gap-4">

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg p-3 flex-1"
        >
          {statuses.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <button
          onClick={saveStatus}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg disabled:bg-gray-400"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>

      </div>

    </div>
  );
}