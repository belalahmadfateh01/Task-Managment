"use client";

import { Paperclip } from "lucide-react";
import Link from "next/link";
import type { InboxReport } from "@/lib/inbox";

export default function Items({
  items,
  selectedIds,
  onToggleSelected,
}: {
  items: InboxReport[];
  selectedIds: number[];
  onToggleSelected: (id: number) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="bg-white px-4 py-8 text-center text-sm text-slate-500">
        برای این فیلتر گزارشی وجود ندارد.
      </p>
    );
  }

  return (
    <div className="overflow-hidden bg-white">
      {items.map((report) => (
        <div
          key={report.id}
          className={`flex min-h-11 items-center gap-3 px-3 ${
            report.category === "خوانده شده"
              ? "text-slate-500"
              : "text-slate-900"
          }`}>
          <div
            dir="ltr"
            className="flex min-w-0 flex-1 items-center justify-start gap-2 text-xs">
            <span className="min-w-0 truncate whitespace-nowrap">
              {report.date} - {report.time}
            </span>
            {report.hasAttachment && (
              <Paperclip
                size={17}
                strokeWidth={1.6}
                aria-label="دارای پیوست"
                className="shrink-0"
              />
            )}
          </div>
          <Link
            href={`/inbox/${report.id}`}
            className="min-w-0 flex-[2] truncate text-center font-semibold hover:text-brand-deep"
            title={report.title}>
            {report.title}
          </Link>
          <label className="flex min-w-0 flex-1 justify-end gap-3">
            <span className="truncate font-medium">{report.sender}</span>
            <input
              type="checkbox"
              checked={selectedIds.includes(report.id)}
              onChange={() => onToggleSelected(report.id)}
              aria-label={`انتخاب گزارش ارسالی از ${report.sender}`}
              className="size-4 shrink-0 accent-sky-500"
            />
          </label>
        </div>
      ))}
    </div>
  );
}
