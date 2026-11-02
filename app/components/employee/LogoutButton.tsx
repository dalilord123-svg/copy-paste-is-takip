"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    const res = await fetch("/api/logout", {
      method: "POST",
    });

    if (res.ok) {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <button
      onClick={logout}
      className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-semibold transition"
    >
      🚪 Çıkış Yap
    </button>
  );
}