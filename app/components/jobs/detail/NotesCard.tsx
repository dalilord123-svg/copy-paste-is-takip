"use client";

import { useState } from "react";

type JobNote = {
  id: string;
  note: string;
  createdAt: string | Date;
  employee?: {
    name: string;
  } | null;
};

type Props = {
  jobId: string;
  notes: JobNote[];
};

export default function NotesCard({
  jobId,
  notes: initialNotes,
}: Props) {

  const [notes, setNotes] =
    useState(initialNotes);

  const [loading, setLoading] =
    useState(false);

  const [text, setText] =
    useState("");

  async function addNote() {

    if (!text.trim()) return;

    setLoading(true);

    try {

      const response =
        await fetch(
          "/api/notes",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({

              jobId,

              note: text,

            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {

        alert(
          result.error ??
          "Not eklenemedi."
        );

        return;

      }

      setNotes(result.data);

      setText("");

    } catch (error) {

      console.error(error);

      alert(
        "Not eklenemedi."
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="bg-white rounded-xl shadow border p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-bold">

          📝 Notlar

        </h2>

      </div>

      <textarea
        value={text}
        onChange={(e) =>
          setText(e.target.value)
        }
        rows={4}
        placeholder="İş ile ilgili not yazın..."
        className="w-full rounded-lg border p-3 resize-none"
      />

      <button
        onClick={addNote}
        disabled={loading}
        className="mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg"
      >

        {loading
          ? "Kaydediliyor..."
          : "Not Ekle"}

      </button>      <div className="mt-8 space-y-4">

        {notes.length === 0 && (

          <div className="text-center py-8 text-gray-500">

            Henüz not eklenmemiş.

          </div>

        )}

        {notes.map((item) => (

          <div
            key={item.id}
            className="border rounded-xl p-4 bg-gray-50"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="flex-1">

                <p className="whitespace-pre-wrap text-gray-800">

                  {item.note}

                </p>

                <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">

                  <span>

                    👤 {item.employee?.name ?? "Sistem"}

                  </span>

                  <span>

                    🕒 {new Date(
                      item.createdAt
                    ).toLocaleString("tr-TR")}

                  </span>

                </div>

              </div>

              <button
                onClick={async () => {

                  if (
                    !confirm(
                      "Bu not silinsin mi?"
                    )
                  ) return;

                  const response =
                    await fetch(
                      `/api/notes/${item.id}`,
                      {
                        method: "DELETE",
                      }
                    );

                  if (!response.ok) {

                    alert(
                      "Not silinemedi."
                    );

                    return;

                  }

                  setNotes(
                    notes.filter(
                      n =>
                        n.id !== item.id
                    )
                  );

                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
              >

                Sil

              </button>

            </div>

          </div>

        ))}

      </div>      <div className="mt-8 border-t pt-6">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="font-semibold text-lg">

              Not Özeti

            </h3>

            <p className="text-sm text-gray-500 mt-1">

              Bu işe ait tüm açıklamalar ve üretim
              notları burada görüntülenir.

            </p>

          </div>

          <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold">

            {notes.length} Not

          </div>

        </div>

        {notes.length > 0 && (

          <div className="mt-4 rounded-lg border border-green-300 bg-green-50 p-4">

            <div className="font-semibold text-green-700">

              ✓ Toplam {notes.length} not kayıtlı.

            </div>

            <div className="text-sm text-green-600 mt-1">

              En yeni notlar listenin en üstünde görüntülenir.

            </div>

          </div>

        )}

        {notes.length === 0 && (

          <div className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4">

            <div className="font-semibold text-yellow-700">

              Henüz not bulunmuyor.

            </div>

            <div className="text-sm text-yellow-600 mt-1">

              İş ile ilgili açıklamalar eklemek için
              yukarıdaki alanı kullanabilirsiniz.

            </div>

          </div>

        )}

      </div>    </div>

  );

}