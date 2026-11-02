"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error);
        setLoading(false);
        return;
      }

      router.push("/employee");
      router.refresh();
    } catch {
      setError("Sunucu hatası.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">

      <form
        onSubmit={login}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
      >

        <h1 className="text-3xl font-bold text-center mb-8">
          Personel Girişi
        </h1>

        <input
          className="w-full border rounded-xl p-4 mb-4"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full border rounded-xl p-4 mb-6"
          placeholder="Şifre"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl text-white py-4 font-bold"
        >
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>

      </form>

    </main>
  );
}