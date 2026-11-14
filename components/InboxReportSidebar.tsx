"use client";

import { CircleCheck, CircleX, Clock3, FileText } from "lucide-react";
import type { InboxAttachment, InboxReport } from "@/lib/inbox";
import { attachmentStyle } from "@/components/inboxAttachmentStyle";

type ReportDecision = "approved" | "rejected";

type InboxReportSidebarProps = {
  report: InboxReport;
  attachments: InboxAttachment[];
  decision: ReportDecision | null;
  isApproved: boolean;
  isRejected: boolean;
  statusLabel: string;
  decisionDate: string;
};

export default function InboxReportSidebar({
  report,
  attachments,
  decision,
  isApproved,
  isRejected,
  statusLabel,
  decisionDate,
}: InboxReportSidebarProps) {
  return (
    <aside
      className="order-2 flex min-h-0 flex-col gap-3 md:order-1 md:overflow-y-auto"
      dir="rtl">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-bold text-slate-900">وضعیت گزارش</h2>
        <span
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isApproved
              ? "bg-emerald-100 text-emerald-700"
              : isRejected
                ? "bg-red-100 text-red-700"
                : "bg-orange-100 text-orange-700"
          }`}>
          <span className="size-1.5 rounded-full bg-current" />
          {statusLabel}
        </span>
        <dl className="mt-4 space-y-3 text-xs">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">فرستنده</dt>
            <dd className="font-medium text-slate-800">{report.sender}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">تاریخ ارسال</dt>
            <dd dir="ltr" className="text-slate-700">
              {report.date} - {report.time}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">تاریخ تصمیم</dt>
            <dd dir="ltr" className="text-slate-700">
              {decision ? decisionDate : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-bold text-slate-900">روند بررسی</h2>
        <ol className="mt-4 space-y-4">
          <li className="flex items-start gap-3">
            <CircleCheck
              size={17}
              className="shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800">ارسال شد</p>
              <p dir="ltr" className="mt-1 text-[10px] text-slate-500">
                {report.date} - {report.time}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            {decision ? (
              isApproved ? (
                <CircleCheck
                  size={17}
                  className="shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
              ) : (
                <CircleX
                  size={17}
                  className="shrink-0 text-red-500"
                  aria-hidden="true"
                />
              )
            ) : (
              <Clock3
                size={17}
                className="shrink-0 text-orange-500"
                aria-hidden="true"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800">
                {isApproved
                  ? "تأیید شد"
                  : isRejected
                    ? "رد شد"
                    : "در حال بررسی"}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                {decision ? "تصمیم ثبت شده" : "نیازمند تصمیم"}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span
              className={`mt-0.5 size-3.5 shrink-0 rounded-full border-2 ${
                decision
                  ? "border-emerald-600 bg-emerald-600"
                  : "border-slate-300"
              }`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800">نتیجه</p>
              <p className="mt-1 text-[10px] text-slate-500">
                {decision ? statusLabel : "هنوز تصمیم ثبت نشده"}
              </p>
            </div>
          </li>
        </ol>
      </section>

      {attachments.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold text-slate-900">فایل‌ها</h2>
          <div className="mt-3 space-y-2">
            {attachments.map((attachment) => {
              const { extension, color } = attachmentStyle(attachment.name);
              return (
                <div
                  key={attachment.id}
                  className="flex min-w-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText
                      size={16}
                      className="shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span
                        className="block truncate text-xs font-semibold text-slate-800"
                        title={attachment.name}>
                        {attachment.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {attachment.size}
                      </span>
                    </span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-1 text-[9px] font-bold uppercase ${color}`}>
                    {extension || "FILE"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!decision && (
        <section className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <h2 className="text-sm font-bold text-brand-deep">دو تصمیم ممکن</h2>
          <p className="mt-2 text-xs leading-6 text-slate-600">
            تأیید: گزارش پذیرفته و کارمند مطلع می‌شود.
            <br />
            رد: گزارش برای اصلاح بازمی‌گردد.
          </p>
        </section>
      )}
    </aside>
  );
}
