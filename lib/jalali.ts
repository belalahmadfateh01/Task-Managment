/**
 * Jalali (Solar Hijri) helpers built on Intl — no extra dependency.
 * Digits are Latin to match the design ("1405 / 07 / 12").
 */
const parts = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export function jalaliParts(date: Date): { y: number; m: number; d: number } {
  const p = parts.formatToParts(date);
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatJalali(date: Date, sep = " / "): string {
  const { y, m, d } = jalaliParts(date);
  return `${y}${sep}${pad(m)}${sep}${pad(d)}`;
}

export function formatTime(date: Date, spaced = false): string {
  const t = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return spaced ? t.replace(":", " : ") : t;
}

export function startOfDay(date: Date): Date {
  const x = new Date(date);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(date: Date): Date {
  const x = new Date(date);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** First day of the current Jalali month */
export function startOfJalaliMonth(date: Date): Date {
  const x = startOfDay(date);
  for (let i = 0; i < 31 && jalaliParts(x).d !== 1; i++) x.setDate(x.getDate() - 1);
  return x;
}

/** 1 Farvardin of the current Jalali year */
export function startOfJalaliYear(date: Date): Date {
  const x = startOfDay(date);
  for (let i = 0; i < 366; i++) {
    const j = jalaliParts(x);
    if (j.m === 1 && j.d === 1) break;
    x.setDate(x.getDate() - 1);
  }
  return x;
}

/** Iranian week starts on Saturday */
export function startOfJalaliWeek(date: Date): Date {
  const x = startOfDay(date);
  x.setDate(x.getDate() - ((x.getDay() + 1) % 7));
  return x;
}

/** Date -> "yyyy-mm-dd" for <input type="date"> (local time) */
export function toInputDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromInputDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
