"use client";

import Link from "next/link";
import { Bell, Search, UserCircle2 } from "lucide-react";

type HeaderProps = {
  title?: string;
};

export default function Header({
  title = "Dashboard",
}: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div>

        <h1 className="text-3xl font-bold text-slate-800">
          {title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          COPY PASTE İş Takip Sistemi
        </p>

      </div>

      <div className="flex items-center gap-4">

        {/* Arama */}

        <div className="relative hidden md:block">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="İş, müşteri veya personel ara..."
            className="w-72 rounded-xl border bg-white py-2 pl-10 pr-4 outline-none focus:border-blue-500"
          />

        </div>

        {/* Bildirim */}

        <button className="relative rounded-xl bg-white p-3 shadow hover:bg-slate-50">

          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />

        </button>

        {/* Profil */}

        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl bg-white px-4 py-2 shadow hover:bg-slate-50"
        >

          <UserCircle2 size={36} />

          <div className="hidden md:block">

            <div className="font-semibold">
              Yönetici
            </div>

            <div className="text-xs text-gray-500">
              Admin Paneli
            </div>

          </div>

        </Link>

      </div>

    </header>
  );
}