import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TemplatesPage() {

  const templates = await prisma.template.findMany({

    include: {
      steps: true,
    },

    orderBy: {
      createdAt: "desc",
    },

  });

  return (

    <main className="max-w-7xl mx-auto p-6">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Şablonlar
          </h1>

          <p className="text-gray-500 mt-2">
            İş oluştururken kullanılacak üretim şablonları
          </p>

        </div>

        <Link
          href="/templates/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          + Yeni Şablon
        </Link>

      </div>

      <div className="grid gap-6">

        {templates.length === 0 && (

          <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500">

            Henüz şablon oluşturulmadı.

          </div>

        )}

        {templates.map((template) => (          <div
            key={template.id}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition p-6"
          >

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-semibold">
                  {template.name}
                </h2>

                {template.description && (
                  <p className="text-gray-500 mt-2">
                    {template.description}
                  </p>
                )}

              </div>

              <div className="text-right">

                <div className="text-3xl font-bold text-blue-600">
                  {template.steps.length}
                </div>

                <div className="text-sm text-gray-500">
                  Adım
                </div>

              </div>

            </div>

            <div className="mt-6 flex items-center justify-between">

              <div className="text-sm text-gray-500">

                Oluşturulma:

                {" "}

                {template.createdAt.toLocaleDateString("tr-TR")}

              </div>

              <div className="flex gap-3"></div>                <Link
                  href={`/templates/${template.id}/edit`}
                  className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition"
                >
                  Düzenle
                </Link>

                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition"
                  onClick={() => {
                    alert("Şablon kopyalama yakında eklenecek.");
                  }}
                >
                  Kopyala
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                  onClick={() => {
                    if (
                      confirm(
                        `"${template.name}" şablonunu silmek istiyor musunuz?`
                      )
                    ) {
                      window.location.href = `/api/templates/${template.id}/delete`;
                    }
                  }}
                >
                  Sil
                </button>

              </div>

            </div>

          </div>        ))}

      </div>

    </main>

  );
}