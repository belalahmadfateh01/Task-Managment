"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  CircleCheck,
  CircleX,
  Clock3,
  FileText,
  MailOpen,
  Paperclip,
  Plus,
  Send,
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

const statusInfo: Record<
  EmployeeReportStatus,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  pending: {
    label: "در انتظار بررسی",
    className: "bg-orange-100 text-orange-800",
    icon: Clock3,
  },
  approved: {
    label: "تأیید شده",
    className: "bg-green-100 text-green-800",
    icon: CircleCheck,
  },
  rejected: {
    label: "رد شده",
    className: "bg-red-100 text-red-800",
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
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    const session = readSession();
    if (session?.role !== "employee") return;
    setEmployeeId(session.employeeId);
    setReports(readEmployeeReports());
  }, []);

  return {
    employeeId,
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

function StatusBadge({ status }: { status: EmployeeReportStatus }) {
  const { label, className, icon: Icon } = statusInfo[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}>
      <Icon size={13} /> {label}
    </span>
  );
}

function reportDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function EmployeeDashboard() {
  const { reports } = useEmployeeReports();
  const pendingCount = reports.filter(
    (report) => report.status === "pending",
  ).length;
  const approvedCount = reports.filter(
    (report) => report.status === "approved",
  ).length;
  const latestReports = reports
    .filter((report) => report.status !== "draft")
    .slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">خوش آمدید</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            گزارش‌های کاری شما
          </h2>
        </div>
        <Link
          href="/employee/reports/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus size={17} /> گزارش جدید
        </Link>
      </div>

      <section
        className="grid gap-3 sm:grid-cols-3"
        aria-label="خلاصه گزارش‌ها">
        {[
          {
            label: "همه گزارش‌ها",
            value: reports.filter((report) => report.status !== "draft").length,
          },
          { label: "در انتظار بررسی", value: pendingCount },
          { label: "تأیید شده", value: approvedCount },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
            <span className="text-sm text-slate-600">{item.label}</span>
            <strong className="text-lg text-slate-900">
              {item.value.toLocaleString("fa-IR")}
            </strong>
          </div>
        ))}
      </section>

      {latestReports.length ? (
        <section className="border-t border-slate-200 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">آخرین گزارش‌ها</h3>
            <Link
              href="/employee/inbox"
              className="text-xs font-semibold text-blue-700 hover:underline">
              همه گزارش‌ها
            </Link>
          </div>
          <ReportRows reports={latestReports} />
        </section>
      ) : (
        <section className="flex min-h-[330px] flex-col items-center justify-center border-t border-slate-200 px-4 text-center">
          <div className="mb-4 grid size-20 place-items-center rounded-full bg-blue-50 text-blue-600">
            <MailOpen size={36} strokeWidth={1.4} />
          </div>
          <h3 className="font-bold text-slate-800">
            هنوز گزارشی ارسال نکرده‌اید
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            گزارش فعالیت خود را برای مدیر ارسال کنید.
          </p>
          <Link
            href="/employee/reports/new"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700">
            <Send size={16} /> ارسال اولین گزارش
          </Link>
        </section>
      )}
    </div>
  );
}

function ReportRows({ reports }: { reports: EmployeeReport[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {reports.map((report) => (
        <Link
          href={`/employee/reports/${report.id}`}
          key={report.id}
          className="grid min-h-[66px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-200 px-4 py-3 last:border-0 hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <span className="min-w-0">
            <strong className="block truncate text-sm font-semibold text-slate-800">
              {report.title}
            </strong>
            <span className="mt-1 block text-[11px] text-slate-500">
              {reportDate(report.createdAt)}
            </span>
          </span>
          <span className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
            {report.attachment && <Paperclip size={14} />}
          </span>
          <StatusBadge status={report.status} />
        </Link>
      ))}
    </div>
  );
}

export function EmployeeReportList({
  draftsOnly = false,
}: {
  draftsOnly?: boolean;
}) {
  const { reports } = useEmployeeReports();
  const items = draftsOnly
    ? reports.filter((report) => report.status === "draft")
    : reports.filter((report) => report.status !== "draft");

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {draftsOnly ? "پیش‌نویس‌ها" : "گزارش‌های من"}
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
      {items.length ? (
        <ReportRows reports={items} />
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center border-t border-slate-200 text-center">
          <FileText size={30} className="text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            {draftsOnly ? "پیش‌نویسی ندارید" : "هنوز گزارشی ارسال نکرده‌اید"}
          </p>
          {!draftsOnly && (
            <Link
              href="/employee/reports/new"
              className="mt-3 text-xs font-semibold text-blue-700 hover:underline">
              ارسال گزارش جدید
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export function EmployeeReportPage({ reportId }: { reportId: string }) {
  const { reports } = useEmployeeReports();
  const report = reports.find((item) => item.id === reportId);

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="font-semibold text-slate-700">گزارش پیدا نشد.</p>
        <Link
          href="/employee/inbox"
          className="mt-3 inline-block text-sm text-blue-700">
          بازگشت به گزارش‌ها
        </Link>
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
        href="/employee/inbox"
        className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">
        <ArrowRight size={14} /> بازگشت به گزارش‌های من
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
              {report.attachment.url && (
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
  const { employeeId, reports } = useEmployeeReports();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<EmployeeReport["attachment"]>();
  const [error, setError] = useState("");
  const draft = reports.find((report) => report.id === draftId);
  const rejectedReport = reports.find(
    (report) => report.id === draftId && report.status === "rejected",
  );

  useEffect(() => {
    if (!draft) return;
    setTitle(draft.title);
    setContent(draft.content);
    setAttachment(draft.attachment);
  }, [draft]);

  const selectAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("حجم پیوست نباید بیشتر از ۲ مگابایت باشد.");
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
        setError("");
      }
    };
    reader.onerror = () => setError("خواندن فایل ناموفق بود.");
    reader.readAsDataURL(file);
  };

  const save = (status: "pending" | "draft") => {
    if (!employeeId) return;
    if (!title.trim() || !content.trim()) {
      setError("عنوان و متن گزارش را وارد کنید.");
      return;
    }

    const now = new Date().toISOString();
    const nextReport: EmployeeReport = {
      id: draft?.id ?? crypto.randomUUID(),
      employeeId,
      title: title.trim(),
      content: content.trim(),
      createdAt: draft?.createdAt ?? now,
      status,
      attachment,
      ...(status === "pending" && rejectedReport
        ? { reviewedAt: undefined, reviewNote: undefined }
        : {}),
    };
    const savedReports = readEmployeeReports().filter(
      (report) => report.id !== nextReport.id,
    );
    writeEmployeeReports([nextReport, ...savedReports]);
    router.push(
      status === "draft"
        ? "/employee/drafts"
        : `/employee/reports/${nextReport.id}`,
    );
  };

  return (
    <form
      className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_240px]"
      onSubmit={(event) => {
        event.preventDefault();
        save("pending");
      }}>
      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900">
            {draft ? "ویرایش گزارش" : "گزارش جدید"}
          </h2>
          <Link
            href="/employee/dashboard"
            aria-label="بازگشت"
            className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowRight size={17} />
          </Link>
        </div>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          عنوان گزارش
          <input
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            maxLength={120}
            className="h-11 rounded-md border border-slate-200 px-3 outline-none focus:border-blue-500"
            placeholder="عنوان گزارش را بنویسید"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          متن گزارش
          <textarea
            value={content}
            onChange={(event) => setContent(event.currentTarget.value)}
            rows={13}
            className="resize-y rounded-md border border-slate-200 px-3 py-3 text-sm leading-7 outline-none focus:border-blue-500"
            placeholder="متن گزارش را اینجا بنویسید..."
          />
        </label>
        <div>
          <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-600 hover:bg-blue-50">
            <span className="flex items-center gap-2">
              <Upload size={16} /> فایل را انتخاب کنید (حداکثر ۲ مگابایت)
            </span>
            <input
              type="file"
              onChange={selectAttachment}
              className="sr-only"
            />
            <Paperclip size={16} />
          </label>
          {attachment && (
            <div className="mt-2 flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-xs">
              <span className="min-w-0 truncate">
                {attachment.name}{" "}
                <span className="text-slate-500">({attachment.size})</span>
              </span>
              <button
                type="button"
                aria-label="حذف پیوست"
                onClick={() => setAttachment(undefined)}
                className="mr-2 text-red-600">
                <X size={16} />
              </button>
            </div>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => save("draft")}
            className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            ذخیره پیش‌نویس
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700">
            <Send size={15} /> ارسال گزارش
          </button>
        </div>
      </section>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-bold text-slate-800">پیش از ارسال</h3>
        <ul className="mt-3 space-y-3 text-xs leading-5 text-slate-600">
          <li className="flex gap-2">
            <Check size={15} className="shrink-0 text-green-600" /> عنوان گزارش
            وارد شده است
          </li>
          <li className="flex gap-2">
            <Check size={15} className="shrink-0 text-green-600" /> متن گزارش
            قابل بررسی است
          </li>
          <li className="flex gap-2">
            <Clock3 size={15} className="shrink-0 text-blue-600" /> پس از ارسال،
            وضعیت را در گزارش‌های من ببینید
          </li>
        </ul>
      </aside>
    </form>
  );
}

export function EmployeeTasksPage() {
  const { reports } = useEmployeeReports();
  const activity = reports
    .filter((report) => report.status !== "draft")
    .slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h2 className="mb-4 text-lg font-bold text-slate-900">
        فعالیت‌های گزارش‌ها
      </h2>
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
        {!activity.length ? (
          <p className="py-10 text-center text-sm text-slate-500">
            فعالیتی برای نمایش وجود ندارد.
          </p>
        ) : (
          <ol className="space-y-0">
            {activity.map((report) => {
              const info = statusInfo[report.status];
              const Icon = info.icon;
              return (
                <li
                  key={report.id}
                  className="flex gap-3 border-r-2 border-slate-200 pb-6 pr-4 last:border-transparent last:pb-0">
                  <span
                    className={`-mr-[25px] grid size-6 shrink-0 place-items-center rounded-full ${info.className}`}>
                    <Icon size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/employee/reports/${report.id}`}
                      className="truncate text-sm font-semibold text-slate-800 hover:text-blue-700">
                      {report.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {info.label} ·{" "}
                      {reportDate(report.reviewedAt ?? report.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
