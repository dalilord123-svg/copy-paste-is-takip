import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ProductionStepStatus,
  WaitingReason,
  EmployeeRole,
} from "@prisma/client";
import { getCurrentUser } from "@/lib/getCurrentUser";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const waitingReasonLabels: Record<WaitingReason, string> = {
  MALZEME: "Malzeme bekleniyor",
  MUSTERI_ONAYI: "Müşteri onayı bekleniyor",
  TASARIM: "Tasarım bekleniyor",
  MAKINE_ARIZASI: "Makine arızası",
  PERSONEL: "Personel eksikliği",
  DIGER: "Diğer",
};

const statusLabels: Record<ProductionStepStatus, string> = {
  BEKLIYOR: "Bekliyor",
  HAZIR: "Hazır",
  DEVAM_EDIYOR: "Devam ediyor",
  BEKLEMEDE: "Beklemede",
  TAMAMLANDI: "Tamamlandı",
  IPTAL: "İptal",
};

export default async function MobileJobDetailPage({ params }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const step = await prisma.productionStep.findUnique({
    where: {
      id,
    },
    include: {
      station: true,
      leader: true,
      assignments: {
        include: {
          employee: true,
        },
      },
      job: {
        include: {
          customer: true,
          notes: {
            include: {
              employee: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          },
          photos: {
            where: {
              productionStepId: id,
            },
            include: {
              employee: true,
            },
            orderBy: {
              uploadedAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!step) {
    notFound();
  }

  const isManager =
    user.role === EmployeeRole.ADMIN ||
    user.role === EmployeeRole.YONETICI;

  const isLeader = step.leaderId === user.id;

  const isAssigned = step.assignments.some(
    (assignment) => assignment.employeeId === user.id
  );

  if (!isManager && !isLeader && !isAssigned) {
    redirect("/mobile");
  }

  const requiredPhotos = step.station.requirePhotoCount;
  const uploadedPhotos = step.photoCount;

  const photoRequirementMet =
    uploadedPhotos >= requiredPhotos;

  const fileRequirementMet =
    !step.station.requireFile || step.fileCount >= 1;

  const noteRequirementMet =
    !step.station.requireNote || step.noteCount >= 1;

  const isCompleted =
    step.status === ProductionStepStatus.TAMAMLANDI;

  const isCancelled =
    step.status === ProductionStepStatus.IPTAL;

  const isWaiting =
    step.status === ProductionStepStatus.BEKLEMEDE;

  const isRunning =
    step.status === ProductionStepStatus.DEVAM_EDIYOR;

  const canChangeStatus = !isCompleted && !isCancelled;

  const canStart =
    !isCompleted && !isCancelled && !isRunning;

  const progress = Math.min(100, Math.max(0, step.progress));

  const canFinish =
    photoRequirementMet &&
    fileRequirementMet &&
    noteRequirementMet &&
    step.progress >= 100 &&
    step.assignments.length > 0 &&
    canChangeStatus;

  return (
    <main className="min-h-screen bg-gray-100 pb-8">
      {/* İŞ BİLGİLERİ */}
      <div className="rounded-b-3xl bg-blue-600 p-6 text-white">
        <h1 className="text-2xl font-bold">
          {step.job.title}
        </h1>

        <p className="mt-2 opacity-90">
          {step.job.customer.company}
        </p>

        <p className="mt-2 text-sm opacity-80">
          {step.job.jobNo}
        </p>
      </div>

      <div className="space-y-5 p-4">
        {/* ÜRETİM BİLGİLERİ */}
        <section className="rounded-2xl bg-white p-5 shadow">
          <div className="text-sm text-gray-500">
            İstasyon
          </div>

          <div className="mt-1 text-xl font-bold">
            {step.station.name}
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-500">
              Durum
            </div>

            <div className="font-semibold">
              {statusLabels[step.status]}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-500">
              İlerleme
            </div>

            <div className="font-semibold">
              %{progress}
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-500">
              Ustabaşı
            </div>

            <div className="font-semibold">
              {step.leader?.name ?? "-"}
            </div>
          </div>

          {step.waitingReason && (
            <div className="mt-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
              <strong>Bekleme nedeni:</strong>{" "}
              {waitingReasonLabels[step.waitingReason]}

              {step.waitingNote && (
                <p className="mt-1">
                  {step.waitingNote}
                </p>
              )}
            </div>
          )}
        </section>

        {/* PERSONELLER */}
        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-3 font-bold">
            Personeller
          </h2>

          <div className="space-y-2">
            {step.assignments.length === 0 ? (
              <p className="text-sm text-gray-500">
                Bu aşamaya personel atanmamış.
              </p>
            ) : (
              step.assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-xl border p-3"
                >
                  <div className="font-medium">
                    {assignment.employee.name}
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    {statusLabels[assignment.status]}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* BAŞLAT VE BİTİR */}
        <section className="grid grid-cols-2 gap-3">
          <form
            action={`/api/production-steps/${step.id}/start`}
            method="POST"
          >
            <button
              type="submit"
              disabled={!canStart}
              className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isWaiting ? "▶ YENİDEN BAŞLAT" : "▶ BAŞLAT"}
            </button>
          </form>

          <form
            action={`/api/production-steps/${step.id}/complete`}
            method="POST"
          >
            <button
              type="submit"
              disabled={!canFinish}
              className="w-full rounded-xl bg-green-600 py-4 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              ✔ BİTİR
            </button>
          </form>
        </section>

        {/* TAMAMLANMA ŞARTLARI */}
        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 font-bold">
            Tamamlanma Şartları
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>İlerleme</span>

              <span
                className={
                  step.progress >= 100
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                %{progress} / %100
              </span>
            </div>

            <div className="flex justify-between">
              <span>Personel</span>

              <span
                className={
                  step.assignments.length > 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {step.assignments.length > 0 ? "Tamam" : "Eksik"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Fotoğraf</span>

              <span
                className={
                  photoRequirementMet
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {uploadedPhotos} / {requiredPhotos}
              </span>
            </div>

            {step.station.requireFile && (
              <div className="flex justify-between">
                <span>Dosya</span>

                <span
                  className={
                    fileRequirementMet
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {step.fileCount >= 1 ? "Tamam" : "Eksik"}
                </span>
              </div>
            )}

            {step.station.requireNote && (
              <div className="flex justify-between">
                <span>Not</span>

                <span
                  className={
                    noteRequirementMet
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {step.noteCount >= 1 ? "Tamam" : "Eksik"}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* BEKLEMEYE AL */}
        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 font-bold">
            Beklemeye Al
          </h2>

          <form
            action={`/api/production-steps/${step.id}/waiting`}
            method="POST"
            className="space-y-3"
          >
            <select
              name="reason"
              required
              defaultValue=""
              disabled={!canChangeStatus}
              className="w-full rounded-xl border p-3 disabled:bg-gray-100"
            >
              <option value="" disabled>
                Bekleme nedeni seçin
              </option>

              {Object.values(WaitingReason).map((reason) => (
                <option key={reason} value={reason}>
                  {waitingReasonLabels[reason]}
                </option>
              ))}
            </select>

            <textarea
              name="note"
              placeholder="Açıklama..."
              disabled={!canChangeStatus}
              className="w-full rounded-xl border p-3 disabled:bg-gray-100"
              rows={3}
            />

            <button
              type="submit"
              disabled={!canChangeStatus}
              className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white disabled:bg-gray-400"
            >
              Beklemeye Al
            </button>
          </form>
        </section>

        {/* FOTOĞRAF YÜKLEME VE GÖRÜNTÜLEME */}
        <section className="rounded-2xl bg-white p-5 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">
              Fotoğraflar
            </h2>

            <div className="text-sm">
              {uploadedPhotos} / {requiredPhotos}
            </div>
          </div>

          <form
            action="/api/photos/upload"
            method="POST"
            encType="multipart/form-data"
            className="space-y-3"
          >
            <input
              type="hidden"
              name="jobId"
              value={step.job.id}
            />

            <input
              type="hidden"
              name="productionStepId"
              value={step.id}
            />

            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              required
              disabled={!canChangeStatus}
              className="w-full"
            />

            <button
              type="submit"
              disabled={!canChangeStatus}
              className="w-full rounded-xl bg-slate-700 py-3 font-bold text-white disabled:bg-gray-400"
            >
              Fotoğraf Yükle
            </button>
          </form>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {step.job.photos.length === 0 ? (
              <p className="col-span-2 text-sm text-gray-500">
                Bu aşamaya henüz fotoğraf yüklenmemiş.
              </p>
            ) : (
              step.job.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-xl border"
                >
                  <a
                    href={photo.filePath}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={photo.filePath}
                      alt={photo.originalName}
                      className="h-36 w-full object-cover"
                    />
                  </a>

                  <div className="p-2">
                    <p className="truncate text-xs font-medium">
                      {photo.originalName}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {photo.employee?.name ?? "Personel"}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(photo.uploadedAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* NOT EKLE */}
        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 font-bold">
            Not Ekle
          </h2>

          <form
            action="/api/jobs/add-note"
            method="POST"
            className="space-y-3"
          >
            <input
              type="hidden"
              name="jobId"
              value={step.job.id}
            />

            <input
              type="hidden"
              name="productionStepId"
              value={step.id}
            />

            <textarea
              name="note"
              required
              maxLength={5000}
              rows={3}
              disabled={!canChangeStatus}
              className="w-full rounded-xl border p-3 disabled:bg-gray-100"
              placeholder="Not yaz..."
            />

            <button
              type="submit"
              disabled={!canChangeStatus}
              className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white disabled:bg-gray-400"
            >
              Not Kaydet
            </button>
          </form>
        </section>

        {/* SON NOTLAR */}
        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 font-bold">
            Son Notlar
          </h2>

          <div className="space-y-3">
            {step.job.notes.length === 0 ? (
              <p className="text-sm text-gray-500">
                Henüz not eklenmemiş.
              </p>
            ) : (
              step.job.notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border p-3"
                >
                  <div className="font-semibold">
                    {note.employee?.name ?? "Sistem"}
                  </div>

                  <div className="mt-1 whitespace-pre-wrap text-sm">
                    {note.note}
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleString("tr-TR")}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}