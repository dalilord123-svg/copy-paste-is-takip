
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import StationEditor, {
  TemplateStepRow,
} from "@/components/templates/StationEditor";

interface TemplateData {
  id: string;
  name: string;
  description: string | null;
  steps: {
    id: string;
    stationId: string;
  }[];
}

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<TemplateStepRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadTemplate() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/templates/${id}`, {
          cache: "no-store",
        });

        const contentType = response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          throw new Error(
            `API JSON yerine HTML döndürdü. HTTP ${response.status}. API dosya yolunu kontrol edin.`
          );
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Şablon yüklenemedi.");
        }

        const template = data.template ?? data;

        setName(template.name || "");
        setDescription(template.description || "");

        setRows(
          (template.steps || []).map(
            (
              step: { id: string; stationId: string },
              index: number
            ) => ({
              id: index + 1,
              stationId: step.stationId,
            })
          )
        );
      } catch (err) {
        console.error("Şablon yükleme hatası:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Şablon yüklenirken hata oluştu."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTemplate();
  }, [id]);

  async function saveTemplate() {
    if (!name.trim()) {
      alert("Şablon adı zorunludur.");
      return;
    }

    if (rows.length === 0) {
      alert("En az bir istasyon eklemelisiniz.");
      return;
    }

    if (rows.some((row) => !row.stationId)) {
      alert("Lütfen tüm istasyonları seçiniz.");
      return;
    }

    if (
      new Set(rows.map((row) => row.stationId)).size !== rows.length
    ) {
      alert("Aynı istasyonu birden fazla kez ekleyemezsiniz.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          steps: rows.map((row) => ({
            stationId: row.stationId,
          })),
        }),
      });

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        throw new Error(
          `API JSON yerine HTML döndürdü. HTTP ${response.status}.`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Şablon güncellenemedi.");
      }

      alert("Şablon başarıyla güncellendi.");

      router.push("/templates");
      router.refresh();
    } catch (err) {
      console.error("Şablon güncelleme hatası:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Güncelleme sırasında hata oluştu."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <p className="text-gray-500">Şablon yükleniyor...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>

        <Link
          href="/templates"
          className="inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Şablonlara dön
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Şablonu Düzenle
          </h1>

          <p className="text-gray-500 mt-2">
            Şablon bilgilerini ve üretim sırasını güncelleyin.
          </p>
        </div>

        <Link
          href="/templates"
          className="rounded-xl border px-5 py-3 hover:bg-gray-100"
        >
          Geri
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow space-y-6">
        <div>
          <label className="mb-2 block font-semibold">
            Şablon Adı
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Şablon adı"
            className="w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Açıklama
          </label>

          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Şablon açıklaması..."
            className="w-full rounded-xl border p-3"
          />
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-8 shadow">
        <h2 className="mb-2 text-2xl font-bold">
          Üretim İstasyonları
        </h2>

        <p className="mb-6 text-gray-500">
          İstasyonları ekleyin ve üretim sırasını belirleyin.
        </p>

        <StationEditor
          rows={rows}
          setRows={setRows}
        />
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Link
          href="/templates"
          className="rounded-xl border px-6 py-3 hover:bg-gray-100"
        >
          İptal
        </Link>

        <button
          type="button"
          onClick={saveTemplate}
          disabled={saving}
          className="rounded-xl bg-green-600 px-8 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </main>
  );
}
