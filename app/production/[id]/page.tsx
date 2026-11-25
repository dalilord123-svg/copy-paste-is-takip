"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type JobPhoto = {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
};

type JobFile = {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
};

type JobNote = {
  id: string;
  note: string;
  createdAt: string;

  employee: {
    id: string;
    name: string;
  } | null;
};

type JobHistory = {
  id: string;
  action: string;
  description: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;

  employee: {
    id: string;
    name: string;
  } | null;
};

type Assignment = {
  id: string;

  employee: {
    id: string;
    name: string;
  };
};

type ProductionDetail = {
  id: string;

  status: string;

  progress: number;

  estimatedMinutes: number | null;

  actualMinutes: number | null;

  startedAt: string | null;

  finishedAt: string | null;

  requirePhotoCount: number;

  requireFile: boolean;

  requireNote: boolean;

  photoCount: number;

  fileCount: number;

  noteCount: number;

  photos: JobPhoto[];

  station: {
    id: string;
    name: string;
  };

  job: {
    id: string;

    jobNo: string;

    title: string;

    customer: {
      company: string;
    };

    files: JobFile[];

    notes: JobNote[];

    history: JobHistory[];
  };

  assignments: Assignment[];
};

export default function ProductionDetailPage() {
  const params = useParams();

  const [loading, setLoading] = useState(true);

  const [step, setStep] =
    useState<ProductionDetail | null>(null);

  const [note, setNote] = useState("");

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const [uploadingFile, setUploadingFile] =
    useState(false);

  const [savingNote, setSavingNote] =
    useState(false);

  const elapsedMinutes = useMemo(() => {
    if (!step?.startedAt) return 0;

    const started =
      new Date(step.startedAt).getTime();

    return Math.floor(
      (Date.now() - started) / 60000
    );
  }, [step]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/production/${params.id}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (data.success) {
        setStep(data.step);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function startProduction() {
    if (!step) return;

    try {
      const res = await fetch(
        "/api/production/start",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productionStepId: step.id,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      await load();

      alert("Üretim başlatıldı.");
    } catch (error) {
      console.error(error);

      alert("Başlatılamadı.");
    }
  }
    async function pauseProduction() {
    if (!step) return;

    const waitingNote = prompt(
      "Bekleme sebebini yazınız"
    );

    if (waitingNote === null) return;

    try {
      const res = await fetch(
        "/api/production/pause",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productionStepId: step.id,
            waitingReason: "DIGER",
            waitingNote,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      await load();

      alert("Üretim beklemeye alındı.");
    } catch (error) {
      console.error(error);

      alert("İşlem başarısız.");
    }
  }

  async function resumeProduction() {
    if (!step) return;

    try {
      const res = await fetch(
        "/api/production/resume",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productionStepId: step.id,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      await load();

      alert("Üretim devam ediyor.");
    } catch (error) {
      console.error(error);

      alert("Devam ettirilemedi.");
    }
  }

  async function completeProduction() {
    if (!step) return;

    if (
      !confirm(
        "Üretim adımı tamamlanacak. Emin misiniz?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/production/${step.id}/complete`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      await load();

      alert("Üretim tamamlandı.");
    } catch (error) {
      console.error(error);

      alert("Tamamlanamadı.");
    }
  }

  async function saveNote() {
    if (!step) return;

    if (!note.trim()) {
      alert("Not boş olamaz.");
      return;
    }

    try {
      setSavingNote(true);

      const res = await fetch(
        "/api/production/note",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productionStepId: step.id,
            note,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      setNote("");

      await load();
    } catch (error) {
      console.error(error);
    } finally {
      setSavingNote(false);
    }
  }
    async function uploadPhoto(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!step) return;

    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingPhoto(true);

      const formData = new FormData();

      formData.append("photo", file);
      formData.append(
        "productionStepId",
        step.id
      );

      const res = await fetch(
        "/api/production/photo",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      await load();
    } catch (error) {
      console.error(error);

      alert("Fotoğraf yüklenemedi.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function uploadFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!step) return;

    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingFile(true);

      const formData = new FormData();

      formData.append("file", file);
      formData.append(
        "productionStepId",
        step.id
      );

      const res = await fetch(
        "/api/production/file",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      await load();
    } catch (error) {
      console.error(error);

      alert("Dosya yüklenemedi.");
    } finally {
      setUploadingFile(false);
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        Yükleniyor...
      </main>
    );
  }

  if (!step) {
    return (
      <main className="p-8">
        Üretim adımı bulunamadı.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              {step.job.title}
            </h1>

            <div className="mt-1 text-gray-500">
              {step.job.customer.company}
            </div>

            <div className="text-sm text-gray-400">
              {step.job.jobNo}
            </div>

          </div>

          <div className="text-right">

            <div className="text-sm text-gray-500">
              Durum
            </div>

            <div className="text-xl font-bold">
              {step.status}
            </div>

          </div>

        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-4">

        <div className="rounded-xl border bg-white p-5">

          <div className="text-sm text-gray-500">
            İstasyon
          </div>

          <div className="mt-2 text-xl font-bold">
            {step.station.name}
          </div>

        </div>

        <div className="rounded-xl border bg-white p-5">

          <div className="text-sm text-gray-500">
            İlerleme
          </div>

          <div className="mt-2 text-2xl font-bold">
            %{step.progress}
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">

            <div
              className="h-full rounded-full bg-green-600 transition-all"
              style={{
                width: `${step.progress}%`,
              }}
            />

          </div>

        </div>

        <div className="rounded-xl border bg-white p-5">

          <div className="text-sm text-gray-500">
            Tahmini Süre
          </div>

          <div className="mt-2 text-2xl font-bold">
            {step.estimatedMinutes ?? "-"} dk
          </div>

        </div>

        <div className="rounded-xl border bg-white p-5">

          <div className="text-sm text-gray-500">
            Geçen Süre
          </div>

          <div className="mt-2 text-2xl font-bold">
            {elapsedMinutes} dk
          </div>

        </div>

      </div>

      <div className="rounded-xl border bg-white p-6">

        <h2 className="mb-4 text-xl font-bold">
          Personeller
        </h2>

        <div className="flex flex-wrap gap-2">

          {step.assignments.map((person) => (

            <span
              key={person.id}
              className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium"
            >
              {person.employee.name}
            </span>

          ))}

        </div>

      </div>

      <div className="rounded-xl border bg-white p-6">

        <h2 className="mb-4 text-xl font-bold">
          Kontroller
        </h2>

        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-lg border p-4">

            <div className="text-sm text-gray-500">
              Fotoğraf
            </div>

            <div className="mt-2 text-xl font-bold">
              {step.photoCount} / {step.requirePhotoCount}
            </div>

          </div>

          <div className="rounded-lg border p-4">

            <div className="text-sm text-gray-500">
              Dosya
            </div>

            <div className="mt-2 text-xl font-bold">
              {step.fileCount}
            </div>

          </div>

          <div className="rounded-lg border p-4">

            <div className="text-sm text-gray-500">
              Not
            </div>

            <div className="mt-2 text-xl font-bold">
              {step.noteCount}
            </div>

          </div>

        </div>

      </div>

      <div className="rounded-xl border bg-white p-6">

        <h2 className="mb-4 text-xl font-bold">
          İşlemler
        </h2>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={startProduction}
            disabled={
              step.status === "DEVAM_EDIYOR" ||
              step.status === "TAMAMLANDI"
            }
            className="rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            Üretimi Başlat
          </button>

          <button
            onClick={pauseProduction}
            disabled={step.status !== "DEVAM_EDIYOR"}
            className="rounded-lg bg-yellow-500 px-5 py-3 text-white hover:bg-yellow-600 disabled:bg-gray-400"
          >
            Beklemeye Al
          </button>

          <button
            onClick={resumeProduction}
            disabled={step.status !== "BEKLEMEDE"}
            className="rounded-lg bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700 disabled:bg-gray-400"
          >
            Devam Ettir
          </button>

          <button
            onClick={completeProduction}
            disabled={step.status === "TAMAMLANDI"}
            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            Üretimi Tamamla
          </button>

        </div>

      </div>
          <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border bg-white p-6">

          <h2 className="mb-4 text-xl font-bold">
            Fotoğraf Yükle
          </h2>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={uploadPhoto}
            disabled={uploadingPhoto}
            className="block w-full rounded-lg border p-3"
          />

          <p className="mt-3 text-sm text-gray-500">
            Mobil cihazlarda kamera otomatik açılır.
          </p>

        </div>

        <div className="rounded-xl border bg-white p-6">

          <h2 className="mb-4 text-xl font-bold">
            Dosya Yükle
          </h2>

          <input
            type="file"
            onChange={uploadFile}
            disabled={uploadingFile}
            className="block w-full rounded-lg border p-3"
          />

          <p className="mt-3 text-sm text-gray-500">
            PDF, AI, CDR, SVG, JPG ve diğer dosyalar.
          </p>

        </div>

      </div>

      <div className="rounded-xl border bg-white p-6">

        <h2 className="mb-4 text-xl font-bold">
          Not Ekle
        </h2>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Üretim ile ilgili not giriniz..."
          className="h-32 w-full rounded-lg border p-3"
        />

        <button
          onClick={saveNote}
          disabled={savingNote}
          className="mt-4 rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800 disabled:bg-gray-400"
        >
          Notu Kaydet
        </button>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border bg-white p-6">

          <h2 className="mb-4 text-xl font-bold">
            Yüklenen Fotoğraflar
          </h2>

          {step.photos.length === 0 ? (

            <div className="rounded-lg border border-dashed p-6 text-center text-gray-500">
              Henüz fotoğraf yüklenmedi.
            </div>

          ) : (

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

              {step.photos.map((photo) => (

                <a
                  key={photo.id}
                  href={photo.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-lg border hover:shadow-md"
                >
                  <img
                    src={photo.filePath}
                    alt={photo.originalName}
                    className="h-40 w-full object-cover"
                  />

                  <div className="truncate p-2 text-xs">
                    {photo.originalName}
                  </div>

                </a>

              ))}

            </div>

          )}

        </div>

        <div className="rounded-xl border bg-white p-6">

          <h2 className="mb-4 text-xl font-bold">
            Yüklenen Dosyalar
          </h2>

          {step.job.files.length === 0 ? (

            <div className="rounded-lg border border-dashed p-6 text-center text-gray-500">
              Henüz dosya yüklenmedi.
            </div>

          ) : (

            <div className="space-y-3">

              {step.job.files.map((file) => (

                <a
                  key={file.id}
                  href={file.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                >

                  <div>

                    <div className="font-medium">
                      {file.originalName}
                    </div>

                    <div className="text-sm text-gray-500">
                      {(file.fileSize / 1024).toFixed(1)} KB
                    </div>

                  </div>

                  <span className="text-blue-600">
                    Aç
                  </span>

                </a>

              ))}

            </div>

          )}

        </div>

      </div>

      <div className="rounded-xl border bg-white p-6">

        <h2 className="mb-4 text-xl font-bold">
          Notlar
        </h2>

        {step.job.notes.length === 0 ? (

          <div className="rounded-lg border border-dashed p-6 text-center text-gray-500">
            Henüz not eklenmedi.
          </div>

        ) : (

          <div className="space-y-3">

            {step.job.notes.map((item) => (

              <div
                key={item.id}
                className="rounded-lg border p-4"
              >

                <div className="mb-2 flex items-center justify-between">

                  <span className="font-semibold">
                    {item.employee?.name ?? "Sistem"}
                  </span>

                  <span className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleString("tr-TR")}
                  </span>

                </div>

                <div className="whitespace-pre-wrap">
                  {item.note}
                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      <div className="rounded-xl border bg-white p-6">

        <h2 className="mb-4 text-xl font-bold">
          İş Geçmişi
        </h2>

        {step.job.history.length === 0 ? (

          <div className="rounded-lg border border-dashed p-6 text-center text-gray-500">
            Henüz işlem geçmişi bulunmuyor.
          </div>

        ) : (

          <div className="space-y-3">

            {step.job.history.map((history) => (

              <div
                key={history.id}
                className="rounded-lg border-l-4 border-blue-600 bg-gray-50 p-4"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <div className="font-semibold">
                      {history.action}
                    </div>

                    {history.description && (
                      <div className="text-sm text-gray-500">
                        {history.description}
                      </div>
                    )}

                  </div>

                  <div className="text-right text-sm text-gray-500">

                    <div>
                      {history.employee?.name ?? "Sistem"}
                    </div>

                    <div>
                      {new Date(history.createdAt).toLocaleString("tr-TR")}
                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>

  );
}