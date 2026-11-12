
"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: string;
  company: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function CustomerSelect({
  value,
  onChange,
}: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/customers", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Müşteriler alınamadı."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Müşteri listesi geçersiz.");
        }

        if (!cancelled) {
          setCustomers(data);
        }
      } catch (err) {
        console.error("CUSTOMER SELECT ERROR:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Müşteri listesi yüklenemedi."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <label className="block mb-2 font-semibold">
        Müşteri
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || customers.length === 0}
        className="w-full border rounded-lg p-3 bg-white disabled:bg-gray-100"
      >
        <option value="">
          {loading
            ? "Müşteriler yükleniyor..."
            : error
              ? "Müşteriler yüklenemedi"
              : customers.length === 0
                ? "Kayıtlı müşteri bulunamadı"
                : "Müşteri Seçiniz"}
        </option>

        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.company}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && customers.length > 0 && (
        <p className="mt-2 text-sm text-gray-500">
          {customers.length} müşteri bulundu.
        </p>
      )}
    </div>
  );
}
