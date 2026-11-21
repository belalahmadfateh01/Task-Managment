"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, CheckSquare, House, PenLine, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { clearSession, readSession } from "@/lib/clientStore";
import { api, apiAssetUrl } from "@/lib/api";
import type { Employee } from "@/lib/types";
import { formatClockTime, formatJalali } from "@/lib/jalali";
import NotificationBell from "@/components/NotificationBell";
import ProfileEditor from "@/components/ProfileEditor";

const navigation = [
  { label: "صفحه اصلی", href: "/employee/dashboard", icon: House },
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
    if (session.role !== "teacher") {
      router.replace("/dashboard");
      return;
    }
    const loadEmployee = () =>
      api<Record<string, unknown>>(`/employee/${session.employeeId}`)
        .then((item) =>
          setEmployee({
            id: session.employeeId,
            name: [item.f_name, item.l_name].filter(Boolean).join(" "),
            email: String(item.email ?? ""),
            avatar: apiAssetUrl(
              typeof item.image === "string" ? item.image : null,
            ),
            joinedAt: String(item.created_at ?? "").slice(0, 10),
            phone: typeof item.phone === "string" ? item.phone : undefined,
          }),
        )
        .catch(() => {
          clearSession();
          router.replace("/login");
        })
        .finally(() => setAccessChecked(true));
    void loadEmployee();
    const onProfileUpdated = () => {
      void loadEmployee();
    };
    window.addEventListener("profile-updated", onProfileUpdated);
    return () =>
      window.removeEventListener("profile-updated", onProfileUpdated);
  }, [router]);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!accessChecked || !employee) return null;

  const pageTitle = pathname.startsWith("/employee/reports/new")
    ? "گزارش جدید"
    : pathname.startsWith("/employee/reports/")
      ? "جزئیات گزارش"
      : pathname.startsWith("/employee/tasks")
        ? "فعالیت‌ها"
        : pathname.startsWith("/employee/drafts")
          ? "پیش‌نویس‌ها"
          : "صندوق ارسالی";
  const pageDescription = pathname.startsWith("/employee/tasks")
    ? "کارهای تعیین‌شده برای شما"
    : `${employee.name}، فضای کاری شما`;

  return (
    <div dir="rtl" className="h-screen overflow-hidden bg-surface">
      <div className="grid h-screen grid-cols-[clamp(210px,15vw,270px)_minmax(0,1fr)]">
        <div className="sticky top-0 h-screen">
          <aside className="sticky top-0 flex h-screen flex-col gap-8 bg-brand px-5 py-5 text-white">
            <div className="flex flex-col gap-4">
              <Link
                href="/employee/dashboard"
                className="flex items-center justify-center gap-3 rounded-xl border border-white/85 px-3 py-3.5 text-xl font-semibold">
                <Image
                  src="/imges/LOGO.svg"
                  alt=""
                  width={32}
                  height={36}
                  aria-hidden
                />
                <span>گزارش یار</span>
              </Link>
              <Link
                href="/employee/reports/new"
                title="گزارش جدید"
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-2 text-sm font-semibold text-brand-deep hover:bg-blue-50">
                <Plus size={17} />
                <span>گزارش جدید</span>
              </Link>
            </div>
            <nav aria-label="منوی کارمند" className="flex flex-col gap-1.5">
              {navigation.map(({ label, href, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    title={label}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-3 px-3.5 py-3 font-medium transition-colors ${
                      active
                        ? "w-[calc(100%+20px)] rounded-r-xl bg-white text-brand-deep shadow-sm"
                        : "w-[calc(100%+20px)] rounded-r-xl hover:bg-white/15"
                    }`}>
                    <Icon size={22} strokeWidth={1.6} aria-hidden />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>

        <div className="flex min-w-0 flex-col overflow-hidden">
          <header className="z-10 flex min-h-[68px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
            <div>
              <h1 className="font-bold text-slate-900">{pageTitle}</h1>
              <p className="mt-0.5 text-xs text-slate-500">{pageDescription}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 sm:flex">
                <CalendarDays size={15} />
                <span>{now ? formatJalali(now) : "—"}</span>
                <span className="text-blue-600">
                  {now ? formatClockTime(now) : ""}
                </span>
              </div>
              <NotificationBell />
              <ProfileEditor />
            </div>
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
