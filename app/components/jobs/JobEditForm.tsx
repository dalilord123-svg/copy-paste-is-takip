"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomerSelect from "./CustomerSelect";

type Props = {
  jobId: string;
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

export default function JobEditForm({
  jobId,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("");

  const [material, setMaterial] = useState("");
  const [machine, setMachine] = useState("");

  const [deliveryDate, setDeliveryDate] =
    useState("");

  const [status, setStatus] =
    useState("BEKLIYOR");

  useEffect(() => {
    loadJob();
  }, []);

  async function loadJob() {
    try {
      const res = await fetch(
        `/api/jobs/${jobId}`
      );

      if (!res.ok) {
        throw new Error();
      }

      const job = await res.json();

      setCustomerId(job.customerId);

      setTitle(job.title);

      setDescription(job.description || "");

      setWidth(
        job.width ? String(job.width) : ""
      );

      setHeight(
        job.height ? String(job.height) : ""
      );

      setQuantity(
        job.quantity
          ? String(job.quantity)
          : ""
      );

      setMaterial(job.material || "");

      setMachine(job.machine || "");

      setStatus(job.status);

      if (job.deliveryDate) {
        setDeliveryDate(
          new Date(job.deliveryDate)
            .toISOString()
            .split("T")[0]
        );
      }
    } catch {
      alert("İş yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  async function saveJob(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!customerId) {
      alert("Müşteri seçiniz.");
      return;
    }

    if (!title.trim()) {
      alert("İş adı zorunludur.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(
        `/api/jobs/${jobId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
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
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      alert("İş güncellendi.");

      router.push(`/jobs/${jobId}`);

      router.refresh();
    } catch {
      alert("İş güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        Yükleniyor...
      </div>
    );
  }

  return (
    <form
      onSubmit={saveJob}
      className="space-y-6"
    >
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
          onChange={(e) =>
            setTitle(e.target.value)
          }
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
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
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
            onChange={(e) =>
              setWidth(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">
            Boy (cm)
          </label>

          <input
            value={height}
            onChange={(e) =>
              setHeight(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">
            Adet
          </label>

          <input
            value={quantity}
            onChange={(e) =>
              setQuantity(
                e.target.value
              )
            }
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
            onChange={(e) =>
              setMaterial(e.target.value)
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2">
            Makine
          </label>

          <input
            value={machine}
            onChange={(e) =>
              setMachine(e.target.value)
            }
            className="w-full border rounded-lg p-3"
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
          onChange={(e) =>
            setDeliveryDate(
              e.target.value
            )
          }
          className="w-full border rounded-lg p-3"
        />

      </div>

      <div>

        <label className="block mb-2 font-semibold">
          Durum
        </label>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="w-full border rounded-lg p-3"
        >

          {statuses.map((item) => (

            <option
              key={item}
              value={item}
            >
              {item}
            </option>

          ))}

        </select>

      </div>

      <div className="flex gap-4">

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg"
        >
          {saving
            ? "Kaydediliyor..."
            : "Güncelle"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(`/jobs/${jobId}`)
          }
          className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg"
        >
          Vazgeç
        </button>

      </div>

    </form>
  );
}