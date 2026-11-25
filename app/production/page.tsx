"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProductionStep = {
  id: string;
  status: string;
  progress: number;

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
  };

  assignments: {
    id: string;

    employee: {
      id: string;
      name: string;
    };
  }[];
};

export default function ProductionPage() {
  const [loading, setLoading] = useState(true);

  const [production, setProduction] =
    useState<ProductionStep[]>([]);

  useEffect(() => {
    loadProduction();
  }, []);

  async function loadProduction() {
    try {
      const res = await fetch("/api/production");

      const data = await res.json();

      if (data.success) {
        setProduction(data.production);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        Yükleniyor...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Üretim
        </h1>

        <div className="text-gray-500">
          {production.length} aktif istasyon
        </div>
      </div>

      {production.length === 0 && (
        <div className="rounded-xl border p-8 text-center text-gray-500">
          Aktif üretim bulunamadı.
        </div>
      )}

      <div className="grid gap-5">
        {production.map((step) => (
          <div
            key={step.id}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-bold">
                  {step.station.name}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  {step.job.jobNo}
                </div>

                <div className="mt-2 text-xl font-semibold">
                  {step.job.title}
                </div>

                <div className="text-gray-500">
                  {step.job.customer.company}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">
                  {step.status}
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  %{step.progress}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold">
                Personeller
              </div>

              <div className="flex flex-wrap gap-2">
                {step.assignments.map((assignment) => (
                  <span
                    key={assignment.id}
                    className="rounded-full bg-blue-100 px-3 py-1 text-sm"
                  >
                    {assignment.employee.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`/production/${step.id}`}
                className="rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800"
              >
                Devam Et
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}