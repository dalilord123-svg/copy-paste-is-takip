"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Customer = {
  id: string;
  company: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
      alert("Müşteriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Müşteriler</h1>

          <p className="text-gray-500 mt-2">
            Toplam {customers.length} müşteri
          </p>
        </div>

        <Link
          href="/customers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          + Yeni Müşteri
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8">Yükleniyor...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-gray-500">
            Sistemde kayıtlı müşteri bulunmuyor.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">Firma</th>
                <th className="text-left p-4">Yetkili</th>
                <th className="text-left p-4">Telefon</th>
                <th className="text-left p-4">E-posta</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-4 font-semibold">{customer.company}</td>
                  <td className="p-4">{customer.contact || "-"}</td>
                  <td className="p-4">{customer.phone || "-"}</td>
                  <td className="p-4">{customer.email || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}