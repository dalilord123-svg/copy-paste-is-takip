
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PhotoUpload from "@/app/components/employee/PhotoUpload";
import PhotoGallery from "@/app/components/employee/PhotoGallery";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EmployeeJobPage({ params }: Props) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      customer: true,
      productionSteps: {
        include: {
          station: true,
          assignments: {
            include: {
              employee: true,
            },
          },
        },
        orderBy: { stepOrder: "asc" },
      },
      notes: {
        orderBy: { createdAt: "desc" },
      },
      photos: {
        orderBy: { uploadedAt: "desc" },
      },
      files: {
        orderBy: { uploadedAt: "desc" },
      },
    },
  });

  if (!job) notFound();

  const activeStep = job.productionSteps.find(
    (step) => step.status === "DEVAM_EDIYOR"
  );

  const completed = job.productionSteps.filter(
    (step) => step.status === "TAMAMLANDI"
  ).length;

  const progress =
    job.productionSteps.length === 0
      ? 0
      : Math.round(
          (completed / job.productionSteps.length) * 100
        );

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-3xl mx-auto p-5">
        <Link
          href="/employee"
          className="text-blue-600 font-semibold"
        >
          ← Geri
        </Link>

        <div className="bg-white rounded-2xl shadow mt-4 p-6">
          <div className="text-sm text-gray-500">
            {job.jobNo}
          </div>

          <h1 className="text-3xl font-bold mt-2">
            {job.title}
          </h1>

          <div className="mt-5 space-y-3">
            <div>
              👤 <b>{job.customer.company}</b>
            </div>

            <div>
              📍{" "}
              <b>
                {activeStep?.station.name ?? "Tamamlandı"}
              </b>
            </div>

            <div>
              👷{" "}
              <b>
                {activeStep?.assignments
                  .map((assignment) => assignment.employee.name)
                  .join(", ") || "-"}
              </b>
            </div>

            <div>
              📅{" "}
              <b>
                {job.deliveryDate
                  ? new Date(job.deliveryDate).toLocaleDateString("tr-TR")
                  : "-"}
              </b>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span>İlerleme</span>
              <span>%{progress}</span>
            </div>

            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow mt-6 p-5">
          <h2 className="text-xl font-bold mb-4">
            Üretim Adımları
          </h2>

          <div className="space-y-3">
            {job.productionSteps.map((step) => (
              <div
                key={step.id}
                className="flex justify-between items-center border rounded-lg p-4"
              >
                <div>
                  <div className="font-semibold">
                    {step.station.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    {step.assignments
                      .map((assignment) => assignment.employee.name)
                      .join(", ") || "-"}
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    step.status === "TAMAMLANDI"
                      ? "bg-green-100 text-green-700"
                      : step.status === "DEVAM_EDIYOR"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {step.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <PhotoUpload
            jobId={job.id}
            productionStepId={activeStep?.id}
          />
        </div>

        <PhotoGallery photos={job.photos} />
      </div>
    </main>
  );
}
