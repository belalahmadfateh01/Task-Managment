"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Clock3,
  Pencil,
  UserRoundPen,
} from "lucide-react";
import { reports } from "@/lib/inbox";
import { formatJalali, fromInputDate } from "@/lib/jalali";
import type { Employee } from "@/lib/types";

interface EmployeeDetailsProps {
  employee: Employee;
  onBack: () => void;
  onAvatarChange: (avatar: string) => void;
}

export default function EmployeeDetails({
  employee,
  onBack,
  onAvatarChange,
}: EmployeeDetailsProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState("");
  const joined = fromInputDate(employee.joinedAt);
  const info = [
    ["نام و تخلص", employee.name],
    ["ایمیل", employee.email],
    ["شماره تلفن", employee.phone || "ثبت نشده"],
    ["آدرس", employee.address || "ثبت نشده"],
    ["تاریخ ثبت سیستم", joined ? formatJalali(joined, "/") : employee.joinedAt],
    ["آخرین زمان ورود", "اطلاعاتی ثبت نشده"],
  ];

  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("فرمت عکس باید JPG، PNG یا WEBP باشد.");
      event.currentTarget.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("حجم عکس نباید بیشتر از ۲ مگابایت باشد.");
      event.currentTarget.value = "";
      return;
    }

    const input = event.currentTarget;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onAvatarChange(reader.result);
        setPhotoError("");
      }
      input.value = "";
    };
    reader.onerror = () => {
      setPhotoError("خواندن عکس ناموفق بود. دوباره تلاش کنید.");
      input.value = "";
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto w-full max-w-280">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <ArrowRight size={16} /> بازگشت به فهرست
        </button>
        <span className="text-sm text-slate-500">پروفایل کارمند</span>
      </div>

      <div
        dir="ltr"
        className="grid min-h-[min(650px,calc(100vh-220px))] gap-3 md:h-[min(650px,calc(100vh-180px))] md:grid-cols-[minmax(0,1.35fr)_minmax(330px,1fr)]">
        <section
          dir="rtl"
          className="flex min-h-0 flex-col rounded-lg border border-blue-300 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                گزارش‌های اخیر
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                آخرین وضعیت گزارش‌های دریافت‌شده و بررسی‌شده
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {reports.length.toLocaleString("fa-IR")} مورد
            </span>
          </div>
          <div className="mt-5 hidden grid-cols-[minmax(0,1fr)_auto_auto_24px] items-center gap-3 px-1 text-xs text-slate-400 sm:grid">
            <span>عنوان گزارش</span>
            <span>وضعیت</span>
            <span>تاریخ</span>
            <span />
          </div>
          <div className="mt-2 min-h-0 divide-y divide-slate-100 overflow-y-auto">
            {reports.map((report) => {
              const isRead = report.category === "خوانده شده";
              return (
                <Link
                  key={report.id}
                  href={`/inbox/${report.id}`}
                  className="grid min-h-15.5 grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-x-2 gap-y-1 px-1 py-2 text-[10px] hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto_auto_24px] sm:gap-3 sm:py-0 sm:text-xs">
                  <span className="min-w-0 truncate text-slate-700">
                    {report.title}
                  </span>
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-medium sm:px-3 sm:text-[10px] ${
                      isRead
                        ? "bg-indigo-50 text-indigo-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                    {report.category}
                  </span>
                  <span
                    className="col-start-1 row-start-2 text-[9px] text-slate-500 sm:col-auto sm:row-auto sm:whitespace-nowrap sm:text-xs"
                    dir="ltr">
                    {report.date} - {report.time}
                  </span>
                  <span className="col-start-3 row-span-2 text-slate-400 sm:row-auto">
                    <ChevronLeft size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-xs text-slate-500">
            <Clock3 size={15} /> به‌روزرسانی‌شده در روز جاری
          </div>
        </section>

        <section
          dir="rtl"
          className="flex flex-col overflow-y-auto rounded-lg border border-blue-300 bg-white p-4 sm:p-5">
          <div className="relative mx-auto mb-6 mt-2 grid size-36 place-items-center">
            <Image
              src={employee.avatar}
              alt={`تصویر ${employee.name}`}
              fill
              sizes="144px"
              unoptimized={employee.avatar.startsWith("data:")}
              className="rounded-lg border border-blue-300 object-cover"
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              aria-label="تغییر تصویر پروفایل"
              title="تغییر تصویر پروفایل"
              className="absolute -bottom-2 -right-2 grid size-8 place-items-center rounded-full bg-brand text-white shadow-sm hover:bg-brand-deep">
              <Pencil size={15} />
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={selectPhoto}
              className="hidden"
              aria-label="انتخاب تصویر پروفایل"
            />
          </div>
          {photoError && (
            <p role="alert" className="mb-3 text-center text-xs text-red-600">
              {photoError}
            </p>
          )}
          <div className="mt-auto overflow-hidden rounded-lg border border-blue-500">
            <div className="flex items-center justify-between bg-blue-50 px-3 py-2.5">
              <h2 className="font-semibold text-slate-800">مشخصات کارمند</h2>
              <span className="grid size-7 place-items-center rounded-full bg-blue-600 text-white">
                <UserRoundPen size={15} />
              </span>
            </div>
            <dl>
              {info.map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 text-xs sm:text-sm ${index < info.length - 1 ? "border-b border-dashed border-blue-400" : ""}`}>
                  <dt className="text-blue-700">{label}</dt>
                  <dd
                    className="min-w-0 truncate text-left font-medium text-slate-800"
                    dir={
                      label === "ایمیل" || label === "شماره تلفن"
                        ? "ltr"
                        : undefined
                    }>
                    {value}
                  </dd>
                </div>
              ))}
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-dashed border-blue-400 px-3 py-2.5 text-xs sm:text-sm">
                <dt className="text-blue-700">وضعیت حساب</dt>
                <dd className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <Check size={14} /> فعال
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
