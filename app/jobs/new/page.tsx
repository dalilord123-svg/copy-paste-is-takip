"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = {
  id: string;
  company: string;
};

type Employee = {
  id: string;
  name: string;
};

type Station = {
  id: string;
  name: string;
};

type TemplateStep = {
  id: string;
  stepOrder: number;
  estimatedMinutes: number;
  requirePhotoCount: number;
  requireFile: boolean;
  requireNote: boolean;
  station: Station;
};

type Template = {
  id: string;
  name: string;
  steps: TemplateStep[];
};

type JobStep = {
  stationId: string;
  stationName: string;
  employeeIds: string[];
  enabled: boolean;
  stepOrder: number;
  estimatedMinutes: number;
  requirePhotoCount: number;
  requireFile: boolean;
  requireNote: boolean;
};

export default function NewJobPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [title, setTitle] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [priority, setPriority] = useState("NORMAL");

  const [steps, setSteps] = useState<JobStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadList<T>(
      url: string,
      key: string,
      label: string
    ): Promise<T[]> {
      const response = await fetch(url, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`${label}: HTTP ${response.status}`);
      }

      const result = await response.json();

      if (Array.isArray(result)) return result;
      if (Array.isArray(result?.[key])) return result[key];
      if (Array.isArray(result?.data)) return result.data;
      if (Array.isArray(result?.data?.[key])) return result.data[key];

      throw new Error(`${label}: Liste formatı hatalı.`);
    }

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [customersData, employeesData, templatesData] =
          await Promise.all([
            loadList<Customer>("/api/customers", "customers", "Müşteriler"),
            loadList<Employee>("/api/employees", "employees", "Personeller"),
            loadList<Template>("/api/templates", "templates", "Şablonlar"),
          ]);

        if (cancelled) return;

        setCustomers(customersData);
        setEmployees(employeesData);
        setTemplates(
          templatesData.map((template) => ({
            ...template,
            steps: [...template.steps].sort(
              (a, b) => a.stepOrder - b.stepOrder
            ),
          }))
        );
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Veriler yüklenemedi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  function selectTemplate(id: string) {
    setTemplateId(id);

    const template = templates.find((t) => t.id === id);

    if (!template) {
      setSteps([]);
      return;
    }

    const sorted = [...template.steps].sort(
      (a, b) => a.stepOrder - b.stepOrder
    );

    setSteps(
      sorted.map((step) => ({
        stationId: step.station.id,
        stationName: step.station.name,
        employeeIds: [],
        enabled: true,
        stepOrder: step.stepOrder,
        estimatedMinutes: step.estimatedMinutes,
        requirePhotoCount: step.requirePhotoCount,
        requireFile: step.requireFile,
        requireNote: step.requireNote,
      }))
    );
  }

  function updateStep(index: number, data: Partial<JobStep>) {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, ...data } : step))
    );
  }

  async function save() {
    if (!customerId) {
      alert("Lütfen müşteri seçiniz.");
      return;
    }

    if (!title.trim()) {
      alert("Lütfen iş adı giriniz.");
      return;
    }

    const enabledSteps = steps
      .filter((step) => step.enabled)
      .sort((a, b) => a.stepOrder - b.stepOrder);

    if (enabledSteps.length === 0) {
      alert("En az bir üretim istasyonu seçmelisiniz.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          title,
          description: "",
          templateId,
          leaderId,
          priority,
          deliveryDate,
          steps: enabledSteps.map((step) => ({
  stationId: step.stationId,
  employeeIds: step.employeeIds,
  enabled: step.enabled,
  stepOrder: step.stepOrder,
  estimatedMinutes: step.estimatedMinutes,
  requirePhotoCount: step.requirePhotoCount,
  requireFile: step.requireFile,
  requireNote: step.requireNote,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || "İş oluşturulamadı.");
      }

      const job = await response.json();

      router.push(`/jobs/${job.id}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "İş oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <p>Veriler yükleniyor...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Yeni İş</h1>

        <button
          type="button"
          onClick={() => router.push("/jobs")}
          className="rounded-lg border px-5 py-3"
        >
          ← İşlere Dön
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 rounded-xl border p-5 md:grid-cols-2 bg-white">
        <div>
          <label className="mb-2 block text-sm font-medium">Müşteri</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option value="">Müşteri Seç</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.company}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">İş Adı</label>
          <input
            type="text"
            placeholder="İş adını girin"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Üretim Şablonu
          </label>
          <select
            value={templateId}
            onChange={(e) => selectTemplate(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option value="">Şablon Seç</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Genel Ustabaşı
          </label>
          <select
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option value="">Genel Ustabaşı Seç</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>

          <p className="mt-1 text-xs text-gray-500">
            Seçilen ustabaşı bütün üretim kademelerinden sorumludur.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Teslim Tarihi</label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Öncelik</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            <option value="DUSUK">Düşük</option>
            <option value="NORMAL">Normal</option>
            <option value="YUKSEK">Yüksek</option>
            <option value="ACIL">Acil</option>
          </select>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-bold">Üretim Akışı ve Personel Atama</h2>

        {steps.length === 0 && (
          <div className="rounded-xl border p-5 text-gray-500 bg-white">
            Üretim adımlarını görmek için bir şablon seçin.
          </div>
        )}

        {steps.map((step, index) => (
          <div
            key={`${step.stationId}-${index}`}
            className="space-y-4 rounded-xl border p-5 bg-white"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {index + 1}. {step.stationName}
              </h3>

              <button
                type="button"
                onClick={() =>
                  setSteps(steps.filter((_, i) => i !== index))
                }
                className="text-red-600 hover:text-red-800"
              >
                Kaldır
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm">Sıra</label>
                <input
                  type="number"
                  value={step.stepOrder}
                  onChange={(e) =>
                    updateStep(index, {
                      stepOrder: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-sm">Süre</label>
                <input
                  type="number"
                  value={step.estimatedMinutes}
                  onChange={(e) =>
                    updateStep(index, {
                      estimatedMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="text-sm">Fotoğraf</label>
                <input
                  type="number"
                  value={step.requirePhotoCount}
                  onChange={(e) =>
                    updateStep(index, {
                      requirePhotoCount: Number(e.target.value),
                    })
                  }
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div className="flex items-end">
                <label className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={step.requireFile}
                    onChange={(e) =>
                      updateStep(index, {
                        requireFile: e.target.checked,
                      })
                    }
                  />
                  Dosya
                </label>
              </div>

              <div className="flex items-end">
                <label className="flex gap-2">
                  <input
                    type="checkbox"
                    checked={step.requireNote}
                    onChange={(e) =>
                      updateStep(index, {
                        requireNote: e.target.checked,
                      })
                    }
                  />
                  Not
                </label>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium mb-2">
                Personeller
              </label>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {employees.map((employee) => {
                  const checked = step.employeeIds.includes(employee.id);

                  return (
                    <label
                      key={employee.id}
                      className="flex items-center gap-2 border rounded-lg p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateStep(index, {
                              employeeIds: [
                                ...step.employeeIds,
                                employee.id,
                              ],
                            });
                          } else {
                            updateStep(index, {
                              employeeIds: step.employeeIds.filter(
                                (id) => id !== employee.id
                              ),
                            });
                          }
                        }}
                      />
                      <span>{employee.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </section>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {saving ? "İş Oluşturuluyor..." : "İşi Oluştur"}
      </button>
    </main>
  );
}