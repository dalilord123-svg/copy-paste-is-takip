"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  jobId: string;
};

export default function RestoreJobButton({
  jobId,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function restoreJob() {
    const ok = confirm(
      "Bu işi tekrar aktif işlere taşımak istiyor musunuz?"
    );

    if (!ok) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/jobs/${jobId}/restore`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      alert("İş aktif işlere taşındı.");

      router.push("/jobs");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert("İş geri alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={restoreJob}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg"
    >
      {loading
        ? "Geri Alınıyor..."
        : "Arşivden Geri Al"}
    </button>
  );
}