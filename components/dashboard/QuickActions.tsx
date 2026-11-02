import Link from "next/link";
import {
  PlusCircle,
  Users,
  Building2,
  Factory,
  ClipboardList,
  Settings,
  BarChart3,
  Camera,
} from "lucide-react";

const actions = [
  {
    title: "Yeni İş",
    href: "/jobs/new",
    icon: PlusCircle,
    color: "bg-blue-600",
  },
  {
    title: "Yeni Müşteri",
    href: "/customers/new",
    icon: Building2,
    color: "bg-green-600",
  },
  {
    title: "Yeni Personel",
    href: "/employees/new",
    icon: Users,
    color: "bg-purple-600",
  },
  {
    title: "İstasyonlar",
    href: "/stations",
    icon: Factory,
    color: "bg-orange-500",
  },
  {
    title: "İş Listesi",
    href: "/jobs",
    icon: ClipboardList,
    color: "bg-cyan-600",
  },
  {
    title: "Raporlar",
    href: "/reports",
    icon: BarChart3,
    color: "bg-pink-600",
  },
  {
    title: "Fotoğraflar",
    href: "/photos",
    icon: Camera,
    color: "bg-indigo-600",
  },
  {
    title: "Ayarlar",
    href: "/settings",
    icon: Settings,
    color: "bg-slate-700",
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
              className={`${action.color}
                rounded-2xl
                p-6
                text-white
                transition
                hover:scale-105
                hover:shadow-xl
                flex
                flex-col
                items-center
                justify-center
                gap-4`}
            >
              <Icon size={38} />

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