"use client";

import { CircleCheck, CircleX, Download } from "lucide-react";
import type { InboxAttachment, InboxReport } from "@/lib/inbox";
import { attachmentStyle } from "@/components/inboxAttachmentStyle";

type ReportDecision = "approved" | "rejected";

type InboxReportContentProps = {
  report: InboxReport;
  attachments: InboxAttachment[];
  paragraphs: string[];
  decision: ReportDecision | null;
  isApproved: boolean;
  isRejected: boolean;
  statusLabel: string;
  decisionDate: string;
  notifySender: boolean;
};

export default function InboxReportContent({
  report,
  attachments,
  paragraphs,
  decision,
  isApproved,
  isRejected,
  statusLabel,
  decisionDate,
  notifySender,
}: InboxReportContentProps) {
  return (
    <section
      className="order-1 flex min-h-0 flex-col gap-2 overflow-hidden md:order-2"
      dir="rtl">
      {decision && (
        <div
          role="status"
          className={`flex shrink-0 items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
            isApproved
              ? "border-green-400 bg-green-100 text-green-800"
              : "border-red-400 bg-red-100 text-red-800"
          }`}>
          <div className="flex min-w-0 items-center gap-2">
            {isApproved ? (
              <CircleCheck size={20} className="shrink-0" aria-hidden="true" />
            ) : (
              <CircleX size={20} className="shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold">
                {isApproved
                  ? "این گزارش را تأیید کردید"
                  : "این گزارش را رد کردید"}
              </p>
              <p className="mt-0.5 text-[10px]">
                ثبت شده: {decisionDate}
                {notifySender ? ` · اعلان برای ${report.sender} ارسال شد` : ""}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold">
            {statusLabel}
          </span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white px-5 py-5 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500">فرستنده</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="grid size-7 place-items-center rounded-full bg-brand text-xs font-bold text-white"
                aria-hidden="true">
                {report.sender.slice(0, 1)}
              </span>
              <p className="text-xs font-semibold text-slate-900">
                {report.sender}
              </p>
            </div>
          </div>
          <div className="text-left">
            <time dir="ltr" className="block text-[10px] text-slate-500">
              {report.date} - {report.time}
            </time>
            <span
              className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${
                isApproved
                  ? "bg-green-100 text-green-700"
                  : isRejected
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
              }`}>
              <span className="size-1 rounded-full bg-current" />
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <h1 className="text-lg font-bold text-slate-950 sm:text-xl">
            {report.title}
          </h1>
          <div className="mt-4 space-y-3 text-right text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">
            {paragraphs.map((paragraph, index) => (
              <p key={`${report.id}-paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>
        </div>

        {attachments.length > 0 && (
          <section
            className="mt-6 flex justify-start"
            aria-label="پیوست‌های گزارش">
            {attachments.map((attachment) => {
              const { extension, color } = attachmentStyle(attachment.name);
              return (
                <div
                  key={attachment.id}
                  className="flex w-full max-w-70 items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2">
                  <div className="min-w-0">
                    <p
                      className="truncate text-xs font-semibold text-slate-800"
                      title={attachment.name}>
                      {attachment.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {attachment.size}
                    </p>
                  </div>
                  {attachment.url ? (
                    <a
                      href={attachment.url}
                      download={attachment.name}
                      aria-label={`دانلود ${attachment.name}`}
                      className="grid size-7 shrink-0 place-items-center rounded bg-slate-50 text-slate-600 hover:bg-slate-100">
                      <Download size={15} aria-hidden="true" />
                    </a>
                  ) : (
                    <span
                      className={`rounded px-1.5 py-1 text-[9px] font-bold uppercase ${color}`}>
                      {extension || "FILE"}
                    </span>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </section>
  );
}
