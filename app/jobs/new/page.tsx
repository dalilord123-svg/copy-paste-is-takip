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
  color?: string | null;
};

type Template = {
  id: string;
  name: string;

  steps: {
    id: string;

    station: {
      id: string;
      name: string;
    };

    stepOrder: number;

    enabled: boolean;

    estimatedMinutes: number;

    requirePhotoCount: number;

    requireFile: boolean;

    requireNote: boolean;
  }[];
};

type Step = {
  stationId: string;

  stationName: string;

  enabled: boolean;

  stepOrder: number;

  employeeIds: string[];

  estimatedMinutes: number;

  requirePhotoCount: number;

  requireFile: boolean;

  requireNote: boolean;
};

export default function NewJobPage() {
    const router = useRouter();

  //-----------------------------------
  // Form
  //-----------------------------------

  const [customerId, setCustomerId] = useState("");

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [priority, setPriority] =
    useState("NORMAL");

  const [deliveryDate, setDeliveryDate] =
    useState("");

  const [templateId, setTemplateId] =
    useState("");

  //-----------------------------------
  // Collections
  //-----------------------------------

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [stations, setStations] =
    useState<Station[]>([]);

  const [templates, setTemplates] =
    useState<Template[]>([]);

  //-----------------------------------
  // Production Flow
  //-----------------------------------

  const [steps, setSteps] =
    useState<Step[]>([]);

  //-----------------------------------
  // UI
  //-----------------------------------

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  //-----------------------------------
  // Search
  //-----------------------------------

  const [stationSearch, setStationSearch] =
    useState("");

  //-----------------------------------
  // Selected Template
  //-----------------------------------

  const selectedTemplate =
    templates.find(
      (x) => x.id === templateId
    ) ?? null;
      //--------------------------------------------------
  // İlk Yükleme
  //--------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        customersRes,
        employeesRes,
        stationsRes,
        templatesRes,
      ] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/employees"),
        fetch("/api/stations"),
        fetch("/api/templates"),
      ]);

      if (
        !customersRes.ok ||
        !employeesRes.ok ||
        !stationsRes.ok ||
        !templatesRes.ok
      ) {
        throw new Error("Veriler yüklenemedi.");
      }

      const customersData = await customersRes.json();
const employeesData = await employeesRes.json();
const stationsData = await stationsRes.json();
const templatesData = await templatesRes.json();

setCustomers(customersData.customers ?? customersData);

setEmployees(employeesData.employees ?? employeesData);

setStations(stationsData.stations ?? stationsData);

setTemplates(templatesData.templates ?? templatesData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  //--------------------------------------------------
  // Template Değişince Üretim Akışı Oluştur
  //--------------------------------------------------

  useEffect(() => {
    if (!selectedTemplate) {
      setSteps([]);
      return;
    }

    const templateSteps = [...selectedTemplate.steps]
      .sort((a, b) => a.stepOrder - b.stepOrder)
      .map((step) => ({
        stationId: step.station.id,

        stationName: step.station.name,

        enabled: step.enabled,

        stepOrder: step.stepOrder,

        employeeIds: [],

        estimatedMinutes:
          step.estimatedMinutes,

        requirePhotoCount:
          step.requirePhotoCount,

        requireFile:
          step.requireFile,

        requireNote:
          step.requireNote,
      }));

    setSteps(templateSteps);
  }, [selectedTemplate]);

  //--------------------------------------------------
  // Loading
  //--------------------------------------------------

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <div className="rounded-xl border p-8 text-center">
          Yükleniyor...
        </div>
      </main>
    );
  }
    //--------------------------------------------------
  // Step Güncelle
  //--------------------------------------------------

  function updateStep(
    index: number,
    field: keyof Step,
    value: any
  ) {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index
          ? {
              ...step,
              [field]: value,
            }
          : step
      )
    );
  }

  //--------------------------------------------------
  // Personel Seç
  //--------------------------------------------------

  function toggleEmployee(
    stepIndex: number,
    employeeId: string
  ) {
    setSteps((prev) =>
      prev.map((step, index) => {
        if (index !== stepIndex) return step;

        const exists =
          step.employeeIds.includes(employeeId);

        return {
          ...step,
          employeeIds: exists
            ? step.employeeIds.filter(
                (x) => x !== employeeId
              )
            : [...step.employeeIds, employeeId],
        };
      })
    );
  }

  //--------------------------------------------------
  // İstasyon Sil
  //--------------------------------------------------

  function removeStep(index: number) {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, i) => ({
          ...step,
          stepOrder: i + 1,
        }))
    );
  }

  //--------------------------------------------------
  // Yukarı Taşı
  //--------------------------------------------------

  function moveUp(index: number) {
    if (index === 0) return;

    const list = [...steps];

    [list[index - 1], list[index]] = [
      list[index],
      list[index - 1],
    ];

    setSteps(
      list.map((step, i) => ({
        ...step,
        stepOrder: i + 1,
      }))
    );
  }

  //--------------------------------------------------
  // Aşağı Taşı
  //--------------------------------------------------

  function moveDown(index: number) {
    if (index >= steps.length - 1) return;

    const list = [...steps];

    [list[index], list[index + 1]] = [
      list[index + 1],
      list[index],
    ];

    setSteps(
      list.map((step, i) => ({
        ...step,
        stepOrder: i + 1,
      }))
    );
  }

  //--------------------------------------------------
  // Yeni İstasyon Ekle
  //--------------------------------------------------

  function addStation(stationId: string) {
    const station =
      stations.find((x) => x.id === stationId);

    if (!station) return;

    const exists =
      steps.some(
        (x) => x.stationId === station.id
      );

    if (exists) {
      alert("Bu istasyon zaten ekli.");
      return;
    }

    setSteps((prev) => [
      ...prev,
      {
        stationId: station.id,

        stationName: station.name,

        enabled: true,

        stepOrder: prev.length + 1,

        employeeIds: [],

        estimatedMinutes: 60,

        requirePhotoCount: 0,

        requireFile: false,

        requireNote: false,
      },
    ]);

    setStationSearch("");
  }
    //--------------------------------------------------
  // Kaydet
  //--------------------------------------------------

  async function save() {
    try {
      setSaving(true);
      setError("");

      if (!customerId) {
        throw new Error("Müşteri seçiniz.");
      }

      if (!title.trim()) {
        throw new Error("İş adı giriniz.");
      }

      if (!templateId) {
        throw new Error("Şablon seçiniz.");
      }

      if (steps.length === 0) {
        throw new Error("Üretim akışı boş.");
      }

      const response = await fetch("/api/jobs", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          customerId,

          title,

          description,

          priority,

          deliveryDate,

          templateId,

          steps,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
            "İş oluşturulamadı."
        );
      }

      router.push(`/jobs/${result.id}`);

      router.refresh();
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ??
          "Bir hata oluştu."
      );
    } finally {
      setSaving(false);
    }
  }
    //--------------------------------------------------
  // UI
  //--------------------------------------------------

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Yeni İş Oluştur
          </h1>

          <p className="mt-2 text-gray-500">
            Müşteri seçin, üretim akışını oluşturun ve işi kaydedin.
          </p>

        </div>

      </div>

      {error && (

        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">

          {error}

        </div>

      )}

      <div className="rounded-xl border bg-white p-6">

        <h2 className="mb-6 text-xl font-bold">
          İş Bilgileri
        </h2>

        <div className="grid gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Müşteri
            </label>

            <select
              value={customerId}
              onChange={(e) =>
                setCustomerId(e.target.value)
              }
              className="w-full rounded-lg border p-3"
            >

              <option value="">
                Müşteri Seçiniz
              </option>

              {customers.map((customer) => (

                <option
                  key={customer.id}
                  value={customer.id}
                >
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
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full rounded-lg border p-3"
              placeholder="Örn: Kutu Harf Tabela"
            />

          </div>

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-medium">
              Açıklama
            </label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full rounded-lg border p-3"
              placeholder="İş açıklaması..."
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Öncelik
            </label>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
              className="w-full rounded-lg border p-3"
            >

              <option value="DUSUK">
                Düşük
              </option>

              <option value="NORMAL">
                Normal
              </option>

              <option value="YUKSEK">
                Yüksek
              </option>

              <option value="ACIL">
                Acil
              </option>

            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Teslim Tarihi
            </label>

            <input
              type="date"
              value={deliveryDate}
              onChange={(e) =>
                setDeliveryDate(e.target.value)
              }
              className="w-full rounded-lg border p-3"
            />

          </div>

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-medium">
              Şablon
            </label>

            <select
              value={templateId}
              onChange={(e) =>
                setTemplateId(e.target.value)
              }
              className="w-full rounded-lg border p-3"
            >

              <option value="">
                Şablon Seçiniz
              </option>

              {templates.map((template) => (

                <option
                  key={template.id}
                  value={template.id}
                >
                  {template.name}
                </option>

              ))}

            </select>

          </div>

        </div>

      </div>

      <div className="rounded-xl border bg-white p-6">

        <h2 className="mb-6 text-xl font-bold">
          Üretim Akışı
        </h2>
                <div className="mb-6">

          <input
            type="text"
            placeholder="İstasyon ara..."
            value={stationSearch}
            onChange={(e) =>
              setStationSearch(e.target.value)
            }
            className="mb-4 w-full rounded-lg border p-3"
          />

          <div className="flex flex-wrap gap-2">

            {stations
              .filter((station) =>
                station.name
                  .toLowerCase()
                  .includes(
                    stationSearch.toLowerCase()
                  )
              )
              .map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() =>
                    addStation(station.id)
                  }
                  className="rounded-lg border px-4 py-2 hover:bg-gray-100"
                >
                  + {station.name}
                </button>
              ))}

          </div>

        </div>

        <div className="space-y-6">

          {steps.map((step, index) => (

            <div
              key={index}
              className="rounded-xl border p-5"
            >

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <div className="text-lg font-bold">

                    {step.stepOrder}. {step.stationName}

                  </div>

                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      moveUp(index)
                    }
                    className="rounded border px-3 py-1"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      moveDown(index)
                    }
                    className="rounded border px-3 py-1"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeStep(index)
                    }
                    className="rounded border border-red-300 px-3 py-1 text-red-600"
                  >
                    Sil
                  </button>

                </div>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className="mb-2 block font-medium">
                    Tahmini Süre (dk)
                  </label>

                  <input
                    type="number"
                    value={step.estimatedMinutes}
                    onChange={(e) =>
                      updateStep(
                        index,
                        "estimatedMinutes",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border p-3"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-medium">
                    Fotoğraf Zorunlu
                  </label>

                  <input
                    type="number"
                    value={step.requirePhotoCount}
                    onChange={(e) =>
                      updateStep(
                        index,
                        "requirePhotoCount",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border p-3"
                  />

                </div>

              </div>

              <div className="mt-5 flex gap-6">

                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={step.requireFile}
                    onChange={(e) =>
                      updateStep(
                        index,
                        "requireFile",
                        e.target.checked
                      )
                    }
                  />

                  Dosya Zorunlu

                </label>

                <label className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    checked={step.requireNote}
                    onChange={(e) =>
                      updateStep(
                        index,
                        "requireNote",
                        e.target.checked
                      )
                    }
                  />

                  Not Zorunlu

                </label>

              </div>

              <div className="mt-6">

                <div className="mb-3 font-semibold">

                  Personeller

                </div>

                <div className="flex flex-wrap gap-2">

                  {employees.map((employee) => (

                    <button
                      key={employee.id}
                      type="button"
                      onClick={() =>
                        toggleEmployee(
                          index,
                          employee.id
                        )
                      }
                      className={`rounded-lg border px-3 py-2 ${
                        step.employeeIds.includes(
                          employee.id
                        )
                          ? "bg-blue-600 text-white"
                          : "bg-white"
                      }`}
                    >
                      {employee.name}
                    </button>

                  ))}

                </div>

              </div>

            </div>

          ))}

        </div>
              </div>

      <div className="flex justify-end gap-4">

        <button
          type="button"
          onClick={() => router.push("/jobs")}
          className="rounded-lg border px-6 py-3 hover:bg-gray-100"
        >
          İptal
        </button>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "İşi Oluştur"}
        </button>

      </div>

    </main>
  );
}