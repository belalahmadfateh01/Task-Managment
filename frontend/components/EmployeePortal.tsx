"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheck,
  CircleX,
  Clock3,
  FileText,
  Paperclip,
  Pencil,
  Plus,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  readEmployeeReports,
  readSession,
  writeEmployeeReports,
  type EmployeeReport,
  type EmployeeReportStatus,
} from "@/lib/clientStore";
import { api, apiAllPages, downloadApiFile } from "@/lib/api";
import { formatJalali, formatTime } from "@/lib/jalali";

const statusInfo: Record<
  EmployeeReportStatus,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  pending: {
    label: "منتظر بررسی",
    className: "bg-indigo-50 text-indigo-600",
    icon: Clock3,
  },
  approved: {
    label: "تأیید شده",
    className: "bg-green-100 text-green-800",
    icon: CircleCheck,
  },
  rejected: {
    label: "بازخورد شده",
    className: "bg-orange-100 text-orange-800",
    icon: CircleX,
  },
  draft: {
    label: "پیش‌نویس",
    className: "bg-blue-100 text-blue-800",
    icon: FileText,
  },
};

function useEmployeeReports() {
  const [reports, setReports] = useState<EmployeeReport[]>([]);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = readSession();
    if (session?.role !== "teacher") {
      setIsLoading(false);
      return;
    }
    setEmployeeId(session.employeeId);
    apiAllPages<Record<string, unknown>>(`/report/teacher/${session.employeeId}`)
      .then((rows) => {
        setLoadError("");
        setReports([
          ...readEmployeeReports().filter((item) => item.status === "draft" && item.employeeId === session.employeeId),
          ...rows.map((row) => ({
        id: String(row.id), employeeId: session.employeeId,
        title: String(row.title ?? ""), content: String(row.text ?? ""),
        createdAt: String(row.report_date ?? new Date().toISOString()),
        status: (row.status === "draft" ? "draft" : row.status === "accept" ? "approved" : row.status === "comment" ? "rejected" : "pending") as EmployeeReportStatus,
        serverBacked: true,
        reviewNote: typeof row.comment_text === "string" ? row.comment_text : undefined,
        reviewedAt: row.status === "pending" ? undefined : String(row.updated_at ?? ""),
        attachment: row.file_name ? {
          name: String(row.file_name),
          size: row.file_size ? `${(Number(row.file_size) / (1024 * 1024)).toFixed(1)} MB` : "",
          downloadEndpoint: row.file_path ? `/report/${String(row.id)}/file` : undefined,
        } : undefined,
          })),
        ]);
      })
      .catch((cause) => setLoadError(cause instanceof Error ? cause.message : "بارگذاری گزارش‌ها ناموفق بود."))
      .finally(() => setIsLoading(false));
  }, []);

  return {
    employeeId,
    loadError,
    isLoading,
    reports: useMemo(
      () =>
        reports
          .filter((report) => report.employeeId === employeeId)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
      [reports, employeeId],
    ),
    setReports,
  };
}

function StatusBadge({ status, compact = false }: { status: EmployeeReportStatus; compact?: boolean }) {
  const { label, className, icon: Icon } = statusInfo[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${compact ? "text-center text-[9px] sm:w-[104px] sm:justify-center" : "text-[11px]"} ${className}`}>
      {!compact && <Icon size={13} />} {label}
    </span>
  );
}

function reportDate(value: string) {
  const date = new Date(value);
  return `${formatJalali(date, "/")} - ${formatTime(date)}`;
}

export function EmployeeDashboard() {
  const { reports, loadError, isLoading } = useEmployeeReports();
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const submittedReports = reports.filter((report) => report.status !== "draft");
  const visibleReports = submittedReports.filter((report) => {
    if (filter === "pending") return report.status === "pending";
    if (filter === "reviewed") return report.status === "approved" || report.status === "rejected";
    return true;
  });
  const visibleIds = visibleReports.map((report) => report.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const selectAllVisible = () => {
    setSelectedIds(allVisibleSelected ? [] : visibleIds);
  };

  const toggleReportSelection = (id: string) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {loadError && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>}
      <section aria-label="صندوق ارسالی" dir="rtl" className="overflow-hidden border border-slate-200 bg-white">
        <header className="flex flex-wrap items-center justify-between gap-3 bg-[#f3f4f6] px-3 py-3 sm:px-4">
          <div className="flex items-center gap-2.5">
            <label className="grid size-8 place-items-center" title="انتخاب همه گزارش‌های این فهرست">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={selectAllVisible}
                aria-label="انتخاب همه گزارش‌های قابل مشاهده"
                className="size-4 accent-sky-500"
              />
            </label>
            <div className="relative">
              <button
                type="button"
                aria-expanded={folderMenuOpen}
                onClick={() => setFolderMenuOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-800 hover:bg-white/70">
                صندوق ارسالی
                <ChevronDown size={16} className={`transition-transform ${folderMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {folderMenuOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 min-w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                  <Link href="/employee/drafts" onClick={() => setFolderMenuOpen(false)} className="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50">پیش‌نویس‌ها</Link>
                  <Link href="/employee/reports/new" onClick={() => setFolderMenuOpen(false)} className="block rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-50">گزارش جدید</Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center rounded-full border border-slate-200 bg-white p-0.5" role="group" aria-label="فیلتر گزارش‌ها">
            {[
              { id: "all", label: "همه" },
              { id: "pending", label: "منتظر بررسی" },
              { id: "reviewed", label: "بررسی‌شده" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => {
                  setFilter(item.id as typeof filter);
                  setSelectedIds([]);
                }}
                className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition sm:px-4 ${filter === item.id ? "bg-sky-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}>
                {item.label}
              </button>
            ))}
          </div>
        </header>

        {selectedIds.length > 0 && (
          <div className="border-b border-slate-200 bg-sky-50 px-4 py-2 text-xs text-sky-800">
            {selectedIds.length.toLocaleString("fa-IR")} گزارش انتخاب شده
            <button type="button" onClick={() => setSelectedIds([])} className="mr-3 font-semibold hover:underline">لغو انتخاب</button>
          </div>
        )}

        {isLoading ? (
          <p className="py-14 text-center text-sm text-slate-500">در حال بارگذاری گزارش‌ها…</p>
        ) : visibleReports.length ? (
          <div className="divide-y divide-slate-200">
            {visibleReports.map((report) => (
              <article key={report.id} className="flex min-h-12 items-center gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50 sm:grid sm:grid-cols-[24px_minmax(0,1fr)_104px_minmax(0,1fr)] sm:gap-4 sm:px-4">
                <label className="grid size-6 shrink-0 place-items-center" title={`انتخاب ${report.title}`}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(report.id)}
                    onChange={() => toggleReportSelection(report.id)}
                    aria-label={`انتخاب گزارش ${report.title}`}
                    className="size-4 accent-sky-500"
                  />
                </label>
                <Link href={`/employee/reports/${report.id}`} className="min-w-0 flex-1 text-right text-xs font-medium text-slate-700 hover:text-sky-700">
                  <span className="block truncate">{report.title}</span>
                  <span className="mt-1 block text-[10px] font-normal text-slate-500 sm:hidden">{reportDate(report.createdAt)}</span>
                </Link>
                <StatusBadge status={report.status} compact />
                <div dir="ltr" className="hidden min-w-0 items-center justify-start gap-3 text-[11px] text-slate-500 sm:flex">
                  <span>{reportDate(report.createdAt)}</span>
                  {report.attachment && <Paperclip size={15} aria-label="پیوست دارد" />}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
            <FileText size={30} className="text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {submittedReports.length ? "گزارشی با این وضعیت پیدا نشد." : "هنوز گزارشی ارسال نکرده‌اید."}
            </p>
            {!submittedReports.length && (
              <Link href="/employee/reports/new" className="mt-3 text-xs font-semibold text-sky-700 hover:underline">ارسال گزارش جدید</Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ReportRows({
  reports,
  busyReportId,
  onSend,
  onDelete,
}: {
  reports: EmployeeReport[];
  busyReportId: string | null;
  onSend: (report: EmployeeReport) => void;
  onDelete: (report: EmployeeReport) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {reports.map((report) => {
        const busy = busyReportId === report.id;
        return (
          <article key={report.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 last:border-0 hover:bg-slate-50">
            <Link
              href={`/employee/reports/new?draft=${report.id}`}
              className="min-w-0 flex-1">
              <strong className="block truncate text-sm font-semibold text-slate-800">
                {report.title || "بدون عنوان"}
              </strong>
              <span className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                {reportDate(report.createdAt)}
                {report.attachment && <Paperclip size={13} aria-label="پیوست دارد" />}
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={`/employee/reports/new?draft=${report.id}`}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-white">
                <Pencil size={13} /> ویرایش
              </Link>
              <button
                type="button"
                onClick={() => onSend(report)}
                disabled={busy}
                className="inline-flex h-8 items-center gap-1 rounded-md bg-blue-600 px-2.5 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                <Send size={13} /> {busy ? "در حال ارسال…" : "ارسال"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(report)}
                disabled={busy}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-2.5 text-[11px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                <Trash2 size={13} /> حذف
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function EmployeeDraftList() {
  const router = useRouter();
  const { reports, loadError, isLoading, setReports } = useEmployeeReports();
  const [busyReportId, setBusyReportId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const items = reports.filter((report) => report.status === "draft");

  const sendDraft = async (report: EmployeeReport) => {
    if (busyReportId) return;
    setBusyReportId(report.id);
    setActionError("");
    try {
      let reportId = report.id;
      if (report.serverBacked) {
        await api(`/report/${report.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "pending" }),
        });
      } else {
        const body = {
          title: report.title.trim(),
          text: report.content.trim(),
          status: "pending",
        };
        let requestBody: BodyInit = JSON.stringify(body);
        if (report.attachment?.url?.startsWith("data:")) {
          const blob = await fetch(report.attachment.url).then((response) => response.blob());
          const file = new File([blob], report.attachment.name, { type: blob.type });
          const form = new FormData();
          Object.entries(body).forEach(([key, value]) => form.append(key, value));
          form.append("file", file);
          requestBody = form;
        } else if (report.attachment) {
          throw new Error("پیوست این پیش‌نویس در دسترس نیست؛ آن را ویرایش کنید و دوباره پیوست نمایید.");
        }
        const created = await api<Record<string, unknown>>("/report", {
          method: "POST",
          body: requestBody,
        });
        reportId = String(created.id);
        writeEmployeeReports(readEmployeeReports().filter((item) => item.id !== report.id));
      }
      setReports((current) => current.map((item) => item.id === report.id ? { ...item, status: "pending", serverBacked: true } : item));
      router.push(`/employee/reports/${reportId}`);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "ارسال گزارش ناموفق بود.");
    } finally {
      setBusyReportId(null);
    }
  };

  const deleteDraft = async (report: EmployeeReport) => {
    if (busyReportId || !window.confirm(`پیش‌نویس «${report.title || "بدون عنوان"}» حذف شود؟`)) return;
    setBusyReportId(report.id);
    setActionError("");
    try {
      if (report.serverBacked) {
        await api(`/report/${report.id}`, { method: "DELETE" });
      } else {
        writeEmployeeReports(readEmployeeReports().filter((item) => item.id !== report.id));
      }
      setReports((current) => current.filter((item) => item.id !== report.id));
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "حذف پیش‌نویس ناموفق بود.");
    } finally {
      setBusyReportId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            پیش‌نویس‌ها
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {items.length.toLocaleString("fa-IR")} مورد
          </p>
        </div>
        <Link
          href="/employee/reports/new"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50">
          <Plus size={15} /> گزارش جدید
        </Link>
      </div>
      {(loadError || actionError) && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{actionError || loadError}</p>}
      {isLoading ? (
        <p className="border-t border-slate-200 py-12 text-center text-sm text-slate-500">در حال بارگذاری گزارش‌ها…</p>
      ) : items.length ? (
        <ReportRows reports={items} busyReportId={busyReportId} onSend={(report) => void sendDraft(report)} onDelete={(report) => void deleteDraft(report)} />
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center border-t border-slate-200 text-center">
          <FileText size={30} className="text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            پیش‌نویسی ندارید
          </p>
        </div>
      )}
    </div>
  );
}

export function EmployeeReportPage({ reportId }: { reportId: string }) {
  const { reports, loadError, isLoading } = useEmployeeReports();
  const report = reports.find((item) => item.id === reportId);

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        {isLoading && <p className="text-sm text-slate-500">در حال بارگذاری گزارش…</p>}
        {loadError && <p role="alert" className="mb-3 text-sm text-red-600">{loadError}</p>}
        {!isLoading && !loadError && (
          <>
            <p className="font-semibold text-slate-700">گزارش پیدا نشد.</p>
            <Link href="/employee/dashboard" className="mt-3 inline-block text-sm text-blue-700">
              بازگشت به صفحه اصلی
            </Link>
          </>
        )}
      </div>
    );
  }

  const status = statusInfo[report.status];
  const BannerIcon =
    report.status === "approved"
      ? CircleCheck
      : report.status === "rejected"
        ? CircleX
        : Clock3;
  const bannerClass =
    report.status === "approved"
      ? "border-green-400 bg-green-100 text-green-800"
      : report.status === "rejected"
        ? "border-red-400 bg-red-100 text-red-800"
        : "border-orange-300 bg-orange-100 text-orange-900";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Link
        href="/employee/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">
        <ArrowRight size={14} /> بازگشت به صفحه اصلی
      </Link>
      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${bannerClass}`}>
        <BannerIcon size={20} />
        <strong className="text-sm">
          {report.status === "pending"
            ? "گزارش شما در انتظار بررسی است"
            : `گزارش شما ${status.label} است`}
        </strong>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
        <article className="min-h-[400px] rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[11px] text-slate-500">گزارش ارسالی</p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {report.title}
              </h2>
            </div>
            <StatusBadge status={report.status} />
          </div>
          <div className="whitespace-pre-wrap py-5 text-sm leading-7 text-slate-700">
            {report.content}
          </div>
          {report.attachment && (
            <div className="mt-4 flex max-w-sm items-center justify-between rounded-md border border-slate-200 px-3 py-2">
              <span className="flex min-w-0 items-center gap-2 truncate text-xs font-semibold text-slate-700">
                <Paperclip size={15} /> {report.attachment.name}
              </span>
              <span className="shrink-0 text-[10px] text-slate-500">
                {report.attachment.size}
              </span>
              {report.attachment.downloadEndpoint ? (
                <button
                  type="button"
                  onClick={() => void downloadApiFile(report.attachment!.downloadEndpoint!, report.attachment!.name)}
                  aria-label="دانلود پیوست"
                  className="mr-2 text-blue-700 hover:text-blue-900">
                  <FileText size={16} />
                </button>
              ) : report.attachment.url && (
                <a
                  href={report.attachment.url}
                  download={report.attachment.name}
                  aria-label="دانلود پیوست"
                  className="mr-2 text-blue-700 hover:text-blue-900">
                  <FileText size={16} />
                </a>
              )}
            </div>
          )}
          {report.reviewNote && (
            <section className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-slate-800">یادداشت مدیر</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {report.reviewNote}
              </p>
            </section>
          )}
        </article>
        <aside className="space-y-3">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold text-slate-800">وضعیت گزارش</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-green-600">
                  <Check size={16} />
                </span>
                <div>
                  <p className="text-xs font-semibold">ارسال شد</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {reportDate(report.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 ${report.status === "pending" ? "text-orange-500" : report.status === "rejected" ? "text-red-600" : "text-green-600"}`}>
                  {report.status === "pending" ? (
                    <Clock3 size={16} />
                  ) : report.status === "rejected" ? (
                    <CircleX size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                </span>
                <div>
                  <p className="text-xs font-semibold">{status.label}</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {report.reviewedAt
                      ? reportDate(report.reviewedAt)
                      : "در انتظار پاسخ مدیر"}
                  </p>
                </div>
              </div>
            </div>
          </section>
          {report.status === "rejected" && (
            <Link
              href={`/employee/reports/new?draft=${report.id}`}
              className="block rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700">
              اصلاح و ارسال دوباره
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

export function EmployeeReportComposer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");
  const { employeeId, reports, isLoading } = useEmployeeReports();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<EmployeeReport["attachment"]>();
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [savingStatus, setSavingStatus] = useState<"pending" | "draft" | null>(null);
  const draft = reports.find((report) => report.id === draftId);

  useEffect(() => {
    if (!draft) return;
    setTitle(draft.title);
    setContent(draft.content);
    setAttachment(draft.attachment);
    setAttachmentFile(null);
    if (draft.attachment?.url?.startsWith("data:")) {
      void fetch(draft.attachment.url)
        .then((response) => response.blob())
        .then((blob) => setAttachmentFile(new File([blob], draft.attachment!.name, { type: blob.type })));
    }
  }, [draft]);

  if (draftId && isLoading) {
    return <p className="py-16 text-center text-sm text-slate-500">در حال بارگذاری پیش‌نویس…</p>;
  }

  const selectAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError("حجم پیوست نباید بیشتر از ۱۵ مگابایت باشد.");
      event.currentTarget.value = "";
      return;
    }
    const allowedTypes = [
      "application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif", "image/tiff", "text/plain", "text/csv", "text/markdown", "text/rtf", "application/rtf", "application/json",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.oasis.opendocument.text", "application/vnd.oasis.opendocument.spreadsheet", "application/vnd.oasis.opendocument.presentation",
      "application/zip", "application/x-zip-compressed", "application/x-7z-compressed", "application/vnd.rar", "application/x-rar-compressed", "application/gzip", "application/x-gzip", "application/x-tar", "application/x-bzip2",
    ];
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".tif", ".tiff", ".txt", ".csv", ".md", ".rtf", ".json", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt", ".ods", ".odp", ".zip", ".7z", ".rar", ".gz", ".tar", ".bz2"];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
      setError("فرمت پیوست پشتیبانی نمی‌شود.");
      event.currentTarget.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAttachment({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          url: reader.result,
        });
        setAttachmentFile(file);
        setError("");
      }
    };
    reader.onerror = () => setError("خواندن فایل ناموفق بود.");
    reader.readAsDataURL(file);
  };

  const save = async (status: "pending" | "draft") => {
    if (savingStatus) return;
    if (!employeeId) {
      setError("حساب کاربری هنوز آماده نشده است؛ چند لحظه دیگر دوباره تلاش کنید.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError("عنوان و متن گزارش را وارد کنید.");
      return;
    }
    setSavingStatus(status);
    setError("");

    const body: Record<string, string> = {
      title: title.trim(),
      text: content.trim(),
      status,
    };
    if (attachment?.name) body.file_name = attachment.name;
    if (draft?.serverBacked && !attachment) body.remove_file = "true";
    try {
      let reportId = draft?.id;
      const method = draft?.serverBacked ? "PATCH" : "POST";
      const endpoint = draft?.serverBacked ? `/report/${draft.id}` : "/report";
      let requestBody: BodyInit = JSON.stringify(body);
      if (attachmentFile) {
        const form = new FormData();
        for (const [key, value] of Object.entries(body)) form.append(key, value);
        form.append("file", attachmentFile);
        requestBody = form;
      }
      if (draft?.serverBacked) {
        await api(endpoint, { method, body: requestBody });
      } else {
        const created = await api<Record<string, unknown>>(endpoint, { method, body: requestBody });
        reportId = String(created.id);
      }

      if (draft && !draft.serverBacked) {
        writeEmployeeReports(
          readEmployeeReports().filter((item) => item.id !== draft.id),
        );
      }
      if (status === "pending") {
        router.push(`/employee/reports/${String(reportId)}`);
      } else {
        router.push("/employee/drafts");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : status === "draft" ? "ذخیره پیش‌نویس ناموفق بود." : "ارسال گزارش ناموفق بود.");
    } finally {
      setSavingStatus(null);
    }
  };

  const requirements = [
    { label: "عنوان گزارش وارد شده است", complete: Boolean(title.trim()) },
    { label: "گیرنده گزارش مشخص است", complete: true },
    { label: "متن گزارش نوشته شده است", complete: Boolean(content.trim()) },
    { label: "فایل اضافه شده (اختیاری)", complete: Boolean(attachment) },
  ];

  return (
    <form
      className="mx-auto grid w-full max-w-6xl gap-3 md:grid-cols-[minmax(0,1fr)_240px]"
      onSubmit={(event) => {
        event.preventDefault();
        save("pending");
      }}>
      <div className="flex items-center justify-between md:col-span-2">
        <Link href="/employee/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
          <ArrowRight size={14} /> بازگشت به گزارش‌های من
        </Link>
        {draft && <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600">ویرایش پیش‌نویس</span>}
      </div>
      <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="space-y-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            عنوان گزارش
            <input
              value={title}
              onChange={(event) => setTitle(event.currentTarget.value)}
              maxLength={120}
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="عنوان گزارش را بنویسید"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            متن گزارش
            <textarea
              value={content}
              onChange={(event) => setContent(event.currentTarget.value)}
              rows={13}
              className="min-h-[280px] resize-y rounded-lg border border-slate-200 px-3 py-3 text-sm leading-7 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="متن گزارش را اینجا بنویسید..."
            />
          </label>
          <div>
            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-600 hover:bg-blue-50">
              <span className="flex items-center gap-2">
                <Paperclip size={16} /> برای افزودن فایل، اینجا کلیک کنید
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.tif,.tiff,.txt,.csv,.md,.rtf,.json,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.zip,.7z,.rar,.gz,.tar,.bz2"
                onChange={selectAttachment}
                className="sr-only"
              />
              <Upload size={16} className="shrink-0 text-slate-500" />
            </label>
            {attachment && (
              <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-green-300 bg-green-50/40 px-3 py-2 text-xs">
                <span className="flex min-w-0 items-center gap-2">
                  <Check size={16} className="shrink-0 text-green-600" />
                  <span className="min-w-0 truncate font-semibold text-slate-700">
                    {attachment.name}
                    <span className="mr-2 font-normal text-slate-500">{attachment.size}</span>
                  </span>
                  <span className="rounded bg-red-100 px-1.5 py-1 text-[9px] font-bold uppercase text-red-700">
                    {attachment.name.split(".").pop() || "file"}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label="حذف پیوست"
                  onClick={() => {
                    setAttachment(undefined);
                    setAttachmentFile(null);
                    setError("");
                  }}
                  className="shrink-0 text-slate-500 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <span className="text-[10px] text-slate-400">ارسال گزارش برای مدیر شما</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => save("draft")}
                disabled={!employeeId || savingStatus !== null}
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                {savingStatus === "draft" ? "در حال ذخیره…" : "ذخیره پیش‌نویس"}
              </button>
              <button
                type="submit"
                disabled={!employeeId || savingStatus !== null}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                <Send size={15} /> {savingStatus === "pending" ? "در حال ارسال…" : "ارسال گزارش"}
              </button>
            </div>
          </div>
        </div>
      </section>
      <aside className="h-fit space-y-3">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-bold text-slate-800">پیش از ارسال</h3>
          <ul className="mt-3 space-y-2.5 text-xs leading-5 text-slate-600">
            {requirements.map((requirement) => (
              <li key={requirement.label} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-[3px] border ${requirement.complete ? "border-green-500 bg-green-500 text-white" : "border-slate-300 bg-white text-transparent"}`}>
                  {requirement.complete && <Check size={12} strokeWidth={3} />}
                </span>
                <span>{requirement.label}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <h3 className="text-xs font-bold text-blue-700">بعد از ارسال چه می‌شود؟</h3>
          <p className="mt-2 text-[11px] leading-5 text-slate-600">
            گزارش شما برای مدیر ارسال می‌شود و وضعیت آن را می‌توانید در صندوق ارسالی پیگیری کنید.
          </p>
          <div className="mt-3 space-y-2 text-[10px] text-slate-600">
            <p className="flex items-center justify-between gap-2"><span>گزارش ثبت می‌شود</span><span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">انجام شد</span></p>
            <p className="flex items-center justify-between gap-2"><span>بررسی مدیر</span><span className="rounded-full bg-rose-100 px-2 py-0.5 font-semibold text-rose-700">در انتظار</span></p>
          </div>
        </section>
      </aside>
    </form>
  );
}

type AssignedTask = {
  id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  deadline?: string | null;
  created_at?: string | null;
  file_name?: string | null;
  file_path?: string | null;
  assignments: Array<{
    status: "pending" | "in_progress" | "completed";
    completed_at?: string | null;
    response?: string | null;
    responded_at?: string | null;
  }>;
};

export function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);

  useEffect(() => {
    apiAllPages<AssignedTask>("/task")
      .then(setTasks)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "بارگذاری وظایف ناموفق بود."))
      .finally(() => setLoading(false));
  }, []);

  const submitResponse = async (task: AssignedTask) => {
    const response = (responses[task.id] ?? task.assignments[0]?.response ?? "").trim();
    if (!response) {
      setError("گزارش کار را بنویسید.");
      return;
    }
    setError("");
    setNotice("");
    setSubmittingTaskId(task.id);
    try {
      const assignment = await api<{ response: string; responded_at: string; completed_at: string | null }>(`/task/${task.id}/response`, {
        method: "PATCH",
        body: JSON.stringify({ response }),
      });
      setTasks((current) => current.map((item) => item.id === task.id
        ? { ...item, assignments: [{ ...item.assignments[0], response: assignment.response, responded_at: assignment.responded_at, status: "completed", completed_at: assignment.completed_at }] }
        : item));
      setResponses((current) => ({ ...current, [task.id]: assignment.response }));
      setActiveTaskId(null);
      setNotice("پاسخ فعالیت به‌صورت گزارش برای مدیر ارسال شد.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ارسال گزارش کار ناموفق بود.");
    } finally {
      setSubmittingTaskId(null);
    }
  };

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 1) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weeklyTasks = tasks.filter((task) => {
    const dateValue = task.deadline ?? task.start_date ?? task.created_at;
    if (!dateValue) return true;
    const date = new Date(dateValue);
    return date >= weekStart && date < weekEnd;
  });
  const completedCount = weeklyTasks.filter((task) => task.assignments[0]?.status === "completed").length;
  const inProgressCount = weeklyTasks.length - completedCount;
  const completionPercent = weeklyTasks.length ? Math.round((completedCount / weeklyTasks.length) * 100) : 0;

  const taskDateLabel = (task: AssignedTask) => {
    const value = task.deadline ?? task.start_date;
    if (!value) return "بدون موعد";
    const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
    return `موعد: ${new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "short" }).format(date)}`;
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}
      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">در حال بارگذاری…</p>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_246px]">
          <section className="space-y-3">
            {tasks.length ? tasks.map((task) => {
              const assignment = task.assignments[0];
              const completed = assignment?.status === "completed";
              const reopened = !completed && Boolean(assignment?.responded_at);
              const isActive = activeTaskId === task.id;
              return (
                <article key={task.id} className="rounded-lg border border-slate-200 bg-white p-3 sm:px-4 sm:py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      {completed ? (
                        <CircleCheck size={19} className="mt-0.5 shrink-0 fill-green-600 text-white" />
                      ) : (
                        <span aria-hidden className="mt-0.5 size-[19px] shrink-0 rounded border border-slate-300 bg-white" />
                      )}
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-800">{task.title}</h3>
                        <p className="mt-1 text-[11px] text-slate-400">{taskDateLabel(task)}</p>
                      </div>
                    </div>
                    {completed ? (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-700">
                        <i className="size-1.5 rounded-full bg-green-600" /> انجام شده
                      </span>
                    ) : (
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {reopened && (
                          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-semibold text-orange-800">
                            بازگشایی برای اصلاح
                          </span>
                        )}
                        <button
                          type="button"
                          aria-expanded={isActive}
                          onClick={() => setActiveTaskId(isActive ? null : task.id)}
                          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                          <Send size={13} /> ارسال گزارش کار
                        </button>
                      </div>
                    )}
                  </div>
                  {task.description && <p className="mt-2 pr-8 text-xs leading-5 text-slate-500">{task.description}</p>}
                  {task.file_name && task.file_path && (
                    <button
                      type="button"
                      onClick={() => void downloadApiFile(`/task/${task.id}/file`, task.file_name!).catch((cause) => setError(cause instanceof Error ? cause.message : "بارگیری فایل ناموفق بود."))}
                      className="mt-2 inline-flex items-center gap-1.5 pr-8 text-xs font-medium text-blue-700 hover:underline">
                      <Paperclip size={14} /> دریافت فایل وظیفه: {task.file_name}
                    </button>
                  )}
                  {isActive && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      {assignment?.responded_at && <p className="mb-2 text-[11px] text-slate-500">گزارش قبلی ثبت شده است؛ متن را ویرایش و دوباره بفرستید.</p>}
                      <label className="grid gap-2 text-xs font-medium text-slate-700">
                        گزارش کار
                        <textarea
                          value={responses[task.id] ?? assignment?.response ?? ""}
                          onChange={(event) => setResponses((current) => ({ ...current, [task.id]: event.target.value }))}
                          maxLength={20000}
                          rows={3}
                          placeholder="کار انجام‌شده را شرح دهید…"
                          className="resize-y rounded-md border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-blue-500"
                        />
                      </label>
                      <div className="mt-2 flex justify-start gap-2">
                        <button type="button" onClick={() => setActiveTaskId(null)} className="h-9 rounded-md border border-slate-200 px-3 text-xs text-slate-600 hover:bg-slate-50">لغو</button>
                        <button
                          type="button"
                          disabled={submittingTaskId === task.id}
                          onClick={() => void submitResponse(task)}
                          className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                          <Send size={13} /> {submittingTaskId === task.id ? "در حال ارسال…" : "ارسال برای مدیر"}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            }) : (
              <p className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">فعالیتی برای شما ثبت نشده است.</p>
            )}
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold text-slate-800">خلاصه این هفته</h3>
            <div className="mt-4 space-y-3 text-xs text-slate-500">
              <div className="flex items-center justify-between gap-3"><span>کل فعالیت‌ها</span><b className="text-slate-800">{weeklyTasks.length.toLocaleString("fa-IR")}</b></div>
              <div className="flex items-center justify-between gap-3"><span>انجام شده</span><b className="text-slate-800">{completedCount.toLocaleString("fa-IR")}</b></div>
              <div className="flex items-center justify-between gap-3"><span>در جریان</span><b className="text-slate-800">{inProgressCount.toLocaleString("fa-IR")}</b></div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${completionPercent}%` }} />
            </div>
            <p className="mt-2 text-[10px] text-slate-400">{completionPercent.toLocaleString("fa-IR")}٪ تکمیل شده</p>
          </aside>
        </div>
      )}
    </div>
  );
}
