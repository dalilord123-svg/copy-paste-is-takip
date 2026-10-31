// app/employees/page.tsx
import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Personeller</h1>

        <Link
          href="/employees/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          + Personel
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Ad</th>
            <th className="p-3 text-left">Rol</th>
            <th className="p-3 text-left">Telefon</th>
            <th className="p-3 text-left">Durum</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-t">
              <td className="p-3">{employee.name}</td>
              <td className="p-3">{employee.role}</td>
              <td className="p-3">{employee.phone || "-"}</td>
              <td className="p-3">{employee.isActive ? "Aktif" : "Pasif"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}