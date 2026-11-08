import { Check, Mail, MailOpen, MessageCircle } from "lucide-react";

interface Props {
  approved: number;
  total: number;
  pending: number;
  feedback: number;
}

const fmt = (n: number) => n.toLocaleString("en-US");

export default function StatCards({
  approved,
  total,
  pending,
  feedback,
}: Props) {
  const items = [
    {
      label: "تأیید شده ها",
      value: approved,
      Icon: Check,
      tone: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "تمام دریافتی ها",
      value: total,
      Icon: MailOpen,
      tone: "bg-blue-200 text-blue-600",
    },
    {
      label: "در انتظار",
      value: pending,
      Icon: Mail,
      tone: "bg-violet-100 text-violet-600",
    },
    {
      label: "بازخورد شده ها",
      value: feedback,
      Icon: MessageCircle,
      tone: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <section
      aria-label="خلاصه آمار"
      className="grid grid-cols-2 gap-(--gap) md:grid-cols-4 mt-4">
      {items.map(({ label, value, Icon, tone }) => (
        <div
          key={label}
          className="flex flex-col gap-2.5 rounded-2xl bg-white p-[clamp(14px,1.3vw,22px)]">
          <div className="flex items-center gap-2.5">
            <span
              className={`grid size-9 flex-none place-items-center rounded-full ${tone}`}>
              <Icon size={18} strokeWidth={2} aria-hidden />
            </span>
            <span className="text-[0.88em] text-slate-500">{label}</span>
          </div>
          <strong dir="ltr" className="text-start text-[1.9em] font-bold">
            {fmt(value)}
          </strong>
        </div>
      ))}
    </section>
  );
}
