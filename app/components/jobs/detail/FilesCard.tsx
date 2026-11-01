"use client";

import { useRef, useState } from "react";

type JobFile = {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string | Date;
  category: string;
};

type Props = {
  jobId: string;
  files: JobFile[];
};

export default function FilesCard({
  jobId,
  files: initialFiles,
}: Props) {
  const [files, setFiles] =
    useState(initialFiles);

  const [uploading, setUploading] =
    useState(false);

  const [dragging, setDragging] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  async function uploadFiles(
    selectedFiles: FileList | null
  ) {
    if (!selectedFiles) return;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("jobId", jobId);

      Array.from(selectedFiles).forEach(
        (file) => {
          formData.append("files", file);
        }
      );

      const response = await fetch(
        "/api/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.error ??
            "Dosya yüklenemedi."
        );
        return;
      }

      setFiles(result.data);

    } catch (error) {

      console.error(error);

      alert("Dosya yüklenemedi.");

    } finally {

      setUploading(false);

    }
  }

  function openFileDialog() {
    fileInputRef.current?.click();
  }

  function formatFileSize(
    bytes: number
  ) {
    if (bytes < 1024)
      return `${bytes} B`;

    if (bytes < 1024 * 1024)
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;

    if (bytes < 1024 * 1024 * 1024)
      return `${(
        bytes /
        1024 /
        1024
      ).toFixed(1)} MB`;

    return `${(
      bytes /
      1024 /
      1024 /
      1024
    ).toFixed(1)} GB`;
  }

  return (

    <div className="bg-white rounded-xl shadow-sm border p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-bold">

          📁 Dosyalar

        </h2>

        <button
          onClick={openFileDialog}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
        >
          {uploading
            ? "Yükleniyor..."
            : "Dosya Yükle"}
        </button>

      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(e) =>
          uploadFiles(
            e.target.files
          )
        }
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() =>
          setDragging(false)
        }
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadFiles(
            e.dataTransfer.files
          );
        }}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300"
        }`}
      >

        <p className="text-lg font-semibold">

          Dosyaları buraya sürükleyin

        </p>

        <p className="text-gray-500 mt-2">

          veya yukarıdaki butondan seçin.

        </p>

      </div>      <div className="mt-8 space-y-3">

        {files.length === 0 && (

          <div className="text-center py-10 text-gray-500">

            Henüz dosya yüklenmemiş.

          </div>

        )}

        {files.map((file) => {

          const ext =
            file.originalName
              .split(".")
              .pop()
              ?.toLowerCase() ?? "";

          let icon = "📄";

          switch (ext) {
            case "pdf":
              icon = "📕";
              break;

            case "cdr":
              icon = "🎨";
              break;

            case "ai":
              icon = "🟠";
              break;

            case "eps":
              icon = "🖌";
              break;

            case "svg":
              icon = "📐";
              break;

            case "png":
            case "jpg":
            case "jpeg":
            case "webp":
              icon = "🖼";
              break;

            case "zip":
            case "rar":
              icon = "🗜";
              break;
          }

          return (

            <div
              key={file.id}
              className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition"
            >

              <div className="flex items-center gap-4">

                <div className="text-3xl">

                  {icon}

                </div>

                <div>

                  <div className="font-semibold">

                    {file.originalName}

                  </div>

                  <div className="text-sm text-gray-500 mt-1">

                    {formatFileSize(
                      file.fileSize
                    )}

                    {" • "}

                    {new Date(
                      file.uploadedAt
                    ).toLocaleString("tr-TR")}

                  </div>

                </div>

              </div>

              <div className="flex gap-2">

                <a
                  href={file.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
                >
                  İndir
                </a>

                <button
                  onClick={async () => {

                    if (
                      !confirm(
                        "Dosya silinsin mi?"
                      )
                    )
                      return;

                    const response =
                      await fetch(
                        `/api/files/${file.id}`,
                        {
                          method: "DELETE",
                        }
                      );

                    if (!response.ok) {

                      alert(
                        "Dosya silinemedi."
                      );

                      return;

                    }

                    setFiles(
                      files.filter(
                        (f) =>
                          f.id !== file.id
                      )
                    );

                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                >
                  Sil
                </button>

              </div>

            </div>

          );

        })}

      </div>    </div>

  );

}