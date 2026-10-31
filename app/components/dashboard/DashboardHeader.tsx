import Link from "next/link";

export default function DashboardHeader() {
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

      <div>

        <h1 className="text-4xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          {today}
        </p>

      </div>

      <div className="flex flex-wrap gap-3">

        <Link
          href="/jobs/new"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl transition"
        >
          ➕ Yeni İş
        </Link>

        <Link
          href="/customers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
        >
          👤 Yeni Müşteri
        </Link>

      </div>

    </div>
  );
}