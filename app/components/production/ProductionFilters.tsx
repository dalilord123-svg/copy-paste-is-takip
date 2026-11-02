"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Station = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  name: string;
};

type Props = {
  stations: Station[];
  employees: Employee[];
};

export default function ProductionFilters({
  stations,
  employees,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [station, setStation] = useState(
    searchParams.get("station") ?? ""
  );
  const [employee, setEmployee] = useState(
    searchParams.get("employee") ?? ""
  );
  const [status, setStatus] = useState(
    searchParams.get("status") ?? ""
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();

      if (q) params.set("q", q);
      if (station) params.set("station", station);
      if (employee) params.set("employee", employee);
      if (status) params.set("status", status);

      router.replace(`/production?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
  }, [q, station, employee, status, router]);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">

      <div className="grid lg:grid-cols-4 gap-4">

        <input
          type="text"
          placeholder="🔍 İş No / İş Adı / Müşteri"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={station}
          onChange={(e) => setStation(e.target.value)}
          className="border rounded-lg px-4 py-3"
        >
          <option value="">Tüm İstasyonlar</option>

          {stations.map((station) => (
            <option
              key={station.id}
              value={station.id}
            >
              {station.name}
            </option>
          ))}
        </select>

        <select
          value={employee}
          onChange={(e) => setEmployee(e.target.value)}
          className="border rounded-lg px-4 py-3"
        >
          <option value="">Tüm Personeller</option>

          {employees.map((employee) => (
            <option
              key={employee.id}
              value={employee.id}
            >
              {employee.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-4 py-3"
        >
          <option value="">Tüm Durumlar</option>
          <option value="BEKLIYOR">Bekliyor</option>
          <option value="HAZIR">Hazır</option>
          <option value="DEVAM_EDIYOR">Devam Ediyor</option>
          <option value="BEKLEMEDE">Beklemede</option>
          <option value="TAMAMLANDI">Tamamlandı</option>
          <option value="IPTAL">İptal</option>
        </select>

      </div>

    </div>
  );
}