"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, Pencil, UserRound } from "lucide-react";
import { apiAllPages } from "@/lib/api";
import { formatJalali, fromInputDate } from "@/lib/jalali";
import type { Employee } from "@/lib/types";
import ProfileEditor, {
  type EditableEmployeeProfile,
} from "@/components/ProfileEditor";

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
  const [reports, setReports] = useState<
    Array<{
      id: string;
      title: string;
      status: string;
      date: string;
      time: string;
    }>
  >([]);
  const [reportsError, setReportsError] = useState("");
  const [reportsLoading, setReportsLoading] = useState(true);

  const joined = fromInputDate(employee.joinedAt);
  const info = [
    ["نام و تخلص", employee.name],
    ["نام کاربری", employee.username || employee.email.split("@")[0]],
    ["ایمیل", employee.email],

    ["شماره تلفن", employee.phone || "ثبت نشده"],
    ["آدرس", employee.address || "ثبت نشده"],
    ["تاریخ ثبت سیستم", joined ? formatJalali(joined, "/") : employee.joinedAt],
    // [
    //   "آخرین زمان ورود",
    //   employee.lastLoginAt
    //     ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    //         dateStyle: "medium",
    //         timeStyle: "short",
    //       }).format(new Date(employee.lastLoginAt))
    //     : "هنوز وارد نشده",
    // ],
  ];

  useEffect(() => {
    setReportsLoading(true);
    setReportsError("");
    setReports([]);
    apiAllPages<Record<string, unknown>>(`/report/teacher/${employee.id}`)
      .then((rows) =>
        setReports(
          rows
            .filter((row) => row.status !== "draft")
            .map((row) => {
              const created = new Date(String(row.report_date ?? ""));
              return {
                id: String(row.id),
                title: String(row.title ?? ""),
                status:
                  row.status === "accept"
                    ? "تأیید شده"
                    : row.status === "comment"
                      ? "بازخورد شده"
                      : "دریافت شده",
                date: new Intl.DateTimeFormat("fa-IR-u-ca-persian").format(
                  created,
                ),
                time: new Intl.DateTimeFormat("fa-IR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(created),
              };
            }),
        ),
      )
      .catch((cause) =>
        setReportsError(
          cause instanceof Error
            ? cause.message
            : "بارگذاری گزارش‌ها ناموفق بود.",
        ),
      )
      .finally(() => setReportsLoading(false));
  }, [employee.id]);

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600">
          <ArrowRight size={16} /> بازگشت
        </button>
      </div>

      <div
        dir="ltr"
        className="grid min-h-[680px] gap-4 lg:h-[min(920px,calc(100vh-190px))] lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,1fr)]">
        <section
          dir="rtl"
          className="flex min-h-[460px] flex-col rounded-2xl border-2 border-blue-500 bg-white p-5 sm:p-7">
          <div className="border-b-2 border-dotted border-blue-300 pb-7 text-right">
            <div className="me-auto max-w-xs">
              <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
                گزارش‌های اخیر
              </h2>
              <p className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">
                آخرین وضعیت گزارش‌های دریافت‌شده و بررسی‌شده
              </p>
            </div>
          </div>
          <div className="mt-3 hidden grid-cols-[minmax(0,1fr)_minmax(105px,auto)_minmax(180px,auto)_24px] items-center gap-3 px-1 text-xs text-slate-500 sm:grid">
            <span>عنوان گزارش</span>
            <span className="text-center">وضعیت</span>
            <span dir="ltr" className="text-left">
              تاریخ
            </span>
            <span />
          </div>
          <div className="pretty-scrollbar mt-1 min-h-0 divide-y divide-slate-100 overflow-y-auto">
            {reportsError ? (
              <p role="alert" className="py-8 text-center text-xs text-red-600">
                {reportsError}
              </p>
            ) : reportsLoading ? (
              <p className="py-8 text-center text-xs text-slate-500">
                در حال بارگذاری…
              </p>
            ) : reports.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                گزارشی برای این کارمند ثبت نشده است.
              </p>
            ) : (
              reports.map((report) => {
                const isFeedback = report.status === "بازخورد شده";
                const isPending = report.status === "دریافت شده";
                return (
                  <Link
                    key={report.id}
                    href={`/inbox/${report.id}`}
                    className="grid min-h-15.5 grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-x-2 gap-y-1 px-1 py-2 text-[10px] hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_minmax(105px,auto)_minmax(180px,auto)_24px] sm:gap-3 sm:py-0 sm:text-xs">
                    <span className="min-w-0 truncate text-slate-700">
                      {report.title}
                    </span>
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-medium sm:px-3 sm:text-[10px] text-center ${
                        isFeedback
                          ? "bg-amber-100 text-amber-700"
                          : isPending
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}>
                      {report.status}
                    </span>
                    <span
                      className="col-start-1 row-start-2 text-left text-[9px] text-slate-500 sm:col-start-3 sm:row-start-1 sm:whitespace-nowrap sm:text-xs"
                      dir="ltr">
                      {report.date} - {report.time}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
          <div className="mt-4 border-t-2 border-dotted border-blue-300" />
        </section>

        <section
          dir="rtl"
          className="pretty-scrollbar flex min-h-[600px] flex-col overflow-y-auto rounded-2xl border-2 border-blue-400 bg-white p-5 sm:p-7">
          <div className="relative mx-auto mb-4 grid  shrink-0 place-items-center sm:size-25 xl:size-35">
            <Image
              src={employee.avatar}
              alt={`تصویر ${employee.name}`}
              fill
              sizes="(max-width: 640px) 14rem, (max-width: 1024px) 14rem, 16rem"
              unoptimized
              className="rounded-full border border-blue-400 object-cover"
            />
            {/* <button
              type="button"
              onClick={() => setProfileEditorOpen(true)}
              aria-label="تغییر تصویر پروفایل"
              title="تغییر تصویر پروفایل"
              className="absolute -bottom-3 -right-3 grid size-12 place-items-center rounded-full border-2 border-white bg-brand text-white shadow-sm hover:bg-brand-deep">
              <Pencil size={15} />
            </button> */}
          </div>
          <div className="mt-auto overflow-hidden rounded-xl border-2 border-blue-400">
            <div className="flex items-center justify-between border-1 border-blue-400 bg-blue-50 px-3 py-2.5 sm:px-4">
              <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                مشخصات کارمند
              </h2>
              <button
                type="button"
                onClick={() => setProfileEditorOpen(true)}
                aria-label="ویرایش پروفایل کارمند"
                title="ویرایش پروفایل"
                className="relative grid size-10 place-items-center rounded-full bg-brand text-white hover:bg-brand-deep">
                <UserRound size={20} />

                <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-white bg-white text-brand shadow-sm">
                  <Pencil size={11} />
                </span>
              </button>
            </div>
            <dl>
              {info.map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-sm sm:min-h-[68px] sm:px-4 sm:text-base ${index < info.length - 1 ? "border-b-2 border-dashed border-slate-400" : ""}`}>
                  <dt className="text-slate-800">{label}</dt>
                  <dd
                    className="min-w-0 truncate text-left font-semibold text-slate-800"
                    dir={
                      label === "ایمیل" ||
                      label === "شماره تلفن" ||
                      label === "نام کاربری"
                        ? "ltr"
                        : undefined
                    }>
                    {value}
                  </dd>
                </div>
              ))}
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
