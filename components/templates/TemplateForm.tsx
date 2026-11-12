"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Station = {
  id: string;
  name: string;
  icon: string | null;
  requirePhotoCount: number;
  requireFile: boolean;
  requireNote: boolean;
};

export default function TemplateForm({
  stations,
}: {
  stations: Station[];
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [steps, setSteps] = useState(
    stations.map((station, index) => ({
      stationId: station.id,
      stationName: station.name,
      icon: station.icon,

      enabled: true,

      stepOrder: index + 1,

      estimatedMinutes: 0,

      requirePhotoCount: station.requirePhotoCount,

      requireFile: station.requireFile,

      requireNote: station.requireNote,
    }))
  );

  async function saveTemplate() {
    setLoading(true);

    const res = await fetch("/api/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        steps,
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/templates");
      router.refresh();
    } else {
      alert("Şablon oluşturulamadı.");
    }
  }

  return (
    <div className="space-y-8">

      <div className="bg-white rounded-xl border p-6">

        <label className="block font-semibold mb-2">
          Şablon Adı
        </label>

        <input
          className="w-full border rounded-lg p-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block font-semibold mt-6 mb-2">
          Açıklama
        </label>

        <textarea
          className="w-full border rounded-lg p-3"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

      </div>

      <div className="bg-white rounded-xl border">

        <table className="w-full">

          <thead className="border-b bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                Kullan
              </th>

              <th className="text-left">
                İstasyon
              </th>

              <th>
                Sıra
              </th>

              <th>
                Süre
              </th>

              <th>
                Foto
              </th>

              <th>
                Dosya
              </th>

              <th>
                Not
              </th>

            </tr>

          </thead>

          <tbody>

            {steps.map((step, index) => (

              <tr
                key={step.stationId}
                className="border-b"
              >

                <td className="p-3">

                  <input
                    type="checkbox"
                    checked={step.enabled}
                    onChange={(e) => {
                      const list = [...steps];
                      list[index].enabled = e.target.checked;
                      setSteps(list);
                    }}
                  />

                </td>

                <td>
                  {step.icon} {step.stationName}
                </td>

                <td>

                  <input
                    type="number"
                    className="border rounded p-2 w-20"
                    value={step.stepOrder}
                    onChange={(e) => {
                      const list = [...steps];
                      list[index].stepOrder = Number(e.target.value);
                      setSteps(list);
                    }}
                  />

                </td>

                <td>

                  <input
                    type="number"
                    className="border rounded p-2 w-24"
                    value={step.estimatedMinutes}
                    onChange={(e) => {
                      const list = [...steps];
                      list[index].estimatedMinutes = Number(e.target.value);
                      setSteps(list);
                    }}
                  />

                </td>

                <td>

                  <input
                    type="number"
                    className="border rounded p-2 w-20"
                    value={step.requirePhotoCount}
                    onChange={(e) => {
                      const list = [...steps];
                      list[index].requirePhotoCount = Number(e.target.value);
                      setSteps(list);
                    }}
                  />

                </td>

                <td>

                  <input
                    type="checkbox"
                    checked={step.requireFile}
                    onChange={(e) => {
                      const list = [...steps];
                      list[index].requireFile = e.target.checked;
                      setSteps(list);
                    }}
                  />

                </td>

                <td>

                  <input
                    type="checkbox"
                    checked={step.requireNote}
                    onChange={(e) => {
                      const list = [...steps];
                      list[index].requireNote = e.target.checked;
                      setSteps(list);
                    }}
                  />

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <button
        onClick={saveTemplate}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl"
      >
        {loading ? "Kaydediliyor..." : "Şablonu Kaydet"}
      </button>

    </div>
  );
}