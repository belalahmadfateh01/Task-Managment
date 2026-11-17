"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  PERIOD_KEYS,
  PERIOD_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/lib/labels";
import type { CustomRange, DateRange, PeriodKey, Status } from "@/lib/types";
import { formatJalali } from "@/lib/jalali";

interface Props {
  period: PeriodKey;
  onPeriod: (p: PeriodKey) => void;
  custom: CustomRange;
  onCustom: (c: CustomRange) => void;
  range: DateRange;
  counts: Record<Status, number>;
}

const R = 100;
const SW = 26; // stroke width
const C = 2 * Math.PI * R;

function Donut({ counts }: { counts: Record<Status, number> }) {
  const total = STATUS_ORDER.reduce((s, k) => s + counts[k], 0);
  const segs = STATUS_ORDER.filter((k) => counts[k] > 0);
  const gap = segs.length > 1 ? 14 : 0;
  let acc = 0;

  return (
    <div className="relative mx-auto my-1.5 aspect-square w-full max-w-[300px]">
      <svg
        viewBox="0 0 260 260"
        role="img"
        aria-label={`مجموع گزارش‌ها: ${total}`}
        className="size-full"
      >
        <g
          transform="translate(130 130) rotate(-90)"
          fill="none"
          strokeWidth={SW}
          strokeLinecap="round"
        >
          {total === 0 && <circle r={R} stroke="#e2e8f0" />}
          {segs.map((k) => {
            const visible = Math.max((counts[k] / total) * C - gap, SW + 0.5);
            const dash = visible - SW; // round caps add SW to the visible length
            const offset = -(acc + gap / 2 + SW / 2);
            acc += (counts[k] / total) * C;
            return (
              <circle
                key={k}
                r={R}
                stroke={STATUS_COLOR[k]}
                strokeDasharray={`${dash} ${C}`}
                strokeDashoffset={offset}
              />
            );
          })}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
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
      className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-[clamp(16px,1.6vw,28px)] md:max-lap:grid md:max-lap:grid-cols-[minmax(200px,300px)_1fr] md:max-lap:items-center md:max-lap:gap-x-8"
    >
      <div className="flex flex-col gap-1 md:max-lap:col-span-full">
        <div ref={periodMenuRef} className="relative self-start">
          <button
            ref={periodButtonRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={periodMenuOpen}
            aria-label="بازه گزارش"
            onClick={() => setPeriodMenuOpen((open) => !open)}
            className="inline-flex cursor-pointer items-center gap-1.5 py-1 text-[1.2em] font-bold text-slate-900"
          >
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
              className="absolute right-0 top-full z-20 mt-2 min-w-max rounded-xl border border-line bg-white p-1.5 text-right shadow-xl"
            >
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
                  }`}
                >
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
