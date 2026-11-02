"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Factory,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const menu = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "İşler",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    title: "Müşteriler",
    href: "/customers",
    icon: Building2,
  },
  {
    title: "Personeller",
    href: "/employees",
    icon: Users,
  },
  {
    title: "Üretim",
    href: "/production",
    icon: Factory,
  },
  {
    title: "İstasyonlar",
    href: "/stations",
    icon: ClipboardList,
  },
  {
    title: "Ayarlar",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobil Menü Butonu */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-blue-600 p-2 text-white lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Mobil Arkaplan */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
        fixed lg:static
        left-0 top-0
        z-50
        h-screen
        w-72
        bg-slate-900
        text-white
        transform
        transition-transform
        duration-300
        ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">

          <div>

            <h1 className="text-2xl font-bold">
              COPY PASTE
            </h1>

            <p className="text-sm text-slate-400">
              İş Takip Sistemi
            </p>

          </div>

          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>

        </div>

        {/* Menü */}
        <nav className="p-4 space-y-2">

          {menu.map((item) => {

            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                flex
                items-center
                gap-4
                rounded-xl
                px-4
                py-3
                transition
                ${
                  active
                    ? "bg-blue-600"
                    : "hover:bg-slate-800"
                }
              `}
              >
                <Icon size={22} />

                {item.title}

              </Link>
            );
          })}

        </nav>

        {/* Alt */}
        <div className="absolute bottom-0 w-full border-t border-slate-800 p-4">

          <button
            className="
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-xl
            bg-red-600
            py-3
            hover:bg-red-700
          "
          >
            <LogOut size={20} />

            Çıkış Yap

          </button>

        </div>

      </aside>
    </>
  );
}