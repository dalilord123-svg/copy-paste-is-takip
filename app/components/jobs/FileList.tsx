"use client";

import { useRouter } from "next/navigation";

type JobFile = {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
};

type Props = {
  files: JobFile[];
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;

  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function getIcon(file: JobFile) {
  const ext = file.originalName
    .split(".")
    .pop()
    ?.toLowerCase();

  if (ext === "pdf") return "📄";
  if (ext === "cdr") return "🎨";
  if (ext === "ai") return "🟠";
  if (ext === "eps") return "🟠";
  if (ext === "zip") return "🗜️";

  if (
    ext === "jpg" ||
    ext === "jpeg" ||
    ext === "png" ||
    ext === "gif" ||
    ext === "webp"
  )
    return "🖼️";

  return "📁";
}

export default function FileList({
  files,
}: Props) {
  const router = useRouter();

  async function deleteFile(id: string) {
    const ok = confirm(
      "Bu dosya silinsin mi?"
    );

    if (!ok) return;

    try {
      const res = await fetch(
        `/api/files/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      alert("Dosya silindi.");

      router.refresh();
    } catch {
      alert("Dosya silinemedi.");
    }
  }

  if (files.length === 0) {
    return (
      <div className="border rounded-xl p-8 text-center text-gray-500">
        Henüz dosya yüklenmedi.
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {files.map((file) => (

        <div
          key={file.id}
          className="flex items-center justify-between border rounded-xl p-4 hover:bg-gray-50"
        >

          <div className="flex items-center gap-4">

            <div className="text-3xl">
              {getIcon(file)}
            </div>

            <div>

              <div className="font-semibold">
                {file.originalName}
              </div>

              <div className="text-sm text-gray-500">
                {formatFileSize(file.fileSize)}
              </div>

            </div>

          </div>

          <div className="flex gap-3">

            <a
              href={`/api/files/${file.id}`}
              target="_blank"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              İndir
            </a>

            <button
              onClick={() => deleteFile(file.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Sil
            </button>

          </div>

        </div>

      ))}

    </div>
  );
}