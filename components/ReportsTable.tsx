"use client";

import { MoreHorizontal } from "lucide-react";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/labels";
import { formatJalali, formatTime } from "@/lib/jalali";
import type { Report } from "@/lib/types";

interface Props {
  rows: Report[];
  totalRows: number;
  view: "active" | "archived";
  onView: (v: "active" | "archived") => void;
  archivedCount: number;
  showAll: boolean;
  onToggleAll: () => void;
  /** show the date next to the time (hidden for the daily period) */
  showDate: boolean;
  onOpenMenu: (report: Report, button: HTMLButtonElement) => void;
}

export default function ReportsTable({
  rows,
  totalRows,
  view,
  onView,
  archivedCount,
  showAll,
  onToggleAll,
  showDate,
  onOpenMenu,
}: Props) {
  const th = "px-3 py-2.5 text-start text-[0.85em] font-normal text-slate-500";
  const tab =
    "rounded-lg px-3.5 py-1 text-[0.88em] text-slate-500 aria-selected:bg-white aria-selected:font-semibold aria-selected:text-slate-900 aria-selected:shadow-sm";

  return (
    <section aria-label="گزارشات اخیر" className="min-h-[420px] rounded-2xl border border-line bg-white p-[clamp(16px,1.6vw,28px)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-[1.45em] font-bold">{view === "active" ? "گزارشات اخیر" : "بایگانی"}</h2>
          <p className="text-[0.88em] text-slate-500">
            {view === "active" ? "آخرین گزارشات دریافت شده و بررسی شده" : "گزارش‌هایی که بایگانی کرده‌اید"}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2.5">
          <div role="tablist" className="inline-flex rounded-[10px] bg-surface p-[3px]">
            <button role="tab" aria-selected={view === "active"} onClick={() => onView("active")} className={tab}>
              فعال
            </button>
            <button role="tab" aria-selected={view === "archived"} onClick={() => onView("archived")} className={tab}>
              بایگانی ({archivedCount})
            </button>
          </div>
          {totalRows > 8 && (
            <button onClick={onToggleAll} className="text-[0.85em] text-brand-deep hover:underline">
              {showAll ? "نمایش کمتر" : `نمایش همه (${totalRows})`}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              <th className={th}>عنوان گزارش</th>
              <th className={th}>فرستنده</th>
              <th className={th}>وضعیت</th>
              <th className={th}>تاریخ</th>
              <th className={th}>اکشن</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d = new Date(r.createdAt);
              return (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="max-w-[22ch] truncate px-3 py-2.5 text-[0.88em] font-medium" title={r.title}>
                    {r.title}
                  </td>
                  <td className="px-3 py-2.5 text-[0.88em] font-medium">{r.sender}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block whitespace-nowrap rounded-full px-[18px] py-1 text-[0.8em] font-semibold ${STATUS_BADGE[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[0.85em] text-slate-500">
                    <div dir="ltr" className="flex w-max flex-col items-end">
                      {showDate && <span>{formatJalali(d, "/")}</span>}
                      <span>{formatTime(d, true)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      aria-label={`عملیات برای ${r.title}`}
                      aria-haspopup="menu"
                      onClick={(e) => onOpenMenu(r, e.currentTarget)}
                      className="grid size-8 place-items-center rounded-lg text-slate-700 hover:bg-surface"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-3 py-14 text-center text-slate-500">
            {view === "active"
              ? "در این بازه گزارشی وجود ندارد. بازه زمانی را تغییر دهید."
              : "هنوز گزارشی بایگانی نشده است."}
          </p>
        )}
      </div>
    </section>
  );
}
