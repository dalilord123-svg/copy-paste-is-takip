export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-8">
        COPY PASTE
      </h1>

      <nav className="space-y-3">
        <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700">
          🏠 Dashboard
        </button>

        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800">
          👥 Müşteriler
        </button>

        <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800">
          📋 İşler
        </button>
      </nav>
    </aside>
  );
}