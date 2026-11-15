"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Clock3,
  Pencil,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatJalali, fromInputDate } from "@/lib/jalali";
import type { Employee } from "@/lib/types";
import ProfileEditor, { type EditableEmployeeProfile } from "@/components/ProfileEditor";

interface EmployeeDetailsProps {
  employee: Employee;
  onBack: () => void;
  onProfileUpdated: (profile: EditableEmployeeProfile) => void;
}

export default function EmployeeDetails({
  employee,
  onBack,
  onProfileUpdated,
}: EmployeeDetailsProps) {
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [reports, setReports] = useState<Array<{
    id: string;
    title: string;
    status: string;
    date: string;
    time: string;
  }>>([]);
  const [reportsError, setReportsError] = useState("");
  const [reportsLoading, setReportsLoading] = useState(true);

  const joined = fromInputDate(employee.joinedAt);
  const info = [
    ["نام و تخلص", employee.name],
    ["ایمیل", employee.email],
    ["شماره تلفن", employee.phone || "ثبت نشده"],
    ["آدرس", employee.address || "ثبت نشده"],
    ["تاریخ ثبت سیستم", joined ? formatJalali(joined, "/") : employee.joinedAt],
    ["آخرین زمان ورود", employee.lastLoginAt ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeStyle: "short" }).format(new Date(employee.lastLoginAt)) : "هنوز وارد نشده"],
  ];

  useEffect(() => {
    setReportsLoading(true);
    setReportsError("");
    setReports([]);
    api<Record<string, unknown>[]>(`/report/teacher/${employee.id}?limit=100`)
      .then((rows) => setReports(rows
        .filter((row) => row.status !== "draft")
        .map((row) => {
          const created = new Date(String(row.report_date ?? ""));
          return {
            id: String(row.id),
            title: String(row.title ?? ""),
            status: row.status === "accept" ? "تأیید شده" : row.status === "comment" ? "بازخورد داده شد" : "در انتظار بررسی",
            date: new Intl.DateTimeFormat("fa-IR-u-ca-persian").format(created),
            time: new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(created),
          };
        })))
      .catch((cause) => setReportsError(cause instanceof Error ? cause.message : "بارگذاری گزارش‌ها ناموفق بود."))
      .finally(() => setReportsLoading(false));
  }, [employee.id]);

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
            {reportsError ? (
              <p role="alert" className="py-8 text-center text-xs text-red-600">{reportsError}</p>
            ) : reportsLoading ? (
              <p className="py-8 text-center text-xs text-slate-500">در حال بارگذاری…</p>
            ) : reports.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">گزارشی برای این کارمند ثبت نشده است.</p>
            ) : reports.map((report) => {
              const isPending = report.status === "در انتظار بررسی";
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
                      isPending
                        ? "bg-amber-50 text-amber-700"
                        : report.status === "تأیید شده" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                    }`}>
                    {report.status}
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
              unoptimized
              className="rounded-lg border border-blue-300 object-cover"
            />
            <button
              type="button"
              onClick={() => setProfileEditorOpen(true)}
              aria-label="تغییر تصویر پروفایل"
              title="تغییر تصویر پروفایل"
              className="absolute -bottom-2 -right-2 grid size-8 place-items-center rounded-full bg-brand text-white shadow-sm hover:bg-brand-deep">
              <Pencil size={15} />
            </button>
          </div>
          <div className="mt-auto overflow-hidden rounded-lg border border-blue-500">
            <div className="flex items-center justify-between bg-blue-50 px-3 py-2.5">
              <h2 className="font-semibold text-slate-800">مشخصات کارمند</h2>
              <button type="button" onClick={() => setProfileEditorOpen(true)} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
                <Pencil size={14} /> ویرایش پروفایل
              </button>
            </div>
            <dl>
              {info.map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 text-xs sm:text-sm ${index < info.length - 1 ? "border-b border-dashed border-blue-400" : ""}`}>
                  <dt className="text-blue-700">{label}</dt>
                  <dd
                    className="min-w-0 truncate text-left font-medium text-slate-800"
                    dir={label === "ایمیل" || label === "شماره تلفن" ? "ltr" : undefined}>
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
      {profileEditorOpen && (
        <ProfileEditor
          employeeId={String(employee.id)}
          onClose={() => setProfileEditorOpen(false)}
          onSaved={onProfileUpdated}
        />
      )}
    </div>
  );
}
