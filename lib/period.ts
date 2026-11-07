import type { CustomRange, DateRange, PeriodKey, Report } from "./types";
import {
  endOfDay,
  fromInputDate,
  startOfDay,
  startOfJalaliMonth,
  startOfJalaliWeek,
  startOfJalaliYear,
} from "./jalali";

export function getRange(period: PeriodKey, now: Date, custom: CustomRange): DateRange {
  const to = endOfDay(now);
  switch (period) {
    case "daily":
      return { from: startOfDay(now), to };
    case "weekly":
      return { from: startOfJalaliWeek(now), to };
    case "monthly":
      return { from: startOfJalaliMonth(now), to };
    case "yearly":
      return { from: startOfJalaliYear(now), to };
    case "custom": {
      const a = fromInputDate(custom.from) ?? startOfDay(now);
      const b = fromInputDate(custom.to) ?? startOfDay(now);
      const [from, last] = a <= b ? [a, b] : [b, a]; // tolerate reversed input
      return { from: startOfDay(from), to: endOfDay(last) };
    }
  }
}

export function inRange(report: Report, range: DateRange): boolean {
  const t = new Date(report.createdAt).getTime();
  return t >= range.from.getTime() && t <= range.to.getTime();
}
