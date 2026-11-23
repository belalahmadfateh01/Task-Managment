"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { readSession } from "@/lib/clientStore";

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
  "/tasks": {
    title: "وظایف",
    description: "بررسی وظایف و زمان‌بندی انجام کارها",
  },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/" || pathname === "/login") {
      setAccessChecked(true);
      return;
    }
    const session = readSession();
    if (!session) router.replace("/login");
    else if (session.role === "teacher") {
      router.replace(pathname === "/drafts" ? "/employee/drafts" : "/employee/dashboard");
    } else if (pathname === "/drafts") router.replace("/dashboard");
    else setAccessChecked(true);
  }, [pathname, router]);

  if (pathname === "/" || pathname === "/login") {
    return <>{children}</>;
  }

  if (!accessChecked) return null;

  const meta = PAGE_META[pathname] ?? {
    title: "صفحه",
    description: "نمایش محتوای صفحه",
  };
  const isInboxReportPage = pathname.startsWith("/inbox/");
  const isSpacedAdminPage = ["/employees", "/tasks"].includes(pathname);

  return (
    <div
      className="h-screen overflow-hidden bg-surface"
      style={{ ["--gap" as string]: "clamp(14px,1.5vw,24px)" }}>
      <div className="grid h-screen grid-cols-[230px_minmax(0,1fr)]">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-col overflow-hidden">
          {!isInboxReportPage && (
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm">
              <Header title={meta.title} description={meta.description} />
            </div>
          )}

          <main
            className={`pretty-scrollbar flex-1 px-(--gap) pb-(--gap) [--gap:clamp(14px,1.5vw,24px)] ${
              isSpacedAdminPage ? "pt-(--gap)" : ""
            } ${
              isInboxReportPage ? "min-h-0 overflow-hidden" : "overflow-y-auto"
            }`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
