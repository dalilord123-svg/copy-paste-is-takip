"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCustomerPage() {
  const router = useRouter();

  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);

  async function saveCustomer(e: React.FormEvent) {
    e.preventDefault();

    if (!company.trim()) {
      alert("Firma adı zorunludur.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          contact,
          phone,
          email,
          address,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      alert("Müşteri başarıyla kaydedildi.");

      router.push("/customers");
      router.refresh();
    } catch {
      alert("Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-8">

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">
          Yeni Müşteri
        </h1>

        <Link
          href="/customers"
          className="text-blue-600"
        >
          ← Geri
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-8">

        <form onSubmit={saveCustomer} className="space-y-6">

          <div>
            <label className="block mb-2 font-semibold">
              Firma Adı
            </label>

            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Firma adı"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Yetkili
            </label>

            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Yetkili kişi"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Telefon
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="05xx xxx xx xx"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              E-posta
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="mail@firma.com"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Adres
            </label>

            <textarea
              rows={4}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Adres"
            />
          </div>

          <div className="flex gap-4">

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>

            <Link
              href="/customers"
              className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg"
            >
              İptal
            </Link>

          </div>

        </form>

      </div>

    </main>
  );
}