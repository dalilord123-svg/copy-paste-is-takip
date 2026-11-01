"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomerSelect from "./CustomerSelect";

type Props = {
  job: any;
};

const statuses = [
  "BEKLIYOR",
  "TASARIM",
  "BASKI",
  "KESIM",
  "MONTAJ",
  "TAMAMLANDI",
  "TESLIM",
];

export default function JobEditForm({ job }: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState(job.customerId ?? "");
  const [title, setTitle] = useState(job.title ?? "");
  const [description, setDescription] = useState(job.description ?? "");
  const [width, setWidth] = useState(job.width ? String(job.width) : "");
  const [height, setHeight] = useState(job.height ? String(job.height) : "");
  const [quantity, setQuantity] = useState(job.quantity ? String(job.quantity) : "");
  const [material, setMaterial] = useState(job.material ?? "");
  const [machine, setMachine] = useState(job.machine ?? "");
  const [deliveryDate, setDeliveryDate] = useState(
    job.deliveryDate
      ? new Date(job.deliveryDate).toISOString().split("T")[0]
      : ""
  );
  const [status, setStatus] = useState(job.status ?? "BEKLIYOR");

  async function saveJob(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          title,
          description,
          width,
          height,
          quantity,
          material,
          machine,
          deliveryDate,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      router.push(`/jobs/${job.id}`);
      router.refresh();
    } catch {
      alert("İş güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveJob} className="space-y-6">
      <CustomerSelect
        value={customerId}
        onChange={setCustomerId}
      />

      <div>
        <label className="block mb-2 font-semibold">
          İş Adı
        </label>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-3"
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
          className="w-full border rounded-lg p-3"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <input
          placeholder="En"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          className="border rounded-lg p-3"
        />

        <input
          placeholder="Boy"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="border rounded-lg p-3"
        />

        <input
          placeholder="Adet"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="border rounded-lg p-3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Malzeme"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="border rounded-lg p-3"
        />

        <input
          placeholder="Makine"
          value={machine}
          onChange={(e) => setMachine(e.target.value)}
          className="border rounded-lg p-3"
        />
      </div>

      <input
        type="date"
        value={deliveryDate}
        onChange={(e) => setDeliveryDate(e.target.value)}
        className="w-full border rounded-lg p-3"
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full border rounded-lg p-3"
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 text-white px-8 py-3 rounded-lg"
        >
          {saving ? "Kaydediliyor..." : "Güncelle"}
        </button>

        <button
          type="button"
          onClick={() => router.push(`/jobs/${job.id}`)}
          className="bg-gray-500 text-white px-8 py-3 rounded-lg"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}