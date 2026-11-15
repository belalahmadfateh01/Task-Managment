"use client";

import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  report_id?: string | null;
  task_id?: string | null;
  created_at: string;
  read_at: string | null;
};

type NotificationResponse = {
  items: Notification[];
  unreadCount: number;
  totalCount: number;
};

type NotificationTone = {
  card: string;
  title: string;
  date: string;
  dot: string;
  action: string;
};

const TONES: Record<string, NotificationTone> = {
  report_submitted: {
    card: "border-sky-400",
    title: "text-sky-700",
    date: "text-slate-500",
    dot: "bg-blue-600",
    action: "bg-blue-600 hover:bg-blue-700",
  },
  report_feedback: {
    card: "border-orange-400",
    title: "text-amber-800",
    date: "text-amber-700",
    dot: "bg-orange-500",
    action: "bg-orange-500 hover:bg-orange-600",
  },
  report_reviewed: {
    card: "border-green-400",
    title: "text-blue-800",
    date: "text-slate-500",
    dot: "bg-green-500",
    action: "bg-sky-500 hover:bg-sky-600",
  },
  task_assigned: {
    card: "border-sky-400",
    title: "text-sky-700",
    date: "text-sky-700",
    dot: "bg-sky-500",
    action: "bg-sky-500 hover:bg-sky-600",
  },
  task_status: {
    card: "border-slate-300",
    title: "text-slate-700",
    date: "text-slate-400",
    dot: "bg-slate-400",
    action: "bg-slate-500 hover:bg-slate-600",
  },
};

const FALLBACK_TONE = TONES.report_submitted;

function relativeTime(value: string) {
  const date = new Date(value);
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  const faNumber = (number: number) => number.toLocaleString("fa-IR");

  if (minutes < 1) return "همین حالا";
  if (minutes < 60) return `${faNumber(minutes)} دقیقه پیش`;

  const time = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  const days = Math.floor(minutes / (60 * 24));
  if (days === 0) return `امروز، ساعت ${time}`;
  if (days === 1) return `دیروز، ساعت ${time}`;
  return `${faNumber(days)} روز پیش`;
}

function actionLabel(item: Notification) {
  if (item.report_id || item.type.startsWith("report_")) return "مشاهده و بررسی گزارش";
  if (item.task_id || item.type.startsWith("task_")) return "مشاهده فعالیت";
  return "مشاهده جزئیات";
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showUnread, setShowUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api<NotificationResponse>("/notification?limit=100&includeRead=true");
      setItems(result.items);
      setUnreadCount(result.unreadCount);
      setTotalCount(result.totalCount);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "بارگذاری اعلان‌ها ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const visibleItems = useMemo(
    () => showUnread ? items.filter((item) => !item.read_at) : items,
    [items, showUnread],
  );
  const readCount = Math.max(0, totalCount - unreadCount);

  const openNotification = async (item: Notification) => {
    if (!item.read_at) {
      try {
        const readAt = new Date().toISOString();
        await api(`/notification/${item.id}/read`, { method: "PATCH" });
        setItems((current) => current.map((row) => row.id === item.id ? { ...row, read_at: readAt } : row));
        setUnreadCount((count) => Math.max(0, count - 1));
        setError("");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "ثبت خوانده‌شدن اعلان ناموفق بود.");
        return;
      }
    }
    setOpen(false);
    if (item.href) router.push(item.href);
  };

  const markAllRead = async () => {
    setWorking(true);
    try {
      await api("/notification/read-all", { method: "PATCH" });
      const readAt = new Date().toISOString();
      setItems((current) => current.map((item) => item.read_at ? item : { ...item, read_at: readAt }));
      setUnreadCount(0);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ثبت خوانده‌شدن اعلان‌ها ناموفق بود.");
    } finally {
      setWorking(false);
    }
  };

  const clearRead = async () => {
    setWorking(true);
    try {
      const result = await api<{ deleted: number }>("/notification/read", { method: "DELETE" });
      setItems((current) => current.filter((item) => !item.read_at));
      setTotalCount((count) => Math.max(unreadCount, count - result.deleted));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "پاک‌سازی اعلان‌ها ناموفق بود.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          aria-label={unreadCount ? `${unreadCount} اعلان خوانده‌نشده` : "اعلان‌ها"}
          aria-expanded={open}
          onClick={() => { setOpen(true); void refresh(); }}
          className="relative grid size-11 place-items-center rounded-xl border border-line text-slate-700 hover:bg-surface">
          <Bell size={20} strokeWidth={1.6} />
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-5 text-white">{unreadCount > 99 ? "۹۹+" : unreadCount.toLocaleString("fa-IR")}</span>}
        </button>
      </div>
      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 p-3 sm:p-5"
          onClick={() => setOpen(false)}>
          <section
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-center-title"
            onClick={(event) => event.stopPropagation()}
            className="flex h-[min(94dvh,840px)] w-[min(92vw,520px)] flex-col overflow-hidden rounded-[20px] bg-white text-right shadow-2xl">
            <header className="shrink-0 px-4 pb-3 pt-5 sm:px-6">
              <div className="relative flex min-h-12 items-center justify-center">
                <button
                  type="button"
                  aria-label="بستن مرکز اعلان‌ها"
                  onClick={() => setOpen(false)}
                  className="absolute left-0 grid size-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                  <X size={20} />
                </button>
                <div className="flex items-center gap-2.5">
                  <Bell className="shrink-0 text-blue-600" size={21} strokeWidth={1.7} />
                  <div>
                    <h2 id="notification-center-title" className="text-[15px] font-bold text-blue-700">مرکز اعلان‌ها</h2>
                    <p className="mt-0.5 text-[10px] text-slate-500">بازخوردها و فعالیت‌های دریافتی</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  disabled={unreadCount === 0 || working}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-default disabled:text-slate-300">
                  <CheckCheck size={14} />
                  خواندن همه ({unreadCount.toLocaleString("fa-IR")})
                </button>
                <span className="text-[10px] text-slate-400">اعلان‌های تازه و خوانده‌شده</span>
              </div>
            </header>

            <div className="mx-4 flex shrink-0 border-b border-slate-100 sm:mx-6" role="tablist" aria-label="فیلتر اعلان‌ها">
              <button
                type="button"
                role="tab"
                aria-selected={!showUnread}
                onClick={() => setShowUnread(false)}
                className={`flex-1 border-b-2 px-2 py-3 text-xs font-semibold transition ${!showUnread ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                همه اعلان‌ها ({totalCount.toLocaleString("fa-IR")})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={showUnread}
                onClick={() => setShowUnread(true)}
                className={`flex-1 border-b-2 px-2 py-3 text-xs font-semibold transition ${showUnread ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                خوانده‌نشده ({unreadCount.toLocaleString("fa-IR")})
              </button>
            </div>

            {error && <p role="alert" className="mx-5 mt-3 shrink-0 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
              {loading && items.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">در حال بارگذاری اعلان‌ها…</p>
              ) : visibleItems.length ? (
                <ul className="space-y-3">
                  {visibleItems.map((item) => {
                    const tone = TONES[item.type] ?? FALLBACK_TONE;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => void openNotification(item)}
                          className={`w-full rounded-[15px] border bg-white px-3 py-3 text-right transition hover:shadow-sm sm:px-3.5 ${tone.card}`}>
                          <span className="flex items-start justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className={`mt-0.5 size-2 shrink-0 rounded-full ${tone.dot} ${item.read_at ? "opacity-70" : ""}`} />
                              <span className={`block min-w-0 text-[12px] font-bold leading-5 ${tone.title}`}>{item.title}</span>
                            </span>
                            <time className={`shrink-0 pt-0.5 text-[9px] ${tone.date}`} dateTime={item.created_at}>{relativeTime(item.created_at)}</time>
                          </span>
                          <span className="mt-1.5 block pr-4 text-[11px] leading-[1.8] text-slate-500">{item.body}</span>
                          {item.href && (
                            <span className={`mt-2 mr-4 inline-flex rounded-lg px-3 py-1.5 text-[10px] font-semibold text-white transition ${tone.action}`}>
                              {actionLabel(item)}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="py-12 text-center text-sm text-slate-500">
                  {showUnread ? "اعلان خوانده‌نشده‌ای ندارید." : "اعلانی برای نمایش وجود ندارد."}
                </p>
              )}
            </div>

            <footer className="shrink-0 border-t border-slate-100 px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => void clearRead()}
                disabled={readCount === 0 || working}
                className="mx-auto flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-default disabled:text-slate-300">
                <Trash2 size={14} />
                پاک‌سازی لیست اعلان‌های خوانده‌شده
              </button>
            </footer>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
