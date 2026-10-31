"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomerSelect from "./CustomerSelect";

type Props = {
  defaultCustomerId?: string;
};

export default function JobForm({
  defaultCustomerId,
}: Props) {
  const router = useRouter();

  const [customerId, setCustomerId] = useState(
    defaultCustomerId ?? ""
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("");

  const [material, setMaterial] = useState("");
  const [machine, setMachine] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const [loading, setLoading] = useState(false);

  async function saveJob(e: React.FormEvent) {
    e.preventDefault();

    if (!customerId) {
      alert("Müşteri seçiniz.");
      return;
    }

    if (!title.trim()) {
      alert("İş adı zorunludur.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
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
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      alert("İş başarıyla oluşturuldu.");

      router.push("/jobs");
      router.refresh();
    } catch {
      alert("İş oluşturulamadı.");
    } finally {
      setLoading(false);
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
          placeholder="Örn: Cephe Giydirme"
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

        <div>
          <label className="block mb-2">
            En (cm)
          </label>

          <input
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">
            Boy (cm)
          </label>

          <input
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">
            Adet
          </label>

          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="block mb-2">
            Malzeme
          </label>

          <input
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="Vinil"
          />
        </div>

        <div>
          <label className="block mb-2">
            Makine
          </label>

          <input
            value={machine}
            onChange={(e) => setMachine(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="HP Latex"
          />
        </div>

      </div>

      <div>
        <label className="block mb-2">
          Teslim Tarihi
        </label>

        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className="w-full border rounded-lg p-3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg"
      >
        {loading
          ? "Kaydediliyor..."
          : "İşi Kaydet"}
      </button>

    </form>
  );
}