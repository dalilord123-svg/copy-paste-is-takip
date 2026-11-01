"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CustomerSelect from "./CustomerSelect";
import ProductionStepsSelector, {
  SelectedProductionStep,
} from "./ProductionStepsSelector";

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

  const [description, setDescription] =
    useState("");

  const [width, setWidth] = useState("");

  const [height, setHeight] = useState("");

  const [quantity, setQuantity] =
    useState("");

  const [material, setMaterial] =
    useState("");

  const [machine, setMachine] =
    useState("");

  const [deliveryDate, setDeliveryDate] =
    useState("");

  const [priority, setPriority] =
    useState("NORMAL");

  const [
    productionSteps,
    setProductionSteps,
  ] = useState<
    SelectedProductionStep[]
  >([]);

  const [loading, setLoading] =
    useState(false);

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

    if (productionSteps.length === 0) {
      alert(
        "En az bir üretim adımı seçmelisiniz."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/jobs",
        {
          method: "POST",

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

            priority,

            productionSteps,
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      alert(
        "İş başarıyla oluşturuldu."
      );

      router.push("/jobs");

      router.refresh();

    } catch (error) {

      console.error(error);

      alert(
        "İş oluşturulamadı."
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <form
      onSubmit={saveJob}
      className="space-y-8"
    >      <div className="bg-white rounded-xl border p-6">

        <h2 className="text-xl font-bold mb-6">
          İş Bilgileri
        </h2>

        <CustomerSelect
          value={customerId}
          onChange={setCustomerId}
        />

        <div className="mt-6">

          <label className="block mb-2 font-semibold">
            İş Adı
          </label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full border rounded-lg p-3"
            placeholder="Örn: Totem Tabela"
          />

        </div>

        <div className="mt-6">

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
            placeholder="İş hakkında açıklama..."
          />

        </div>

      </div>

      <div className="bg-white rounded-xl border p-6">

        <h2 className="text-xl font-bold mb-6">
          Teknik Bilgiler
        </h2>

        <div className="grid md:grid-cols-3 gap-5">

          <div>

            <label className="block mb-2">
              En (cm)
            </label>

            <input
              value={width}
              onChange={(e) =>
                setWidth(
                  e.target.value
                )
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
                setHeight(
                  e.target.value
                )
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

        <div className="grid md:grid-cols-2 gap-5 mt-6">

          <div>

            <label className="block mb-2">
              Malzeme
            </label>

            <input
              value={material}
              onChange={(e) =>
                setMaterial(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3"
              placeholder="Kompozit, Vinil..."
            />

          </div>

          <div>

            <label className="block mb-2">
              Makine
            </label>

            <input
              value={machine}
              onChange={(e) =>
                setMachine(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3"
              placeholder="HP Latex"
            />

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-6">

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

            <label className="block mb-2">
              Öncelik
            </label>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3"
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

        </div>

      </div>

      <ProductionStepsSelector
        value={productionSteps}
        onChange={setProductionSteps}
      />      <div className="flex justify-end gap-4 pt-6 border-t">

        <button
          type="button"
          onClick={() => router.push("/jobs")}
          disabled={loading}
          className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
        >
          İptal
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Kaydediliyor..." : "İşi Kaydet"}
        </button>

      </div>

    </form>
  );
}