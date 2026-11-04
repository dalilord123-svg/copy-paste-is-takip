import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ProductionStepStatus,
  EmployeeRole,
} from "@prisma/client";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function MobileHomePage() {
  const employee = await getCurrentUser();

  if (!employee) {
    redirect("/login");
  }

  const isManager =
    employee.role === EmployeeRole.ADMIN ||
    employee.role === EmployeeRole.YONETICI;

  const assignments = await prisma.productionAssignment.findMany({
    where: {
      employeeId: employee.id,
    },
    include: {
      productionStep: {
        include: {
          job: {
            include: {
              customer: true,
            },
          },
          station: true,
          leader: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const ledSteps = await prisma.productionStep.findMany({
    where: {
      leaderId: employee.id,
      assignments: {
        none: {
          employeeId: employee.id,
        },
      },
    },
    include: {
      job: {
        include: {
          customer: true,
        },
      },
      station: true,
      leader: true,
      assignments: {
        include: {
          employee: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const assignedSteps = assignments.map(
    (assignment) => assignment.productionStep
  );

  const allSteps = [
    ...assignedSteps,
    ...ledSteps,
  ];

  const uniqueSteps = Array.from(
    new Map(
      allSteps.map((step) => [step.id, step])
    ).values()
  );

  const waiting = uniqueSteps.filter(
    (step) =>
      step.status === ProductionStepStatus.BEKLIYOR ||
      step.status === ProductionStepStatus.BEKLEMEDE
  ).length;

  const working = uniqueSteps.filter(
    (step) =>
      step.status === ProductionStepStatus.DEVAM_EDIYOR ||
      step.status === ProductionStepStatus.HAZIR
  ).length;

  const finished = uniqueSteps.filter(
    (step) =>
      step.status === ProductionStepStatus.TAMAMLANDI
  ).length;

  const managerJobs = isManager
    ? await prisma.job.findMany({
        where: {
          isArchived: false,
        },
        include: {
          customer: true,
          productionSteps: {
            include: {
              station: true,
              leader: true,
              assignments: {
                include: {
                  employee: true,
                },
              },
            },
            orderBy: {
              stepOrder: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  return (
    <main className="min-h-screen bg-gray-100 pb-8">
      <div className="rounded-b-3xl bg-blue-600 p-6 text-white">
        <div className="text-sm opacity-80">
          Hoş geldin
        </div>

        <h1 className="mt-1 text-3xl font-bold">
          {employee.name}
        </h1>

        <div className="mt-2 text-sm opacity-80">
          {isManager ? "Yönetici" : "Personel"}
        </div>
      </div>

      <div className="space-y-5 p-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white p-4 text-center shadow">
            <div className="text-2xl font-bold">
              {waiting}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Bekliyor
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 text-center shadow">
            <div className="text-2xl font-bold text-blue-600">
              {working}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Devam
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 text-center shadow">
            <div className="text-2xl font-bold text-green-600">
              {finished}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Tamam
            </div>
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-lg font-bold">
            Bana Atanan İşler
          </h2>

          <div className="space-y-3">
            {uniqueSteps.length === 0 ? (
              <div className="rounded-2xl bg-white p-5 text-sm text-gray-500 shadow">
                Henüz size atanmış üretim işi bulunmuyor.
              </div>
            ) : (
              uniqueSteps.map((step) => (
                <Link
                  key={step.id}
                  href={`/mobile/jobs/${step.id}`}
                  className="block rounded-2xl bg-white p-5 shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">
                        {step.job.title}
                      </h3>

                      <div className="mt-1 text-sm text-gray-500">
                        {step.job.customer.company}
                      </div>

                      <div className="mt-1 text-xs text-gray-400">
                        {step.job.jobNo}
                      </div>
                    </div>

                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                      {step.status}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold">
                      İstasyon
                    </div>

                    <div>
                      {step.station.name}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-500">
                    Ustabaşı: {step.leader?.name ?? "-"}
                  </div>

                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, step.progress)
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      %{step.progress}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {isManager && (
          <section>
            <h2 className="mb-3 text-lg font-bold">
              Yönetici - Tüm Aktif İşler
            </h2>

            <div className="space-y-3">
              {managerJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block rounded-2xl bg-white p-5 shadow"
                >
                  <h3 className="font-bold">
                    {job.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {job.customer.company}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {job.jobNo} · {job.status}
                  </p>

                  <p className="mt-2 text-sm">
                    Üretim adımı: {job.productionSteps.length}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}