"use client";

import { useEffect, useState } from "react";

export type SelectedProductionStep = {
  stationId: string;
  name: string;
};

type Station = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  requirePhotoCount: number;
  requireFile: boolean;
  requireNote: boolean;
};

type Props = {
  value: SelectedProductionStep[];
  onChange: (
    steps: SelectedProductionStep[]
  ) => void;
};

export default function ProductionStepsSelector({
  value,
  onChange,
}: Props) {

  const [stations, setStations] = useState<
    Station[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadStations();
  }, []);

  async function loadStations() {
    try {
      const res = await fetch(
        "/api/stations"
      );

      const data = await res.json();

      setStations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function isSelected(id: string) {
    return value.some(
      (x) => x.stationId === id
    );
  }

  function toggleStation(
    station: Station
  ) {
    const exists = value.find(
      (x) =>
        x.stationId === station.id
    );

    if (exists) {
      onChange(
        value.filter(
          (x) =>
            x.stationId !== station.id
        )
      );

      return;
    }

    onChange([
      ...value,
      {
        stationId: station.id,
        name: station.name,
      },
    ]);
  }

  function moveUp(index: number) {
    if (index === 0) return;

    const list = [...value];

    [
      list[index - 1],
      list[index],
    ] = [
      list[index],
      list[index - 1],
    ];

    onChange(list);
  }

  function moveDown(index: number) {
    if (
      index ===
      value.length - 1
    )
      return;

    const list = [...value];

    [
      list[index],
      list[index + 1],
    ] = [
      list[index + 1],
      list[index],
    ];

    onChange(list);
  }

  if (loading) {
    return (
      <div className="border rounded-xl p-6 bg-white">

        <h2 className="text-xl font-bold mb-4">
          Üretim Adımları
        </h2>

        <p>
          Yükleniyor...
        </p>

      </div>
    );
  }

  return (
    <div className="border rounded-xl p-6 bg-white mt-8">

      <div className="flex items-center justify-between mb-5">

        <div>

          <h2 className="text-xl font-bold">
            Üretim Adımları
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            İş için gerekli üretim
            aşamalarını seçiniz.
          </p>

        </div>

        <div className="text-sm text-gray-500">

          Seçilen:
          {" "}
          <strong>
            {value.length}
          </strong>

        </div>

      </div>

      <div className="space-y-3">        {stations.map((station) => {

          const checked = isSelected(
            station.id
          );

          const selectedIndex =
            value.findIndex(
              (x) =>
                x.stationId ===
                station.id
            );

          return (
            <div
              key={station.id}
              className={`border rounded-xl p-4 transition ${
                checked
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleStation(
                        station
                      )
                    }
                    className="w-5 h-5"
                  />

                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor:
                        station.color ??
                        "#ddd",
                    }}
                  >
                    {station.icon}
                  </div>

                  <div>

                    <div className="font-semibold">

                      {station.name}

                    </div>

                    <div className="text-xs text-gray-500 mt-1">

                      {station.requirePhotoCount >
                        0 && (
                        <span className="mr-3">

                          📷
                          {" "}
                          {
                            station.requirePhotoCount
                          }
                          {" "}
                          Fotoğraf

                        </span>
                      )}

                      {station.requireFile && (
                        <span className="mr-3">

                          📄 Dosya

                        </span>
                      )}

                      {station.requireNote && (
                        <span>

                          📝 Not

                        </span>
                      )}

                    </div>

                  </div>

                </div>

                {checked && (
                  <div className="flex items-center gap-2">

                    <div className="text-sm text-blue-700 font-semibold">

                      {selectedIndex + 1}.
                      sıra

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        moveUp(
                          selectedIndex
                        )
                      }
                      disabled={
                        selectedIndex ===
                        0
                      }
                      className="border rounded-lg px-3 py-2 hover:bg-gray-100 disabled:opacity-40"
                    >
                      ▲
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moveDown(
                          selectedIndex
                        )
                      }
                      disabled={
                        selectedIndex ===
                        value.length -
                          1
                      }
                      className="border rounded-lg px-3 py-2 hover:bg-gray-100 disabled:opacity-40"
                    >
                      ▼
                    </button>

                  </div>
                )}

              </div>

            </div>
          );
        })}      </div>

      {value.length > 0 && (

        <div className="mt-8 border-t pt-6">

          <h3 className="font-semibold mb-4">

            Seçilen Üretim Sırası

          </h3>

          <div className="space-y-2">

            {value.map((step, index) => (

              <div
                key={step.stationId}
                className="flex items-center justify-between border rounded-lg p-3 bg-gray-50"
              >

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">

                    {index + 1}

                  </div>

                  <div>

                    <div className="font-medium">

                      {step.name}

                    </div>

                  </div>

                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    ▲
                  </button>

                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === value.length - 1}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    ▼
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}