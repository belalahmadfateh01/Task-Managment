"use client";

import { Check, Info, X } from "lucide-react";
import type { InboxReport } from "@/lib/inbox";

type ReportDecision = "approved" | "rejected";

type InboxDecisionDialogProps = {
  report: InboxReport;
  pendingDecision: ReportDecision;
  feedbackText: string;
  onFeedbackTextChange: (feedback: string) => void;
  isSaving: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function InboxDecisionDialog({
  report,
  pendingDecision,
  feedbackText,
  onFeedbackTextChange,
  isSaving,
  error,
  onCancel,
  onConfirm,
}: InboxDecisionDialogProps) {
  return (
    <div
      className="fixed inset-0 z-60 grid place-items-center bg-slate-900/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-title"
        className="w-full max-w-90 rounded-lg bg-white p-5 shadow-xl"
        dir="rtl">
        <div className="flex flex-col items-center text-center">
          <span
            className={`grid size-10 place-items-center rounded-full ${
              pendingDecision === "approved"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-500"
            }`}>
            {pendingDecision === "approved" ? (
              <Check size={22} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <X size={22} strokeWidth={2.5} aria-hidden="true" />
            )}
          </span>
          <h2
            id="decision-title"
            className="mt-2 text-base font-bold text-slate-900">
            {pendingDecision === "approved" ? "تأیید گزارش" : "رد گزارش"}
          </h2>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            گزارش «{report.title}» برای {report.sender}{" "}
            {pendingDecision === "approved" ? "تأیید" : "رد"} خواهد شد.
          </p>
        </div>
        <div
          className={`mt-4 flex items-center gap-2 rounded-md p-3 text-[11px] ${
            pendingDecision === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-700"
          }`}>
          <Info size={15} className="shrink-0" aria-hidden="true" />
          <span>
            {pendingDecision === "approved"
              ? "این تصمیم نهایی است و پس از ثبت قابل بازگشت نیست."
              : "این تصمیم نهایی است و گزارش برای اصلاح بازمی‌گردد."}
          </span>
        </div>
        {pendingDecision === "rejected" && (
          <label className="mt-3 grid gap-1.5 text-[11px] font-medium text-slate-700">
            دلیل بازگشت برای اصلاح
            <textarea
              value={feedbackText}
              onChange={(event) => onFeedbackTextChange(event.currentTarget.value)}
              maxLength={10000}
              rows={3}
              required
              className="resize-y rounded-md border border-slate-300 px-2.5 py-2 text-xs font-normal outline-none focus:border-blue-500"
              placeholder="نکته‌های لازم برای اصلاح گزارش را بنویسید"
            />
          </label>
        )}
        {error && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}
        <div className="mt-4 flex flex-row-reverse justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            انصراف
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isSaving || (pendingDecision === "rejected" && !feedbackText.trim())}
            autoFocus={pendingDecision === "approved"}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-white ${
              pendingDecision === "approved"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}>
            {pendingDecision === "approved" ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <X size={14} aria-hidden="true" />
            )}
            {isSaving ? "در حال ثبت…" : pendingDecision === "approved" ? "تأیید نهایی" : "ارسال بازخورد و بازگشت"}
          </button>
        </div>
      </section>
    </div>
  );
}
