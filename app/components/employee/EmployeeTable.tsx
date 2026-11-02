"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Employee = {
  id: string;
  name: string;
  username: string;
  phone: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  productionSteps: any[];
};

type Props = {
  employees: Employee[];
};

export default function EmployeeTable({
  employees,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase();

    return employees.filter((employee) => {
      return (
        employee.name.toLowerCase().includes(q) ||
        employee.username.toLowerCase().includes(q) ||
        (employee.phone ?? "").toLowerCase().includes(q) ||
        (employee.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [employees, search]);

  return (
    <div className="bg-white rounded-2xl shadow">

      {/* HEADER */}

      <div className="p-6 border-b">

        <input
          type="text"
          placeholder="Personel Ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr className="text-left">

              <th className="p-4">Ad Soyad</th>

              <th className="p-4">Kullanıcı</th>

              <th className="p-4">Telefon</th>

              <th className="p-4">Rol</th>

              <th className="p-4">Durum</th>

              <th className="p-4">Aktif İş</th>

              <th className="p-4 text-center">
                İşlemler
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredEmployees.length === 0 && (

              <tr>

                <td
                  colSpan={7}
                  className="text-center p-10 text-gray-500"
                >
                  Personel bulunamadı.
                </td>

              </tr>

            )}

            {filteredEmployees.map((employee) => (

              <tr
                key={employee.id}
                className="border-b hover:bg-slate-50"
              >

                <td className="p-4">

                  <div className="font-semibold">
                    {employee.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    {employee.email ?? "-"}
                  </div>

                </td>

                <td className="p-4">
                  {employee.username}
                </td>

                <td className="p-4">
                  {employee.phone ?? "-"}
                </td>

                <td className="p-4">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      employee.role === "ADMIN"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {employee.role}
                  </span>

                </td>

                <td className="p-4">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      employee.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {employee.isActive
                      ? "Aktif"
                      : "Pasif"}
                  </span>

                </td>

                <td className="p-4">

                  <span className="font-bold text-lg">
                    {employee.productionSteps.length}
                  </span>

                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-2 flex-wrap">

                    <Link
                      href={`/employees/${employee.id}/edit`}
                      className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm"
                    >
                      Düzenle
                    </Link>

                    <Link
                      href={`/employees/${employee.id}/password`}
                      className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 text-sm"
                    >
                      Şifre
                    </Link>

                    <button
                      className={`rounded-lg px-3 py-2 text-sm text-white ${
                        employee.isActive
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {employee.isActive
                        ? "Pasif Yap"
                        : "Aktif Yap"}
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}