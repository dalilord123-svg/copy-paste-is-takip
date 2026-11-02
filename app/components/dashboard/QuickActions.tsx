import Link from "next/link";
import {
  Plus,
  Users,
  Building2,
  Camera,
  FilePlus2,
  Settings,
  ClipboardList,
  Factory,
} from "lucide-react";

const actions = [
  {
    title: "Yeni İş",
    href: "/jobs/new",
    icon: Plus,
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    title: "Yeni Personel",
    href: "/employees/new",
    icon: Users,
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    title: "Yeni Müşteri",
    href: "/customers/new",
    icon: Building2,
    color: "bg-purple-600 hover:bg-purple-700",
  },
  {
    title: "Üretim",
    href: "/production",
    icon: Factory,
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    title: "Fotoğraf",
    href: "/photos",
    icon: Camera,
    color: "bg-pink-600 hover:bg-pink-700",
  },
  {
    title: "Dosya",
    href: "/files",
    icon: FilePlus2,
    color: "bg-cyan-600 hover:bg-cyan-700",
  },
  {
    title: "İş Listesi",
    href: "/jobs",
    icon: ClipboardList,
    color: "bg-slate-700 hover:bg-slate-800",
  },
  {
    title: "Dashboard Ayarları",
    href: "/dashboard/settings",
    icon: Settings,
    color: "bg-gray-700 hover:bg-gray-800",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl shadow p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold">
          Hızlı İşlemler
        </h2>

        <span className="text-sm text-gray-500">
          Tek tıkla işlem yap
        </span>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

        {actions.map((action) => {

          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className={`
                ${action.color}
                rounded-2xl
                p-6
                text-white
                transition
                shadow
                hover:shadow-xl
                flex
                flex-col
                items-center
                justify-center
                gap-4
              `}
            >
              <Icon size={36} />

              <span className="font-semibold text-center">
                {action.title}
              </span>

            </Link>
          );
        })}

      </div>

    </div>
  );
}