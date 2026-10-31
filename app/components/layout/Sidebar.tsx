import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white p-6 hidden lg:flex flex-col">

      <h1 className="text-3xl font-bold tracking-wide">
        COPY PASTE
      </h1>

      <p className="text-slate-400 text-sm mt-2">
        İş Takip Sistemi
      </p>

      <nav className="mt-10 flex flex-col gap-2">

        <Link
          href="/"
          className="rounded-xl px-4 py-3 hover:bg-slate-800 transition"
        >
          🏠 Dashboard
        </Link>

        <Link
          href="/customers"
          className="rounded-xl px-4 py-3 hover:bg-slate-800 transition"
        >
          👥 Müşteriler
        </Link>

        <Link
          href="/jobs"
          className="rounded-xl px-4 py-3 hover:bg-slate-800 transition"
        >
          📋 İşler
        </Link>

        <Link
          href="/archive"
          className="rounded-xl px-4 py-3 hover:bg-slate-800 transition"
        >
          📦 Arşiv
        </Link>

      </nav>

      <div className="mt-auto">

        <div className="rounded-xl bg-slate-800 p-4">

          <div className="text-sm text-slate-400">
            Sistem
          </div>

          <div className="font-semibold mt-2">
            COPY PASTE v1.0
          </div>

        </div>

      </div>

    </aside>
  );
}