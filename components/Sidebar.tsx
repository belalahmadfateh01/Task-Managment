import Link from "next/link";
import Image from "next/image";
import { House, Inbox, PenLine, UserPlus, Calendar } from "lucide-react";

const NAV = [
  { label: "صفحه اصلی", icon: House, active: true, href: "/dashboard" },
  { label: "صندوق ورودی", icon: Inbox, active: false, href: "/inbox" },
  { label: "کارمندان", icon: UserPlus, active: false, href: "/employees" },
  { label: "پیش نویس", icon: PenLine, active: false, href: "/drafts" },
  { label: "تسک ها", icon: Calendar, active: false, href: "/tasks" },
];

export default function Sidebar() {
  return (
    <aside className=" sticky top-0 flex h-screen flex-col gap-10 bg-brand px-3 py-5 text-white xl:gap-14 xl:px-5">
      <Link
        href="/dashboard"
        className="flex items-center justify-center gap-3 rounded-xl border border-white/85 px-3 py-3.5 text-xl font-semibold"
      >
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
        {NAV.map(({ label, icon: Icon, active, href }) => (
          <Link
            key={label}
            href={href}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-[10px] px-3.5 py-3 font-medium transition-colors max-xl:justify-center max-xl:px-0 ${
              active ? "bg-white text-brand-deep" : "hover:bg-white/15"
            }`}
          >
            <Icon size={22} strokeWidth={1.6} aria-hidden />
            <span className="max-xl:hidden">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
