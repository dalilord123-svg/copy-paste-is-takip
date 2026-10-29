"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  jobId: string;
};

export default function ArchiveJobButton({
  jobId,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function archiveJob() {
    const ok = confirm(
      "Bu işi arşivlemek istediğinize emin misiniz?\n\nİş silinmeyecek, sadece arşive taşınacaktır."
    );

    if (!ok) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/jobs/${jobId}/archive`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      alert("İş arşivlendi.");

      router.push("/jobs");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert("İş arşivlenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={archiveJob}
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg"
    >
      {loading
        ? "Arşivleniyor..."
        : "İşi Arşivle"}
    </button>
  );
}