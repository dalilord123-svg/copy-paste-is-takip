"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import StationEditor, {
  TemplateStepRow,
} from "@/components/templates/StationEditor";

export default function NewTemplatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [rows, setRows] = useState<TemplateStepRow[]>([]);

  const [saving, setSaving] = useState(false);

  async function saveTemplate() {
    if (!name.trim()) {
      alert("Şablon adı zorunludur.");
      return;
    }

    if (rows.length === 0) {
      alert("En az bir istasyon eklemelisiniz.");
      return;
    }

    if (rows.some((x) => x.stationId === "")) {
      alert("Lütfen tüm istasyonları seçiniz.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          steps: rows,
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        alert(error.message);

        setSaving(false);
        return;
      }

      alert("Şablon başarıyla oluşturuldu.");

      router.push("/templates");
      router.refresh();

    } catch (err) {
      console.error(err);

      alert("Bir hata oluştu.");
    }

    setSaving(false);
  }

  return (
    <main className="max-w-6xl mx-auto p-6">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Yeni Şablon
          </h1>

          <p className="text-gray-500 mt-2">
            Yeni üretim şablonu oluşturun.
          </p>

        </div>

        <Link
          href="/templates"
          className="border rounded-xl px-5 py-3"
        >
          Geri
        </Link>

      </div>      <div className="bg-white rounded-2xl shadow p-8 space-y-6">

        <div>

          <label className="block mb-2 font-semibold">
            Şablon Adı
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Araç Giydirme"
            className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <div>

          <label className="block mb-2 font-semibold">
            Açıklama
          </label>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Şablon açıklaması..."
            className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

      </div>

      <div className="mt-8 bg-white rounded-2xl shadow p-8">

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="text-2xl font-bold">
              Üretim İstasyonları
            </h2>

            <p className="text-gray-500 mt-1">
              İşin üretim sırasını oluşturun.
            </p>

          </div>

        </div>

        <StationEditor
          rows={rows}
          setRows={setRows}
        />

      </div>      <div className="mt-8 flex justify-end gap-4">

        <Link
          href="/templates"
          className="px-6 py-3 border rounded-xl hover:bg-gray-100 transition"
        >
          İptal
        </Link>

        <button
          type="button"
          onClick={saveTemplate}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl transition"
        >
          {saving ? "Kaydediliyor..." : "Şablonu Kaydet"}
        </button>

      </div>

    </main>  );
}