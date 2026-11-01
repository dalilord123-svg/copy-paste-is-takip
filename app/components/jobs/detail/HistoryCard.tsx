"use client";

type HistoryItem = {
  id: string;
  action: string;
  description?: string | null;
  createdAt: Date | string;
  employee?: {
    name: string;
  } | null;
};

type Props = {
  history: HistoryItem[];
};

export default function HistoryCard({
  history,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          📜 İş Geçmişi
        </h2>

        <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold">
          {history.length} Kayıt
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Henüz geçmiş kaydı bulunmuyor.
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="relative pl-10 pb-6 border-l-2 border-gray-200 last:border-l-0"
            >
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-indigo-600 border-4 border-white shadow" />

              <div className="bg-gray-50 border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {item.action}
                  </h3>
                </div>

                {item.description && (
                  <p className="mt-2 whitespace-pre-wrap text-gray-600">
                    {item.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>
                    👤 {item.employee?.name ?? "Sistem"}
                  </span>

                  <span>
                    🕒{" "}
                    {new Date(item.createdAt).toLocaleString("tr-TR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              Geçmiş Özeti
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              İş üzerinde yapılan tüm işlemler otomatik olarak kayıt altına alınır.
            </p>
          </div>

          <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold">
            {history.length} İşlem
          </div>
        </div>

        {history.length > 0 ? (
          <div className="mt-4 rounded-lg border border-green-300 bg-green-50 p-4">
            <div className="font-semibold text-green-700">
              ✓ Toplam {history.length} işlem kaydedildi.
            </div>

            <div className="text-sm text-green-600 mt-1">
              İşlem geçmişi en yeniden eskiye doğru kronolojik olarak listelenmektedir.
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <div className="font-semibold text-yellow-700">
              Henüz işlem geçmişi oluşmadı.
            </div>

            <div className="text-sm text-yellow-600 mt-1">
              İş üzerinde işlem yapıldıkça geçmiş kayıtları burada otomatik olarak görüntülenecektir.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}