"use client";

import { useEffect, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface Station {
  id: string;
  name: string;
}

interface SelectedStation {
  id: number;
  stationId: string;
}

export default function StationEditor() {
  const [stations, setStations] = useState<Station[]>([]);
  const [rows, setRows] = useState<SelectedStation[]>([]);

  useEffect(() => {
    loadStations();
  }, []);

  async function loadStations() {
    const res = await fetch("/api/stations");
    const data = await res.json();

    setStations(data);
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        stationId: "",
      },
    ]);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((x) => x.id !== id));
  }

  function changeStation(id: number, stationId: string) {
    setRows((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              stationId,
            }
          : x
      )
    );
  }

  function moveUp(index: number) {
    if (index === 0) return;

    const copy = [...rows];

    [copy[index - 1], copy[index]] =
      [copy[index], copy[index - 1]];

    setRows(copy);
  }

  function moveDown(index: number) {
    if (index === rows.length - 1) return;

    const copy = [...rows];

    [copy[index], copy[index + 1]] =
      [copy[index + 1], copy[index]];

    setRows(copy);
  }

  return (
    <div className="space-y-4">

      {rows.map((row, index) => (

        <div
          key={row.id}
          className="flex items-center gap-3 border rounded-xl p-4"
        >

          <GripVertical className="text-gray-400" />

          <select
            className="flex-1 border rounded-lg p-2"
            value={row.stationId}
            onChange={(e) =>
              changeStation(row.id, e.target.value)
            }
          >
            <option value="">
              İstasyon Seçiniz
            </option>

            {stations.map((station) => (

              <option
                key={station.id}
                value={station.id}
              >
                {station.name}
              </option>

            ))}

          </select>

          <button
            type="button"
            onClick={() => moveUp(index)}
            className="border rounded-lg px-3 py-2"
          >
            ↑
          </button>

          <button
            type="button"
            onClick={() => moveDown(index)}
            className="border rounded-lg px-3 py-2"
          >
            ↓
          </button>

          <button
            type="button"
            onClick={() => removeRow(row.id)}
            className="text-red-600"
          >
            <Trash2 size={20} />
          </button>

        </div>

      ))}

      <button
        type="button"
        onClick={addRow}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
      >
        <Plus size={18} />
        İstasyon Ekle
      </button>

    </div>
  );
}