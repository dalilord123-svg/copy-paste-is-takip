import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">
          COPY PASTE
        </h1>

        <nav className="space-y-3">
          <Link
            href="/"
            className="block w-full text-left px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            🏠 Dashboard
          </Link>

          <Link
            href="/customers"
            className="block w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800"
          >
            👥 Müşteriler
          </Link>

          <Link
            href="/jobs"
            className="block w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800"
          >
            📋 İşler
          </Link>
        </nav>
      </aside>

      {/* İçerik */}
      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          COPY PASTE İş Takip Sistemi
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          <Card title="📋 Açık İşler" value="0" />
          <Card title="👥 Müşteriler" value="0" />
          <Card title="🚚 Bugün Teslim" value="0" />
          <Card title="⚠️ Geciken İşler" value="0" />
        </div>

        <div className="bg-white rounded-xl shadow mt-10 p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Son İşler
          </h2>

          <p className="text-gray-500">
            Henüz kayıtlı iş bulunmuyor.
          </p>
        </div>
      </main>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-4xl font-bold mt-4">{value}</p>
    </div>
  );
}