"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = { id: string; company: string };
type Employee = { id: string; name: string };
type Station = {
  id: string;
  name: string;
  sortOrder?: number;
  requirePhotoCount?: number;
  requireFile?: boolean;
  requireNote?: boolean;
  estimatedMinutes?: number;
};
type TemplateStep = {
  id: string;
  stepOrder: number;
  station: Station;
  estimatedMinutes?: number;
  requirePhotoCount?: number;
  requireFile?: boolean;
  requireNote?: boolean;
};
type Template = { id: string; name: string; steps: TemplateStep[] };
type JobStep = {
  stationId: string;
  stationName: string;
  employeeIds: string[];
  estimatedMinutes: number;
};

export default function NewJobPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
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
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const responses = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/employees"),
          fetch("/api/templates"),
          fetch("/api/stations"),
        ]);
        for (const response of responses) {
          if (!response.ok) throw new Error("Veriler yüklenemedi.");
        }
        const [customerData, employeeData, templateData, stationData] =
          await Promise.all(responses.map((response) => response.json()));

        const customerList = Array.isArray(customerData)
          ? customerData
          : customerData.customers ?? [];
        const employeeList = Array.isArray(employeeData)
          ? employeeData
          : employeeData.employees ?? [];
        const templateList = Array.isArray(templateData)
          ? templateData
          : templateData.templates ?? [];
        const stationList = Array.isArray(stationData)
          ? stationData
          : stationData.stations ?? [];

        setCustomers(customerList);
        setEmployees(employeeList);
        setTemplates(templateList);
        setStations(stationList);
      } catch (err) {
        console.error(err);
        setError("Müşteri, personel, şablon veya kademe bilgileri yüklenemedi.");
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
    setSteps(
      [...template.steps]
        .sort((a, b) => a.stepOrder - b.stepOrder)
        .map((step) => ({
          stationId: step.station.id,
          stationName: step.station.name,
          employeeIds: [],
          estimatedMinutes: step.estimatedMinutes ?? step.station.estimatedMinutes ?? 0,
        }))
    );
  }

  function updateStep(index: number, changes: Partial<JobStep>) {
    setSteps((current) =>
      current.map((step, i) => (i === index ? { ...step, ...changes } : step))
    );
  }

  function changeStation(index: number, stationId: string) {
    const station = stations.find((item) => item.id === stationId);
    if (!station) return;
    updateStep(index, {
      stationId: station.id,
      stationName: station.name,
      estimatedMinutes: station.estimatedMinutes ?? 0,
    });
  }

  function addStep() {
    const available = stations.find((station) => !steps.some((step) => step.stationId === station.id));
    if (!available) {
      setError("Eklenebilecek başka aktif kademe bulunmuyor. Aynı kademeyi bir işte yalnızca bir kez kullanabilirsiniz.");
      return;
    }
    setError("");
    setSteps((current) => [
      ...current,
      {
        stationId: available.id,
        stationName: available.name,
        employeeIds: [],
        estimatedMinutes: available.estimatedMinutes ?? 0,
      },
    ]);
  }

  function removeStep(index: number) {
    setSteps((current) => current.filter((_, i) => i !== index));
  }

  function moveStep(index: number, direction: -1 | 1) {
    setSteps((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleEmployee(index: number, employeeId: string) {
    const step = steps[index];
    const selected = step.employeeIds.includes(employeeId);
    updateStep(index, {
      employeeIds: selected
        ? step.employeeIds.filter((id) => id !== employeeId)
        : [...step.employeeIds, employeeId],
    });
  }

  async function save() {
    if (saving) return;
    setError("");
    if (!customerId) return setError("Lütfen müşteri seçin.");
    if (!title.trim()) return setError("Lütfen iş adını girin.");
    if (!templateId) return setError("Lütfen üretim şablonu seçin.");
    if (!leaderId) return setError("Lütfen genel ustabaşı seçin.");
    if (steps.length === 0) return setError("İş için en az bir üretim kademesi ekleyin.");

    const stationIds = steps.map((step) => step.stationId);
    if (new Set(stationIds).size !== stationIds.length) {
      return setError("Aynı üretim kademesini bir işte birden fazla kullanamazsınız.");
    }
    for (const step of steps) {
      if (step.employeeIds.length === 0) {
        return setError(`${step.stationName} için en az bir personel seçin.`);
      }
    }

    try {
      setSaving(true);
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          title: title.trim(),
          templateId,
          leaderId,
          deliveryDate: deliveryDate || null,
          priority,
          steps: steps.map((step) => ({
            stationId: step.stationId,
            stationName: step.stationName,
            employeeIds: step.employeeIds,
            estimatedMinutes: step.estimatedMinutes,
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || "İş oluşturulamadı.");
      alert("İş başarıyla oluşturuldu.");
      router.push("/jobs");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "İş oluşturulurken hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-6xl p-8"><p>Veriler yükleniyor...</p></main>;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Yeni İş</h1>
        <button type="button" onClick={() => router.push("/jobs")} className="rounded-lg border px-5 py-3">← İşlere Dön</button>
      </div>

      {error && <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="grid grid-cols-1 gap-4 rounded-xl border p-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Müşteri</label>
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full rounded-lg border p-3">
            <option value="">Müşteri Seç</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.company}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">İş Adı</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="İş adını girin" className="w-full rounded-lg border p-3" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Üretim Şablonu</label>
          <select value={templateId} onChange={(e) => selectTemplate(e.target.value)} className="w-full rounded-lg border p-3">
            <option value="">Şablon Seç</option>
            {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Genel Ustabaşı</label>
          <select value={leaderId} onChange={(e) => setLeaderId(e.target.value)} className="w-full rounded-lg border p-3">
            <option value="">Ustabaşı Seç</option>
            {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Teslim Tarihi</label>
          <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full rounded-lg border p-3" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Öncelik</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-lg border p-3">
            <option value="DUSUK">Düşük</option>
            <option value="NORMAL">Normal</option>
            <option value="YUKSEK">Yüksek</option>
            <option value="ACIL">Acil</option>
          </select>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">İşe Özel Üretim Akışı</h2>
            <p className="text-sm text-gray-500">Buradaki değişiklikler yalnızca bu işe kaydedilir; ana şablon değişmez.</p>
          </div>
          <button type="button" onClick={addStep} disabled={stations.length === 0 || steps.length >= stations.length} className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-50">+ Kademe Ekle</button>
        </div>

        {steps.length === 0 && <div className="rounded-xl border p-5 text-gray-500">Şablon seçin veya yeni kademe ekleyin.</div>}

        {steps.map((step, index) => {
          const otherStationIds = steps.filter((_, i) => i !== index).map((item) => item.stationId);
          return (
            <div key={`${step.stationId}-${index}`} className="space-y-4 rounded-xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold">{index + 1}. Kademe</h3>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => moveStep(index, -1)} disabled={index === 0} className="rounded border px-3 py-1 disabled:opacity-40">↑ Yukarı</button>
                  <button type="button" onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} className="rounded border px-3 py-1 disabled:opacity-40">↓ Aşağı</button>
                  <button type="button" onClick={() => removeStep(index)} className="rounded border border-red-300 px-3 py-1 text-red-700">Sil</button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Üretim Kademesi</label>
                <select value={step.stationId} onChange={(e) => changeStation(index, e.target.value)} className="w-full rounded-lg border p-3">
                  {stations.filter((station) => station.id === step.stationId || !otherStationIds.includes(station.id)).map((station) => (
                    <option key={station.id} value={station.id}>{station.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Tahmini Süre (dakika)</label>
                <input type="number" min="0" value={step.estimatedMinutes} onChange={(e) => updateStep(index, { estimatedMinutes: Math.max(0, Number(e.target.value) || 0) })} className="w-full rounded-lg border p-3" />
              </div>

              <div>
                <div className="mb-3 font-medium">Görevli Personeller</div>
                {employees.length === 0 ? <p className="text-sm text-gray-500">Aktif personel bulunamadı.</p> : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {employees.map((employee) => (
                      <label key={employee.id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                        <input type="checkbox" checked={step.employeeIds.includes(employee.id)} onChange={() => toggleEmployee(index, employee.id)} className="h-4 w-4" />
                        <span>{employee.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-500">Seçilen personel: {step.employeeIds.length}</p>
              </div>
            </div>
          );
        })}
      </section>

      <button type="button" onClick={save} disabled={saving} className="w-full rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
        {saving ? "İş Oluşturuluyor..." : "İşi Oluştur"}
      </button>
    </main>
  );
}
