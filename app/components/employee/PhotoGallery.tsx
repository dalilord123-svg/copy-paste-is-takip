
"use client";

type JobPhoto = {
  id: string;
  originalName: string;
  filePath: string;
  fileType: string;
  uploadedAt: Date | string;
};

type Props = {
  photos: JobPhoto[];
};

export default function PhotoGallery({ photos }: Props) {
  if (!photos || photos.length === 0) {
    return (
      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-gray-900">
          📷 İş Fotoğrafları
        </h2>

        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <div className="mb-2 text-4xl">🖼️</div>
          <p className="font-medium text-gray-700">
            Henüz fotoğraf yüklenmemiş.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Yüklenen fotoğraflar burada görüntülenecek.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          📷 İş Fotoğrafları
        </h2>

        <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          {photos.length} Fotoğraf
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <a
            key={photo.id}
            href={photo.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            title={photo.originalName}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={photo.filePath}
                alt={photo.originalName}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="p-2">
              <p className="truncate text-xs font-medium text-gray-700">
                {photo.originalName}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {new Date(photo.uploadedAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
