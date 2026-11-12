
"use client";

import { useEffect, useState } from "react";

const settingItems = [
  { key: "jobs", label: "İşler" },
  { key: "production", label: "Üretim" },
  { key: "employees", label: "Personeller" },
  { key: "customers", label: "Müşteriler" },
  { key: "deliveries", label: "Teslimatlar" },
  { key: "reports", label: "Raporlar" },
  { key: "photos", label: "Fotoğraflar" },
  { key: "files", label: "Dosyalar" },
  { key: "notes", label: "Notlar" },
  { key: "calendar", label: "Takvim" },
] as const;

type SettingKey = (typeof settingItems)[number]["key"];
type Settings = Record<SettingKey, boolean>;

const defaultSettings: Settings = {
  jobs: true,
  production: true,
  employees: true,
  customers: true,
  deliveries: true,
  reports: true,
  photos: false,
  files: false,
  notes: false,
  calendar: false,
};

export default function DashboardSettingPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/dashboard/setting");
        if (!response.ok) {
          throw new Error("Ayarlar yüklenemedi.");
        }

        const data = await response.json();

        setSettings((current) => {
          const updated = { ...current };

          for (const item of settingItems) {
            if (typeof data[item.key] === "boolean") {
              updated[item.key] = data[item.key];
            }
          }

          return updated;
        });
      } catch (error) {
        console.error(error);
        setMessage("Ayarlar yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function toggleSetting(key: SettingKey) {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  async function saveSettings() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/dashboard/setting", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ayarlar kaydedilemedi.");
      }

      setMessage("Ayarlar başarıyla kaydedildi.");
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Ayarlar kaydedilemedi."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Gösterge Paneli Ayarları
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Gösterge panelinde görünmesini istediğiniz bölümleri seçin.
          </p>
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          {loading ? (
            <p className="py-8 text-center text-gray-500">
              Ayarlar yükleniyor...
            </p>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {settingItems.map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-center justify-between gap-4 py-4"
                  >
                    <span className="font-medium text-gray-800">
                      {item.label}
                    </span>

                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={() => toggleSetting(item.key)}
                      className="h-5 w-5 cursor-pointer accent-blue-600"
                    />
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
              </button>

              {message && (
                <p className="mt-4 text-center text-sm text-gray-700">
                  {message}
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
