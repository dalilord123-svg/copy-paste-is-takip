"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  jobId: string;
};

export default function FileUpload({ jobId }: Props) {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);

  async function uploadFile(file: File) {
    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const res = await fetch(
        `/api/jobs/${jobId}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      alert("Dosya başarıyla yüklendi.");

      router.refresh();
    } catch (err) {
      console.error(err);

      alert("Dosya yüklenemedi.");
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    uploadFile(file);
  }

  return (
    <div>

      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={handleChange}
        accept=".pdf,.cdr,.jpg,.jpeg,.png,.ai,.eps,.zip"
      />

      <button
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg"
      >
        {uploading
          ? "Yükleniyor..."
          : "+ Dosya Yükle"}
      </button>

    </div>
  );
}