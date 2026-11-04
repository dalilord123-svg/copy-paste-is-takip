// app/employees/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductionStepStatus } from "@prisma/client";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    include: {
      assignments: {
        where: {
          productionStep: {
            status: {
              in: [
                ProductionStepStatus.BEKLIYOR,
                ProductionStepStatus.DEVAM_EDIYOR,
              ],
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Personel Yönetimi
          </h1>

          <p className="text-gray-500 mt-1">
            Toplam {employees.length} personel
          </p>
        </div>

        <Link
          href="/employees/new"
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 font-semibold"
        >
          + Yeni Personel
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">
                Ad Soyad
              </th>

              <th className="p-4 text-left">
                Kullanıcı
              </th>

              <th className="p-4 text-left">
                Rol
              </th>

              <th className="p-4 text-left">
                Telefon
              </th>

              <th className="p-4 text-center">
                Aktif İş
              </th>

              <th className="p-4 text-center">
                Durum
              </th>

              <th className="p-4 text-center">
                İşlemler
              </th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4 font-semibold">
                  {employee.name}
                </td>

                <td className="p-4">
                  {employee.username}
                </td>

                <td className="p-4">
                  <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm">
                    {employee.role}
                  </span>
                </td>

                <td className="p-4">
                  {employee.phone ?? "-"}
                </td>

                <td className="p-4 text-center font-bold">
                  {employee.assignments.length}
                </td>

                <td className="p-4 text-center">
                  {employee.isActive ? (
                    <span className="rounded-full bg-green-100 text-green-700 px-3 py-1">
                      Aktif
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 text-red-700 px-3 py-1">
                      Pasif
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <Link
                      href={`/employees/${employee.id}/edit`}
                      className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2"
                    >
                      ✏ Düzenle
                    </Link>

                    <Link
                      href={`/employees/${employee.id}/password`}
                      className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-3 py-2"
                    >
                      🔒 Şifre
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}