"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const params = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      alert("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (password !== passwordAgain) {
      alert("Şifreler aynı değil.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `/api/employees/${params.id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const json = await res.json();

      if (!json.success) {
        alert(json.error);
        return;
      }

      alert("Şifre başarıyla değiştirildi.");

      router.push("/employees");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-8">

        <h1 className="text-3xl font-bold mb-8">
          Şifre Değiştir
        </h1>

        <form
          onSubmit={save}
          className="space-y-5"
        >

          <div>

            <label>Yeni Şifre</label>

            <input
              type="password"
              className="w-full border rounded-xl p-3 mt-2"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>

          <div>

            <label>Yeni Şifre Tekrar</label>

            <input
              type="password"
              className="w-full border rounded-xl p-3 mt-2"
              value={passwordAgain}
              onChange={(e) =>
                setPasswordAgain(e.target.value)
              }
            />

          </div>

          <button
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-3 font-bold"
          >
            {saving
              ? "Kaydediliyor..."
              : "Şifreyi Güncelle"}
          </button>

        </form>

      </div>

    </main>
  );
}