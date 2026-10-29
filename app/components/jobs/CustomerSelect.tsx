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
      alert("Müşteri listesi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="block mb-2 font-semibold">
        Müşteri
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg p-3"
      >
        <option value="">
          {loading
            ? "Yükleniyor..."
            : "Müşteri Seçiniz"}
        </option>

        {customers.map((customer) => (
          <option
            key={customer.id}
            value={customer.id}
          >
            {customer.company}
          </option>
        ))}
      </select>
    </div>
  );
}