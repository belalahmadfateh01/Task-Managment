import type { PeriodKey, Status } from "./types";

export const STATUS_LABEL: Record<Status, string> = {
  received: "دریافت شده",
  feedback: "بازخورد شده",
  approved: "تائید شده",
  pending: "در انتظار تائید",
};

/** Order used by the donut chart and its legend */
export const STATUS_ORDER: Status[] = ["received", "feedback", "approved", "pending"];

export const STATUS_COLOR: Record<Status, string> = {
  received: "#2563eb",
  feedback: "#f59e0b",
  approved: "#10b981",
  pending: "#8b5cf6",
};

export const PERIOD_LABEL: Record<PeriodKey, string> = {
  daily: "گزارش روزانه",
  weekly: "گزارش هفته‌وار",
  monthly: "گزارش ماهوار",
  yearly: "گزارش سالانه",
  custom: "محدوده دلخواه",
};

export const PERIOD_KEYS: PeriodKey[] = ["daily", "weekly", "monthly", "yearly", "custom"];

/** Tailwind classes for status badges */
export const STATUS_BADGE: Record<Status, string> = {
  received: "bg-blue-50 text-blue-700",
  feedback: "bg-amber-100 text-amber-600",
  approved: "bg-emerald-100 text-emerald-600",
  pending: "bg-violet-100 text-violet-700",
};
