import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      title: "Yeni İş",
      description: "Yeni üretim işi oluştur",
      href: "/jobs/new",
      icon: "➕",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Yeni Müşteri",
      description: "Müşteri ekle",
      href: "/customers/new",
      icon: "👤",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "İşler",
      description: "Aktif işleri görüntüle",
      href: "/jobs",
      icon: "📋",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Müşteriler",
      description: "Firma listesi",
      href: "/customers",
      icon: "🏢",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Arşiv",
      description: "Arşivlenen işler",
      href: "/archive",
      icon: "📦",
      color: "bg-slate-700 hover:bg-slate-800",
    },
  ];

  return (
    <div className="mt-10">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-bold">
          Hızlı İşlemler
        </h2>

      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-5">

        {actions.map((action) => (

          <Link
            key={action.title}
            href={action.href}
            className={`${action.color} text-white rounded-2xl p-6 transition duration-200 shadow hover:shadow-lg`}
          >

            <div className="text-4xl">
              {action.icon}
            </div>

            <div className="mt-5 text-xl font-bold">
              {action.title}
            </div>

            <div className="mt-2 text-sm text-white/80">
              {action.description}
            </div>

          </Link>

        ))}

      </div>

    </div>
  );
}