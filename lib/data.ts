import type { Report, Status } from "./types";

const TITLES = [
  "درخواست بازبینی مجدد",
  "فهرست شکایات متفرقه",
  "بررسی گزارشات مالیاتی",
  "فهرست ترخیص شدگان سال مالی",
  "گزارش عملکرد فصلی",
  "صورت‌جلسه کمیته فنی",
  "درخواست تمدید قرارداد",
  "گزارش موجودی انبار",
];
const SENDERS = ["احمد رضایی", "محمد صمدی", "شکیب سهرابی", "حسین محمودی", "مریم کاظمی", "نرگس حیدری"];
const STATUSES: Status[] = ["received", "feedback", "approved", "pending"];

/**
 * Deterministic demo data (no Math.random → no hydration mismatches).
 * Replace this with a fetch to your API.
 */
export function createMockReports(now: Date): Report[] {
  const minutesToday = now.getHours() * 60 + now.getMinutes();
  const out: Report[] = [];
  for (let i = 0; i < 140; i++) {
    const r = ((i * 9301 + 49297) % 233280) / 233280;
    const daysAgo = i < 8 ? 0 : Math.floor(r * r * 400);
    const date = new Date(now);
    if (daysAgo === 0) {
      date.setTime(now.getTime() - Math.min(i * 53 + 5, minutesToday) * 60_000);
    } else {
      date.setDate(date.getDate() - daysAgo);
      date.setHours((i * 7) % 24, (i * 13) % 60, 0, 0);
    }
    out.push({
      id: `r-${i}`,
      title: TITLES[i % TITLES.length],
      sender: SENDERS[(i * 5) % SENDERS.length],
      status: STATUSES[(i * 3 + Math.floor(i / 4)) % STATUSES.length],
      createdAt: date.toISOString(),
      archived: false,
    });
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
