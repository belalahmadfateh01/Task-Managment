"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "نمای کلی",
    description: "خلاصه وضعیت عملکرد و گزارش‌های اخیر",
  },
  "/inbox": {
    title: "صندوق ورودی",
    description: "پیام‌ها و درخواست‌های جدید",
  },
  "/employees": {
    title: "کارمندان",
    description: "مدیریت اعضای تیم و وضعیت فعالیت‌ها",
  },
  "/drafts": {
    title: "پیش‌نویس‌ها",
    description: "اسناد و پیشنهادهای در حال آماده‌سازی",
  },
  "/tasks": {
    title: "تسک‌ها",
    description: "بررسی وظایف و زمان‌بندی انجام کارها",
  },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  const meta = PAGE_META[pathname] ?? {
    title: "صفحه",
    description: "نمایش محتوای صفحه",
  };

  return (
    <div
      className="h-screen overflow-hidden bg-surface"
      style={{ ["--gap" as string]: "clamp(14px,1.5vw,24px)" }}>
      <div className="grid h-screen grid-cols-[76px_minmax(0,1fr)] xl:grid-cols-[clamp(210px,15vw,270px)_minmax(0,1fr)]">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-col overflow-hidden">
          <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm">
            <Header title={meta.title} description={meta.description} />
          </div>

          <main className="flex-1 overflow-y-auto px-(--gap) pb-(--gap) [--gap:clamp(14px,1.5vw,24px)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
