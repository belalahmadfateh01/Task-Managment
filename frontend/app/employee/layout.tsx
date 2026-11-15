"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FilePlus2,
  House,
  LogOut,
  PenLine,
} from "lucide-react";
import { useEffect, useState } from "react";
import { clearSession, readEmployees, readSession } from "@/lib/clientStore";
import type { Employee } from "@/lib/types";
import { formatJalali, formatTime } from "@/lib/jalali";

const navigation = [
  { label: "صفحه اصلی", href: "/employee/dashboard", icon: House },
  { label: "گزارش‌های من", href: "/employee/inbox", icon: ClipboardList },
  { label: "فعالیت‌ها", href: "/employee/tasks", icon: CheckSquare },
  { label: "پیش‌نویس‌ها", href: "/employee/drafts", icon: PenLine },
];

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== "employee") {
      router.replace("/dashboard");
      return;
    }
    const currentEmployee = readEmployees().find(
      (item) => item.id === session.employeeId,
    );
    if (!currentEmployee) {
      router.replace("/login");
      return;
    }
    setEmployee(currentEmployee);
    setAccessChecked(true);
  }, [router]);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!accessChecked || !employee) return null;

  const pageTitle = pathname.startsWith("/employee/reports/new")
    ? "گزارش جدید"
    : pathname.startsWith("/employee/reports/")
      ? "گزارش‌های من"
      : pathname.startsWith("/employee/inbox")
        ? "گزارش‌های من"
        : pathname.startsWith("/employee/tasks")
          ? "فعالیت‌ها"
          : pathname.startsWith("/employee/drafts")
            ? "پیش‌نویس‌ها"
            : "نمای کلی";

  return (
    <div
      dir="rtl"
      className="flex h-screen flex-col overflow-hidden bg-[#f4f4f6]">
      <header className="z-10 flex min-h-[68px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <div>
          <h1 className="font-bold text-slate-900">{pageTitle}</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {employee.name}، فضای کاری شما
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 sm:flex">
            <CalendarDays size={15} />
            <span>{now ? formatJalali(now) : "—"}</span>
            <span className="text-blue-600">{now ? formatTime(now) : ""}</span>
          </div>
          <button
            type="button"
            aria-label="اعلان‌ها"
            className="relative grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
            <Bell size={17} />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />
          </button>
          <div className="grid size-9 place-items-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700">
            {employee.avatar.startsWith("/") ? (
              <Image
                src={employee.avatar}
                alt=""
                width={36}
                height={36}
                className="size-full object-cover"
              />
            ) : (
              employee.name.slice(0, 1)
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              clearSession();
              router.replace("/login");
            }}
            aria-label="خروج از حساب"
            title="خروج از حساب"
            className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col-reverse md:flex-row">
        <aside className="z-20 flex shrink-0 flex-row items-center justify-around bg-[#2863f5] px-2 py-2 text-white md:w-[152px] md:flex-col md:items-stretch md:justify-start md:gap-5 md:px-3 md:py-4">
          <Link
            href="/employee/reports/new"
            className="hidden h-11 items-center justify-center gap-2 rounded-lg bg-white px-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 md:flex">
            <FilePlus2 size={17} /> گزارش جدید
          </Link>
          <nav
            aria-label="منوی کارمند"
            className="flex w-full justify-around md:flex-col md:gap-1">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] transition-colors md:flex-row md:justify-start md:gap-3 md:px-3 md:text-sm ${
                    active
                      ? "bg-white text-blue-700"
                      : "text-white hover:bg-white/15"
                  }`}>
                  <Icon size={19} strokeWidth={1.7} />
                  <span className="md:whitespace-nowrap">{label}</span>
                </Link>
              );
            })}
          </nav>
          <Link
            href="/employee/reports/new"
            aria-label="گزارش جدید"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-blue-700 md:hidden">
            <FilePlus2 size={19} />
          </Link>
        </aside>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
