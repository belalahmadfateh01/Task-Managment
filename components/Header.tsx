"use client";

import { Bell, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { formatJalali, formatTime } from "@/lib/jalali";

type HeaderProps = {
  title?: string;
  description?: string;
};

export default function Header({
  title = "نمای کلی",
  description = "خلاصه وضعیت عملکرد و گزارش‌های اخیر",
}: HeaderProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className=" flex items-center justify-between gap-4  bg-white px-[var(--gap)] py-4">
      <div>
        <h1 className="text-[1.5em] font-bold">{title}</h1>
        <p className="text-[0.88em] text-slate-500">{description}</p>
      </div>
      <div className="flex flex-row-reverse items-center gap-3">
        <div
          className="grid size-11 place-items-center rounded-full bg-slate-600 font-bold text-white"
          aria-label="پروفایل کاربر">
          م
        </div>
        <button
          aria-label="اعلان‌ها"
          className="relative grid size-11 place-items-center rounded-xl border border-line text-slate-700 hover:bg-surface">
          <Bell size={20} strokeWidth={1.6} />
          <span className="absolute right-2.5 top-2 size-2 rounded-full bg-red-500" />
        </button>
        <div className="flex h-11 items-center gap-2.5 rounded-xl border border-line px-3.5 font-medium text-slate-700">
          <CalendarDays size={18} strokeWidth={1.6} aria-hidden />
          <span className="max-md:hidden">{now ? formatJalali(now) : "—"}</span>
          <i className="h-5 w-px bg-line max-md:hidden" />
          <b className="font-semibold text-sky-600">
            {now ? formatTime(now) : ""}
          </b>
        </div>
      </div>
    </header>
  );
}
