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
  leaderId: string;
  employeeIds: string[];
};

export default function NewJobPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [priority, setPriority] = useState("NORMAL");

  const [steps, setSteps] = useState<JobStep[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const responses = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/employees"),
          fetch("/api/templates"),
        ]);

        for (const response of responses) {
          if (!response.ok) {
            throw new Error("Veriler yüklenemedi.");
          }
        }

        const [customerData, employeeData, templateData] =
          await Promise.all(
            responses.map((response) => response.json())
          );

        const customerList = Array.isArray(customerData)
          ? customerData
          : customerData.customers ?? [];

        const employeeList = Array.isArray(employeeData)
          ? employeeData
          : employeeData.employees ?? [];

        const templateList = Array.isArray(templateData)
          ? templateData
          : templateData.templates ?? [];

        setCustomers(customerList);
        setEmployees(employeeList);
        setTemplates(templateList);
      } catch (err) {
        console.error(err);
        setError("Müşteri, personel veya şablon bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function selectTemplate(id: string) {
    setTemplateId(id);

    const template = templates.find((item) => item.id === id);

    if (!template) {
      setSteps([]);
      return;
    }

    const sortedSteps = [...template.steps].sort(
      (a, b) => a.stepOrder - b.stepOrder
    );

    setSteps(
      sortedSteps.map((step) => ({
        stationId: step.station.id,
        stationName: step.station.name,
        leaderId: "",
        employeeIds: [],
      }))
    );
  }

  function setLeader(index: number, leaderId: string) {
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index
          ? { ...step, leaderId }
          : step
      )
    );
  }

  function toggleEmployee(index: number, employeeId: string) {
    setSteps((current) =>
      current.map((step, stepIndex) => {
        if (stepIndex !== index) {
          return step;
        }

        const selected = step.employeeIds.includes(employeeId);

        return {
          ...step,
          employeeIds: selected
            ? step.employeeIds.filter((id) => id !== employeeId)
            : [...step.employeeIds, employeeId],
        };
      })
    );
  }

  async function save() {
    if (saving) return;

    setError("");

    if (!customerId) {
      setError("Lütfen müşteri seçin.");
      return;
    }

    if (!title.trim()) {
      setError("Lütfen iş adını girin.");
      return;
    }

    if (!templateId) {
      setError("Lütfen üretim şablonu seçin.");
      return;
    }

    if (steps.length === 0) {
      setError("Seçilen şablonda üretim adımı bulunmuyor.");
      return;
    }

    for (const step of steps) {
      if (!step.leaderId) {
        setError(`${step.stationName} için ustabaşı seçin.`);
        return;
      }

      if (step.employeeIds.length === 0) {
        setError(`${step.stationName} için en az bir personel seçin.`);
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          title: title.trim(),
          templateId,
          deliveryDate: deliveryDate || null,
          priority,
          steps,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || "İş oluşturulamadı.");
      }

      alert("İş başarıyla oluşturuldu.");
      router.push("/jobs");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "İş oluşturulurken hata oluştu."
      );
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
        <h1 className="text-3xl font-bold">
          Yeni İş
        </h1>

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

      <section className="grid grid-cols-1 gap-4 rounded-xl border p-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Müşteri
          </label>

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
          <label className="mb-2 block text-sm font-medium">
            İş Adı
          </label>

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
            Teslim Tarihi
          </label>

          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Öncelik
          </label>

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
        <h2 className="text-2xl font-bold">
          Üretim Akışı ve Personel Atama
        </h2>

        {steps.length === 0 && (
          <div className="rounded-xl border p-5 text-gray-500">
            Üretim adımlarını görmek için bir şablon seçin.
          </div>
        )}

        {steps.map((step, index) => (
          <div
            key={`${step.stationId}-${index}`}
            className="space-y-4 rounded-xl border p-5"
          >
            <h3 className="text-lg font-bold">
              {index + 1}. {step.stationName}
            </h3>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Ustabaşı
              </label>

              <select
                value={step.leaderId}
                onChange={(e) => setLeader(index, e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                <option value="">Ustabaşı Seç</option>

                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-3 font-medium">
                Görevli Personeller
              </div>

              {employees.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aktif personel bulunamadı.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {employees.map((employee) => (
                    <label
                      key={employee.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                    >
                      <input
                        type="checkbox"
                        checked={step.employeeIds.includes(employee.id)}
                        onChange={() =>
                          toggleEmployee(index, employee.id)
                        }
                        className="h-4 w-4"
                      />

                      <span>{employee.name}</span>
                    </label>
                  ))}
                </div>
              )}

              <p className="mt-2 text-sm text-gray-500">
                Seçilen personel: {step.employeeIds.length}
              </p>
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