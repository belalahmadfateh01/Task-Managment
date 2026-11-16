"use client";

import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { api, apiAllPages, downloadApiFile } from "@/lib/api";

type ReportDraft = {
  id: string;
  title: string;
  text: string;
  report_date: string;
  f_name: string;
  l_name: string;
  file_name?: string | null;
  file_path?: string | null;
};

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<ReportDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiAllPages<ReportDraft>("/report?status=draft")
      .then(setDrafts)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "بارگذاری پیش‌نویس‌ها ناموفق بود."))
      .finally(() => setLoading(false));
  }, []);

  const removeDraft = async (id: string) => {
    setError("");
    try {
      await api(`/report/${id}`, { method: "DELETE" });
      setDrafts((current) => current.filter((draft) => draft.id !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "حذف پیش‌نویس ناموفق بود.");
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="rounded-lg border border-line bg-white">
        <div className="border-b border-line px-4 py-4 sm:px-6">
          <h2 className="font-bold text-slate-900">پیش‌نویس‌های گزارش</h2>
          <p className="mt-1 text-xs text-slate-500">پیش‌نویس‌هایی که کارمندان هنوز ارسال نکرده‌اند.</p>
        </div>
        {loading ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500">در حال بارگذاری…</p>
        ) : drafts.length ? (
          <div className="divide-y divide-slate-100">
            {drafts.map((draft) => (
              <article key={draft.id} className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-900">{draft.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {draft.f_name} {draft.l_name} · {new Date(draft.report_date).toLocaleDateString("fa-IR")}
                    {draft.file_name ? ` · پیوست: ${draft.file_name}` : ""}
                    {draft.file_name && draft.file_path && (
                      <button
                        type="button"
                        onClick={() => void downloadApiFile(`/report/${draft.id}/file`, draft.file_name!)}
                        aria-label={`دانلود پیوست ${draft.file_name}`}
                        className="mr-2 inline-flex items-center text-blue-700 hover:text-blue-900">
                        <Download size={14} />
                      </button>
                    )}
                  </p>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{draft.text}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeDraft(draft.id)}
                  aria-label={`حذف پیش‌نویس ${draft.title}`}
                  title="حذف پیش‌نویس"
                  className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="px-4 py-12 text-center text-sm text-slate-500">پیش‌نویسی برای نمایش وجود ندارد.</p>
        )}
      </div>
    </section>
  );
}
