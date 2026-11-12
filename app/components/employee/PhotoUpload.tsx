"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  jobId: string;
  productionStepId?: string;
};

export default function PhotoUpload({
  jobId,
  productionStepId,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function uploadPhoto(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!productionStepId) {
      setError("Fotoğraf yüklemek için aktif üretim aşaması bulunamadı.");
      return;
    }

    const file = inputRef.current?.files?.[0];

    if (!file) {
      setError("Lütfen bir fotoğraf seçin.");
      return;
    }

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("productionStepId", productionStepId);
    formData.append("photo", file);

    setLoading(true);

    try {
      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Fotoğraf yüklenemedi.");
        return;
      }

      setMessage("Fotoğraf başarıyla yüklendi.");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      router.refresh();
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h2 className="text-xl font-bold mb-4">
        📷 Fotoğraf Yükle
      </h2>

      {!productionStepId ? (
        <p className="text-orange-600">
          Fotoğraf yüklemek için aktif üretim aşaması bulunamadı.
        </p>
      ) : (
        <form onSubmit={uploadPhoto} className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="block w-full border rounded-lg p-3"
            disabled={loading}
          />

          <p className="text-sm text-gray-500">
            JPG, PNG veya WEBP. En fazla 10 MB.
          </p>

          {error && (
            <p className="bg-red-100 text-red-700 rounded-lg p-3">
              {error}
            </p>
          )}

          {message && (
            <p className="bg-green-100 text-green-700 rounded-lg p-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 font-bold"
          >
            {loading ? "Yükleniyor..." : "📤 Fotoğrafı Yükle"}
          </button>
        </form>
      )}
    </div>
  );
}