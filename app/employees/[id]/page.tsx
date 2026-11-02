"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Employee = {
  id: string;
  name: string;
  username: string;
  phone: string | null;
  email: string | null;
  role: "ADMIN" | "YONETICI" | "PERSONEL";
  isActive: boolean;
};

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Employee>({
    id: "",
    name: "",
    username: "",
    phone: "",
    email: "",
    role: "PERSONEL",
    isActive: true,
  });

  useEffect(() => {
    loadEmployee();
  }, []);

  async function loadEmployee() {
    try {
      const res = await fetch(`/api/employees/${params.id}`);
      const json = await res.json();

      if (!json.success) {
        alert(json.error);
        router.push("/employees");
        return;
      }

      setForm(json.data);
    } catch {
      alert("Personel yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    key: keyof Employee,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    try {
      const res = await fetch(`/api/employees/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.error);
        return;
      }

      alert("Personel başarıyla güncellendi.");

      router.push("/employees");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl shadow p-8">

          <h1 className="text-3xl font-bold mb-8">
            Personel Düzenle
          </h1>

          <form
            onSubmit={save}
            className="space-y-5"
          >

            <div>

              <label>Ad Soyad</label>

              <input
                className="w-full border rounded-xl p-3 mt-2"
                value={form.name}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
              />

            </div>

            <div>

              <label>Kullanıcı Adı</label>

              <input
                className="w-full border rounded-xl p-3 mt-2"
                value={form.username}
                onChange={(e) =>
                  updateField("username", e.target.value)
                }
              />

            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <div>

                <label>Telefon</label>

                <input
                  className="w-full border rounded-xl p-3 mt-2"
                  value={form.phone ?? ""}
                  onChange={(e) =>
                    updateField("phone", e.target.value)
                  }
                />

              </div>

              <div>

                <label>E-Posta</label>

                <input
                  type="email"
                  className="w-full border rounded-xl p-3 mt-2"
                  value={form.email ?? ""}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                />

              </div>

            </div>

            <div>

              <label>Rol</label>

              <select
                className="w-full border rounded-xl p-3 mt-2"
                value={form.role}
                onChange={(e) =>
                  updateField(
                    "role",
                    e.target.value as Employee["role"]
                  )
                }
              >
                <option value="ADMIN">Admin</option>
                <option value="YONETICI">Yönetici</option>
                <option value="PERSONEL">Personel</option>
              </select>

            </div>

            <div className="flex items-center gap-3">

              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  updateField(
                    "isActive",
                    e.target.checked
                  )
                }
              />

              <span>Aktif</span>

            </div>

            <div className="flex gap-3 pt-4">

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-3 font-bold"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/employees")}
                className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl px-8 py-3 font-bold"
              >
                İptal
              </button>

            </div>

          </form>

        </div>

      </div>

    </main>
  );
}