"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewEmployeePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    phone: "",
    email: "",
    role: "PERSONEL",
    isActive: true,
  });

  function updateField(
    key: string,
    value: string | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function saveEmployee(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(json.error);
      return;
    }

    router.push("/employees");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl shadow p-8">

          <h1 className="text-3xl font-bold mb-8">
            Yeni Personel
          </h1>

          <form
            onSubmit={saveEmployee}
            className="space-y-5"
          >

            <div>

              <label className="font-semibold">
                Ad Soyad
              </label>

              <input
                className="w-full border rounded-xl p-3 mt-2"
                value={form.name}
                onChange={(e) =>
                  updateField(
                    "name",
                    e.target.value
                  )
                }
              />

            </div>

            <div>

              <label className="font-semibold">
                Kullanıcı Adı
              </label>

              <input
                className="w-full border rounded-xl p-3 mt-2"
                value={form.username}
                onChange={(e) =>
                  updateField(
                    "username",
                    e.target.value
                  )
                }
              />

            </div>

            <div>

              <label className="font-semibold">
                Şifre
              </label>

              <input
                type="password"
                className="w-full border rounded-xl p-3 mt-2"
                value={form.password}
                onChange={(e) =>
                  updateField(
                    "password",
                    e.target.value
                  )
                }
              />

            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <div>

                <label className="font-semibold">
                  Telefon
                </label>

                <input
                  className="w-full border rounded-xl p-3 mt-2"
                  value={form.phone}
                  onChange={(e) =>
                    updateField(
                      "phone",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <label className="font-semibold">
                  E-Posta
                </label>

                <input
                  type="email"
                  className="w-full border rounded-xl p-3 mt-2"
                  value={form.email}
                  onChange={(e) =>
                    updateField(
                      "email",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div>

              <label className="font-semibold">
                Rol
              </label>

              <select
                className="w-full border rounded-xl p-3 mt-2"
                value={form.role}
                onChange={(e) =>
                  updateField(
                    "role",
                    e.target.value
                  )
                }
              >
                <option value="PERSONEL">
                  PERSONEL
                </option>

                <option value="ADMIN">
                  ADMIN
                </option>

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

            <button
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-4 font-bold"
            >
              {loading
                ? "Kaydediliyor..."
                : "Personeli Kaydet"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}