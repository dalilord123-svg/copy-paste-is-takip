"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Factory,
  Truck,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";

type MenuItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

const menu: MenuItem[] = [
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
    title: "Personeller",
    href: "/employees",
    icon: Users,
  },
  {
    title: "Müşteriler",
    href: "/customers",
    icon: Building2,
  },
  {
    title: "Üretim",
    href: "/production",
    icon: Factory,
  },
  {
    title: "Teslimatlar",
    href: "/deliveries",
    icon: Truck,
  },
  {
    title: "Raporlar",
    href: "/reports",
    icon: BarChart3,
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
      {/* Mobil Buton */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed left-4 top-4 z-50 rounded-lg bg-blue-600 p-2 text-white"
      >
        <Menu size={22} />
      </button>

      {/* Arkaplan */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
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
        {/* Header */}
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
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            <X />
          </button>

        </div>

        {/* Profil */}
        <div className="border-b border-slate-800 p-6">

          <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
            A
          </div>

          <div className="mt-3">

            <div className="font-semibold">
              Ali Lord
            </div>

            <div className="text-sm text-slate-400">
              Yönetici
            </div>

          </div>

        </div>

        {/* Menü */}
        <nav className="p-4 space-y-2">

          {menu.map((item) => {
            const active =
              pathname.startsWith(item.href);

            const Icon = item.icon;

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

                <span>{item.title}</span>

              </Link>
            );
          })}

        </nav>

        {/* Alt Menü */}
        <div className="absolute bottom-0 w-full border-t border-slate-800 p-4">

          <button
            className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            bg-red-600
            px-4
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