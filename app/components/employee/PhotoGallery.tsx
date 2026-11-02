"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Photo = {
  id: string;
  filePath: string;
  originalName: string;
  uploadedAt: Date | string;
};

type Props = {
  photos: Photo[];
};

export default function PhotoGallery({
  photos,
}: Props) {
  const router = useRouter();

  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function deletePhoto(id: string) {
    if (!confirm("Fotoğraf silinsin mi?")) return;

    setLoading(true);

    const res = await fetch(`/api/photos/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow p-5 mt-6">
        <h2 className="text-xl font-bold mb-4">
          Fotoğraflar ({photos.length})
        </h2>

        {photos.length === 0 ? (
          <div className="text-gray-500">
            Henüz fotoğraf yüklenmedi.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="border rounded-xl overflow-hidden shadow-sm"
              >
                <img
                  src={photo.filePath}
                  alt={photo.originalName}
                  className="w-full h-40 object-cover cursor-pointer hover:opacity-90"
                  onClick={() => setSelected(photo.filePath)}
                />

                <div className="p-3">
                  <div className="text-xs truncate">
                    {photo.originalName}
                  </div>

                  <button
                    disabled={loading}
                    onClick={() => deletePhoto(photo.id)}
                    className="mt-3 w-full rounded-lg bg-red-600 hover:bg-red-700 text-white py-2"
                  >
                    🗑 Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <img
            src={selected}
            className="max-h-[90vh] max-w-[90vw] rounded-xl"
          />
        </div>
      )}
    </>
  );
}