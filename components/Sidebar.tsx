"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { House, Inbox, PenLine, UserPlus, Calendar } from "lucide-react";

const NAV = [
  { label: "صفحه اصلی", icon: House, href: "/dashboard" },
  { label: "صندوق ورودی", icon: Inbox, href: "/inbox" },
  { label: "کارمندان", icon: UserPlus, href: "/employees" },
  { label: "پیش نویس", icon: PenLine, href: "/drafts" },
  { label: "فعالیت ها", icon: Calendar, href: "/tasks" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-10 bg-brand px-3 py-5 text-white xl:gap-14 xl:px-5">
      <Link
        href="/dashboard"
        className="flex items-center justify-center gap-3 rounded-xl border border-white/85 px-3 py-3.5 text-xl font-semibold">
        <Image
          src="/imges/LOGO.svg"
          alt=""
          width={32}
          height={36}
          aria-hidden
        />
        <span className="max-xl:hidden">گزارش یار</span>
      </Link>
      <nav aria-label="منوی اصلی" className="flex flex-col gap-1.5">
        {NAV.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={label}
              href={href}
              title={label}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex items-center gap-3  px-3.5 py-3 font-medium transition-colors max-xl:justify-center max-xl:px-0 ${
                isActive
                  ? "w-[calc(100%+20px)] rounded-r-xl bg-white text-brand-deep shadow-sm"
                  : "hover:bg-white/15 w-[calc(100%+20px)] rounded-r-xl"
              }`}>
              <Icon size={22} strokeWidth={1.6} aria-hidden />
              <span className="max-xl:hidden">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
