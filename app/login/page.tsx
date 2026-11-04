"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message ?? "Giriş başarısız.");
        setLoading(false);
        return;
      }

      // Cookie'nin tarayıcıya yazılması için kısa bekleme
      await new Promise((resolve) => setTimeout(resolve, 200));

      window.location.replace("/employees");
    } catch (err) {
      console.error(err);
      setError("Sunucuya bağlanılamadı.");
      setLoading(false);
    }
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

        <label className="block mb-2">Kullanıcı Adı</label>

        <input
          className="w-full border rounded-xl p-4 mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="block mb-2">Şifre</label>

        <input
          type="password"
          className="w-full border rounded-xl p-4 mb-6"
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
          className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold"
        >
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </main>
  );
}