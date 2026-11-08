"use client";

import { useMemo, useState } from "react";

// بخش: تب‌های اصلی فیلتر
const tabs = ["همه", "خوانده شده ", "نخوانده شده"];

// بخش: گزینه‌های موجود در منوی dropdown
const filterOptions = ["دارای ضمیمه", "بدون ضمیمه", "تازه‌ترین", "قدیمی‌ترین"];

// بخش: داده‌های نمونه‌ای که در فیلترها نمایش داده می‌شوند
const reports = [
  {
    id: 1,
    title: "گزارش فروش ماهانه",
    category: "خوانده نشده ",
    hasAttachment: true,
    createdAt: 4,
  },
  {
    id: 2,
    title: "بررسی عملکرد تیم",
    category: "خوانده شده",
    hasAttachment: false,
    createdAt: 2,
  },
  {
    id: 3,
    title: "فهرست درخواست‌های جدید",
    category: "خوانده نشده",
    hasAttachment: true,
    createdAt: 6,
  },
  {
    id: 4,
    title: "گزارش مالی سه ماهه",
    category: "خوانده شده",
    hasAttachment: false,
    createdAt: 1,
  },
  {
    id: 5,
    title: "نکات اجرای پروژه",
    category: "خوانده نشده ",
    hasAttachment: true,
    createdAt: 5,
  },
];

export default function NavbarIndex() {
  // بخش: وضعیت انتخاب تب فعال
  const [activeTab, setActiveTab] = useState("همه");

  // بخش: وضعیت انتخاب فیلتر dropdown
  const [selectedFilter, setSelectedFilter] = useState("خوانده شده");

  // بخش: وضعیت باز یا بسته بودن منوی dropdown
  const [isOpen, setIsOpen] = useState(false);

  // بخش: فیلتر کردن گزارش‌ها بر اساس تب و گزینه انتخابی
  const filteredReports = useMemo(() => {
    const baseList = reports.filter((item) => {
      if (activeTab === "همه") return true;
      return item.category === activeTab;
    });

    switch (selectedFilter) {
      case "دارای ضمیمه":
        return baseList.filter((item) => item.hasAttachment);
      case "بدون ضمیمه":
        return baseList.filter((item) => !item.hasAttachment);
      case "تازه‌ترین":
        return [...baseList].sort((a, b) => b.createdAt - a.createdAt);
      case "قدیمی‌ترین":
        return [...baseList].sort((a, b) => a.createdAt - b.createdAt);
      default:
        return baseList;
    }
  }, [activeTab, selectedFilter]);

  return (
    <div dir="ltr" className="w-full p-4">
      {/* بخش: wrapper اصلی نوار فیلتر */}
      <div className="flex items-center justify-between gap-4  ">
        {/* بخش: تب‌های فیلتر سمت چپ */}
        <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-2">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  " px-3 py-1 text-sm text-[#485261] ",
                  isActive
                    ? "bg-[#23B2EF] text-white rounded-2xl shadow-[0_8px_20px_rgba(29,155,240,0.35)]"
                    : " text-[#485261]",
                ].join(" ")}>
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex flex-row-reverse items-center gap-1">
          {/* بخش: آیکون چک‌باکس کنار dropdown */}
          <button
            type="button"
            aria-label="checkbox filter"
            className="flex h-10 w-10 items-center justify-center">
            <img src="/imges/chekbox.svg" alt="checkbox" className="h-5 w-5" />
          </button>

          {/* بخش: منوی dropdown اصلی */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              className="flex items-center gap-3 px-4 py-2 text-[15px] font-medium text-[#111827] shadow-none">
              <span className="#1C1D22 font-bold ">صندوق ورودی</span>
              <span className="flex h-7 w-7 items-center justify-center ">
                <img
                  src="/imges/dropdown.svg"
                  alt="dropdown"
                  className={
                    isOpen
                      ? "h-4 w-4 rotate-180 transition-transform"
                      : "h-4 w-4 transition-transform"
                  }
                />
              </span>
            </button>

            {/* بخش: لیست گزینه‌های dropdown */}
            {isOpen && (
              <div className="absolute left-0 top-[calc(100%+12px)] z-20 w-[120px] rounded-[18px] border border-[#E5E7EB] bg-white p-2 shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSelectedFilter(option);
                      setIsOpen(false);
                    }}
                    className={[
                      "flex w-full items-center justify-start rounded-xl border border-transparent px-3 py-2 text-right text-sm transition-colors",
                      selectedFilter === option
                        ? "border-[#D9E8FF] bg-[#EAF4FF] text-[#23B2EF]"
                        : "text-[#374151] hover:bg-[#F3F6FB]",
                    ].join(" ")}>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* بخش: نمایش نتایج فیلتر شده */}
      <div className="mt-5 space-y-3 rounded-[18px] bg-white p-4 shadow-sm ring-1 ring-[#E7EDF8]">
        {filteredReports.length ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between rounded-xl border border-[#EEF2F7] px-4 py-3 text-sm">
              <span className="font-medium text-[#111827]">{report.title}</span>
              <span className="rounded-full bg-[#F3F6FB] px-2 py-1 text-xs text-[#4B5563]">
                {report.category}
              </span>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-sm text-[#6B7280]">
            برای این فیلتر گزارشی وجود ندارد.
          </p>
        )}
      </div>
    </div>
  );
}
