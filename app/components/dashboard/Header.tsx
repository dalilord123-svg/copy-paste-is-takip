"use client";

import Link from "next/link";
import {
  Bell,
  Search,
  Settings,
  UserCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header className="bg-white border-b shadow-sm">

      <div className="flex items-center justify-between px-8 py-5">

        {/* Sol Taraf */}
        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            COPY PASTE İş Takip Sistemi
          </p>

        </div>

        {/* Sağ Taraf */}
        <div className="flex items-center gap-4">

          {/* Arama */}
          <div className="hidden lg:flex items-center rounded-xl border bg-gray-50 px-4 py-2 w-80">

            <Search size={18} className="text-gray-400" />

            <input
              placeholder="İş, müşteri veya personel ara..."
              className="ml-3 bg-transparent outline-none w-full"
            />

          </div>

          {/* Dashboard Ayarları */}
          <Link
            href="/dashboard/settings"
            className="rounded-xl border p-3 hover:bg-gray-100 transition"
            title="Dashboard Ayarları"
          >
            <Settings size={20} />
          </Link>

          {/* Bildirim */}
          <button
            className="relative rounded-xl border p-3 hover:bg-gray-100 transition"
          >
            <Bell size={20} />

            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              5
            </span>

          </button>

          {/* Dark Mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-xl border p-3 hover:bg-gray-100 transition"
          >
            {darkMode ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </button>

          {/* Profil */}
          <div className="flex items-center gap-3 rounded-xl border px-4 py-2">

            <UserCircle2
              size={40}
              className="text-blue-600"
            />

            <div>

              <div className="font-bold">
                Ali Lord
              </div>

              <div className="text-sm text-gray-500">
                Yönetici
              </div>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}