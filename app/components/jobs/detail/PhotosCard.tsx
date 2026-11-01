"use client";

import { useRef, useState } from "react";

type JobPhoto = {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string | Date;
};

type Props = {
  jobId: string;
  photos: JobPhoto[];
};

export default function PhotosCard({ jobId, photos: initialPhotos }: Props) {
  const [photos, setPhotos] = useState<JobPhoto[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<JobPhoto | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadPhotos(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("jobId", jobId);

      Array.from(selectedFiles).forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error ?? "Fotoğraf yüklenemedi.");
        return;
      }

      setPhotos(result.data);
    } catch (error) {
      console.error(error);
      alert("Fotoğraf yüklenemedi.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function openDialog() {
    inputRef.current?.click();
  }

  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">📷 Fotoğraflar</h2>

        <button
          onClick={openDialog}
          disabled={uploading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
        >
          {uploading ? "Yükleniyor..." : "Fotoğraf Yükle"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept="image/*"
        capture="environment"
        onChange={(e) => uploadPhotos(e.target.files)}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadPhotos(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
          dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
        }`}
      >
        <p className="font-semibold text-lg">Fotoğrafları buraya bırakın</p>
        <p className="text-gray-500 mt-2">veya yukarıdaki butonu kullanın.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
        {photos.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            Henüz fotoğraf yüklenmemiş.
          </div>
        )}

        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group overflow-hidden rounded-xl border bg-gray-100"
          >
            <img
              src={photo.filePath}
              alt={photo.fileName}
              className="w-full h-40 object-cover cursor-pointer transition group-hover:scale-105"
              onClick={() => setPreviewPhoto(photo)}
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-2">
              <button
                onClick={() => setPreviewPhoto(photo)}
                className="bg-white text-black text-sm px-3 py-1 rounded"
              >
                Gör
              </button>

              <button
                onClick={async () => {
                  if (!confirm("Fotoğraf silinsin mi?")) return;

                  const response = await fetch(`/api/photos/${photo.id}`, {
                    method: "DELETE",
                  });

                  if (!response.ok) {
                    alert("Fotoğraf silinemedi.");
                    return;
                  }

                  setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
                }}
                className="bg-red-600 text-white text-sm px-3 py-1 rounded"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={() => setPreviewPhoto(null)}
        >
          <img
            src={previewPhoto.filePath}
            alt={previewPhoto.fileName}
            className="max-h-full max-w-full rounded-xl shadow-2xl"
          />
        </div>
      )}

      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Montaj Fotoğrafları</h3>
            <p className="text-sm text-gray-500 mt-1">
              Montaj tamamlanmadan önce en az <strong>2 fotoğraf</strong> yüklenmelidir.
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded-lg font-semibold ${
              photos.length >= 2 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {photos.length} / 2
          </div>
        </div>

        {photos.length < 2 ? (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4">
            <div className="font-semibold text-red-700">⚠️ Montaj tamamlanamaz</div>
            <div className="text-sm text-red-600 mt-1">
              Sistemde en az iki montaj fotoğrafı bulunmalıdır.
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-green-300 bg-green-50 p-4">
            <div className="font-semibold text-green-700">✅ Fotoğraf şartı tamamlandı</div>
            <div className="text-sm text-green-600 mt-1">
              Bu iş için gerekli minimum fotoğraf sayısına ulaşıldı.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}