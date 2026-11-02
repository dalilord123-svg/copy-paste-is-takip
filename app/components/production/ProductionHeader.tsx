```tsx
export default function ProductionHeader() {
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="text-sm text-gray-500 uppercase tracking-wide">
            COPY PASTE İş Takip
          </div>

          <h1 className="text-4xl font-bold mt-2">
            🏭 Canlı Üretim
          </h1>

          <p className="text-gray-500 mt-2">
            Üretimde bulunan tüm işler gerçek zamanlı takip edilir.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4">
          <div className="text-sm text-gray-500">
            Bugün
          </div>

          <div className="text-xl font-bold text-blue-700 mt-1">
            {today}
          </div>
        </div>
      </div>
    </div>
  );
}
```