
"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

export interface TemplateStepRow {
  id: number;
  stationId: string;
}

interface Station {
  id: string;
  name: string;
}

interface StationEditorProps {
  rows: TemplateStepRow[];
  setRows: Dispatch<SetStateAction<TemplateStepRow[]>>;
}

export default function StationEditor({
  rows,
  setRows,
}: StationEditorProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStations() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/stations", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `İstasyonlar yüklenemedi. HTTP ${response.status}`
          );
        }

        const data = await response.json();

        // API { success: true, stations: [...] } döndürüyor.
        const stationList = Array.isArray(data.stations)
          ? data.stations
          : Array.isArray(data)
            ? data
            : [];

        setStations(stationList);
      } catch (err) {
        console.error("İstasyon yükleme hatası:", err);

        setError(
          err instanceof Error
            ? err.message
            : "İstasyonlar yüklenirken hata oluştu."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStations();
  }, []);

  function addRow() {
    setRows((previous) => [
      ...previous,
      {
        id: Date.now() + previous.length,
        stationId: "",
      },
    ]);
  }

  function removeRow(id: number) {
    setRows((previous) =>
      previous.filter((row) => row.id !== id)
    );
  }

  function changeStation(id: number, stationId: string) {
    setRows((previous) =>
      previous.map((row) =>
        row.id === id ? { ...row, stationId } : row
      )
    );
  }

  function moveUp(index: number) {
    if (index <= 0) return;

    const updated = [...rows];

    [updated[index - 1], updated[index]] = [
      updated[index],
      updated[index - 1],
    ];

    setRows(updated);
  }

  function moveDown(index: number) {
    if (index >= rows.length - 1) return;

    const updated = [...rows];

    [updated[index], updated[index + 1]] = [
      updated[index + 1],
      updated[index],
    ];

    setRows(updated);
  }

  return (
    <div className="space-y-4">
      {loading && (
        <p className="text-gray-500">
          İstasyonlar yükleniyor...
        </p>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && stations.length === 0 && (
        <div className="rounded-xl border p-4 text-center text-gray-500">
          Kullanılabilir istasyon bulunamadı.
        </div>
      )}

      {!loading && !error && stations.length > 0 && rows.length === 0 && (
        <div className="rounded-xl border p-8 text-center text-gray-500">
          Henüz şablona istasyon eklenmedi.
        </div>
      )}

      {rows.map((row, index) => (
        <div
          key={row.id}
          className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4"
        >
          <GripVertical
            size={20}
            className="text-gray-400"
          />

          <select
            value={row.stationId}
            onChange={(event) =>
              changeStation(row.id, event.target.value)
            }
            disabled={loading || stations.length === 0}
            className="min-w-0 flex-1 rounded-lg border p-2"
          >
            <option value="">İstasyon Seçiniz</option>

            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => moveUp(index)}
            disabled={index === 0}
            className="rounded-lg border px-3 py-2 hover:bg-gray-100 disabled:opacity-40"
            title="Yukarı Taşı"
          >
            ↑
          </button>

          <button
            type="button"
            onClick={() => moveDown(index)}
            disabled={index === rows.length - 1}
            className="rounded-lg border px-3 py-2 hover:bg-gray-100 disabled:opacity-40"
            title="Aşağı Taşı"
          >
            ↓
          </button>

          <button
            type="button"
            onClick={() => removeRow(row.id)}
            className="text-red-600 hover:text-red-800"
            title="Sil"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        disabled={loading || stations.length === 0}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={18} />
        İstasyon Ekle
      </button>
    </div>
  );
}
