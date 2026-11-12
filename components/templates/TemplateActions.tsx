
"use client";

interface TemplateActionsProps {
  templateId: string;
  templateName: string;
}

export default function TemplateActions({
  templateId,
  templateName,
}: TemplateActionsProps) {
  function copyTemplate() {
    alert("Şablon kopyalama yakında eklenecek.");
  }

  function deleteTemplate() {
    const confirmed = window.confirm(
      `"${templateName}" şablonunu silmek istiyor musunuz?`
    );

    if (confirmed) {
      window.location.href = `/api/templates/${templateId}/delete`;
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={copyTemplate}
        className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition"
      >
        Kopyala
      </button>

      <button
        type="button"
        onClick={deleteTemplate}
        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
      >
        Sil
      </button>
    </div>
  );
}
