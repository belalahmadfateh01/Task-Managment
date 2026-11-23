"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  PERIOD_KEYS,
  PERIOD_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/lib/labels";
import type { CustomRange, DateRange, PeriodKey, Status } from "@/lib/types";

interface Props {
  period: PeriodKey;
  onPeriod: (p: PeriodKey) => void;
  custom: CustomRange;
  onCustom: (c: CustomRange) => void;
  range: DateRange;
  counts: Record<Status, number>;
}

function Donut({ counts }: { counts: Record<Status, number> }) {
  const total = STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);
  const data = STATUS_ORDER.map((status) => ({
    status,
    value: counts[status],
  })).filter((item) => item.value > 0);

  return (
    <div
      role="img"
      aria-label={`مجموع گزارش‌ها: ${total}`}
      className="relative mx-auto my-1.5 aspect-square w-full max-w-[300px]">
      {total > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius="72%"
              outerRadius="92%"
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
              stroke="none">
              {data.map((item) => (
                <Cell key={item.status} fill={STATUS_COLOR[item.status]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="absolute inset-[8%] rounded-full bg-slate-200" />
      )}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <strong className="text-[2em] leading-tight">
          {total.toLocaleString("en-US")}
        </strong>
        <span className="text-[0.88em] text-slate-500">گزارش</span>
      </div>
    </div>
  );
}

const dateInput =
  "rounded-[10px] border border-line bg-white px-2.5 py-2 text-slate-900";

export default function DonutCard({
  period,
  onPeriod,
  custom,
  onCustom,
  range,
  counts,
}: Props) {
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const periodMenuRef = useRef<HTMLDivElement>(null);
  const periodButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!periodMenuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!periodMenuRef.current?.contains(event.target as Node))
        setPeriodMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPeriodMenuOpen(false);
        periodButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [periodMenuOpen]);

  return (
    <section
      aria-label="نمودار گزارش‌ها"
      className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-[clamp(16px,1.6vw,28px)] md:max-lap:grid md:max-lap:grid-cols-[minmax(200px,300px)_1fr] md:max-lap:items-center md:max-lap:gap-x-8">
      <div className="flex flex-col gap-1 md:max-lap:col-span-full">
        <div ref={periodMenuRef} className="relative self-start">
          <button
            ref={periodButtonRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={periodMenuOpen}
            aria-label="بازه گزارش"
            onClick={() => setPeriodMenuOpen((open) => !open)}
            className="inline-flex cursor-pointer items-center gap-1.5 py-1 text-[1.2em] font-bold text-slate-900">
            <ChevronDown
              size={18}
              aria-hidden
              className={`transition-transform ${periodMenuOpen ? "rotate-180" : ""}`}
            />
            {PERIOD_LABEL[period]}
          </button>
          {periodMenuOpen && (
            <div
              role="listbox"
              aria-label="بازه گزارش"
              className="absolute right-0 top-full z-20 mt-2 min-w-max rounded-xl border border-line bg-white p-1.5 text-right shadow-xl">
              {PERIOD_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={period === key}
                  onClick={() => {
                    onPeriod(key);
                    setPeriodMenuOpen(false);
                    periodButtonRef.current?.focus();
                  }}
                  className={`block w-full items-center gap-2 rounded-lg px-3 py-2 text-right text-sm transition hover:bg-surface ${
                    period === key
                      ? "font-bold text-slate-900"
                      : "font-normal text-slate-500"
                  }`}>
                  {PERIOD_LABEL[key]}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* {period !== "daily" && (
          <p dir="ltr" className="text-right text-[0.88em] text-slate-500">
            {formatJalali(range.from, "/")} ← {formatJalali(range.to, "/")}
          </p>
        )} */}
      </div>

      {period === "custom" && (
        <div className="grid grid-cols-2 gap-2.5 md:max-lap:col-span-full">
          <label className="flex flex-col gap-1 text-[0.82em] text-slate-500">
            از تاریخ
            <input
              type="date"
              className={dateInput}
              value={custom.from}
              max={custom.to || undefined}
              onChange={(e) => onCustom({ ...custom, from: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-[0.82em] text-slate-500">
            تا تاریخ
            <input
              type="date"
              className={dateInput}
              value={custom.to}
              min={custom.from || undefined}
              onChange={(e) => onCustom({ ...custom, to: e.target.value })}
            />
          </label>
        </div>
      )}

      <Donut counts={counts} />

      <ul className="flex flex-col gap-3.5">
        {STATUS_ORDER.map((k) => (
          <li key={k} className="flex items-center justify-between font-medium">
            <span className="inline-flex items-center gap-2 text-[0.88em]">
              <i
                className="size-2.5 rounded-full"
                style={{ background: STATUS_COLOR[k] }}
              />
              {STATUS_LABEL[k]}
            </span>
            <b className="text-[1.15em] font-bold">
              {counts[k].toLocaleString("en-US")}
            </b>
          </li>
        ))}
      </ul>
    </section>
  );
}
