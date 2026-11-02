"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Giriş başarısız.");
        return;
      }

      router.push("/employee");
      router.refresh();
    } catch (err) {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center">

          <h1 className="text-3xl font-bold">
            COPY PASTE
          </h1>

          <p className="text-gray-500 mt-2">
            İş Takip Sistemi
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >

          <div>

            <label className="block mb-2 font-medium">
              Kullanıcı Adı
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kullanıcı adınız"
              required
            />

          </div>

          <div>

            <label className="block mb-2 font-medium">
              Şifre
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Şifreniz"
              required
            />

          </div>

          {error && (
            <div className="rounded-lg bg-red-100 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 font-semibold transition"
          >
            {loading
              ? "Giriş Yapılıyor..."
              : "Giriş Yap"}
          </button>

        </form>

        <div className="text-center text-sm text-gray-400 mt-8">
          © 2026 COPY PASTE İş Takip
        </div>

      </div>

    </div>
  );
}