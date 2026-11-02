"use client";

import { useRef, useState } from "react";

type Props = {
  jobId: string;
  employeeId?: string | null;
  onUploaded?: () => void;
};

export default function PhotoUpload({
  jobId,
  employeeId,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string>();

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  async function upload(file: File) {
    setLoading(true);
    setMessage("");

    const formData = new FormData();

    formData.append("file", file);
    formData.append("jobId", jobId);

    if (employeeId) {
      formData.append("employeeId", employeeId);
    }

    try {
      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || "Yükleme başarısız.");
        return;
      }

      setMessage("✅ Fotoğraf başarıyla yüklendi.");

      setPreview(undefined);

      inputRef.current!.value = "";

      onUploaded?.();
    } catch {
      setMessage("Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  }

  function choose(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));

    upload(file);
  }

  return (
    <div className="bg-white rounded-xl shadow p-5">

      <h2 className="text-xl font-bold mb-4">
        Fotoğraf
      </h2>

      {preview && (
        <img
          src={preview}
          alt=""
          className="rounded-lg mb-4 w-full max-h-72 object-cover"
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={choose}
        className="hidden"
      />

      <button
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-4 font-bold transition"
      >
        {loading ? "Yükleniyor..." : "📷 Fotoğraf Çek / Seç"}
      </button>

      {message && (
        <div className="mt-4 rounded-lg bg-gray-100 p-3 text-center">
          {message}
        </div>
      )}

    </div>
  );
}