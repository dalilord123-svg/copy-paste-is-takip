import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function TemplatesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const templates = await prisma.template.findMany({
    include: {
      steps: {
        include: {
          station: true,
        },
        orderBy: {
          stepOrder: "asc",
        },
      },
      jobs: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="max-w-7xl mx-auto p-8">

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold">
            Şablonlar
          </h1>

          <p className="text-gray-500 mt-2">
            Toplam {templates.length} şablon
          </p>
        </div>

        <Link
          href="/templates/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
        >
          + Yeni Şablon
        </Link>

      </div>

      {templates.length === 0 ? (

        <div className="bg-white border rounded-xl p-10 text-center">
          Henüz şablon oluşturulmadı.
        </div>

      ) : (

        <div className="grid gap-6">

          {templates.map((template) => (

            <Link
              key={template.id}
              href={`/templates/${template.id}`}
              className="bg-white border rounded-xl p-6 hover:border-blue-500 transition"
            >

              <div className="flex justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    {template.name}
                  </h2>

                  <p className="text-gray-500 mt-2">
                    {template.description}
                  </p>

                </div>

                <div className="text-right">

                  <div className="font-semibold">
                    {template.steps.length} İstasyon
                  </div>

                  <div className="text-sm text-gray-500">
                    {template.jobs.length} İşte Kullanıldı
                  </div>

                </div>

              </div>

              <div className="flex flex-wrap gap-2 mt-6">

                {template.steps.map((step) => (

                  <span
                    key={step.id}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {step.stepOrder}. {step.station.name}
                  </span>

                ))}

              </div>

            </Link>

          ))}

        </div>

      )}

    </main>
  );
}