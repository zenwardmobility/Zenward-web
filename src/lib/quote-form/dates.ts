/**
 * Calendar and preferred-time helpers for the quote form (ZW-WEB-04G).
 *
 * Every date here is a plain `YYYY-MM-DD` string (the `preferredDate` /
 * `recurringSchedule.startDate` wire format). Date arithmetic is done in UTC
 * on those calendar values, so a user's own timezone can never shift a
 * chosen day. Only "today" depends on a clock, and it is computed in the
 * transportation market's timezone.
 *
 * These are PREFERENCES: nothing here knows about vehicle or driver
 * availability, and no date or time is ever marked available or unavailable.
 * Past dates are the only disabled dates.
 *
 * Pure, no imports, no dependencies: native `Date` and `Intl` only.
 */

/** Metro Atlanta (the only active market) is in US Eastern time. */
export const MARKET_TIME_ZONE = "America/New_York";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const pad = (n: number) => String(n).padStart(2, "0");

/** True for a real calendar date in `YYYY-MM-DD` form. */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Today's date in the market timezone, as `YYYY-MM-DD`. `now` is injectable for tests. */
export function todayInMarket(now: Date = new Date(), timeZone: string = MARKET_TIME_ZONE): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function toUtc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUtc(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** The date `days` after (or before, when negative) `iso`. */
export function addDays(iso: string, days: number): string {
  const date = toUtc(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return fromUtc(date);
}

/** True when `iso` is strictly before `today` (ISO dates sort lexicographically). */
export function isBefore(iso: string, today: string): boolean {
  return iso < today;
}

export interface MonthRef {
  year: number;
  /** 0-based month. */
  month: number;
}

export function monthOf(iso: string): MonthRef {
  const [y, m] = iso.split("-").map(Number);
  return { year: y, month: m - 1 };
}

export function addMonths(ref: MonthRef, delta: number): MonthRef {
  const index = ref.year * 12 + ref.month + delta;
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
}

export function compareMonths(a: MonthRef, b: MonthRef): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

/**
 * The weeks of a month for a Sunday-first grid (US convention). Each week has
 * 7 entries: an ISO date, or `null` for a padding cell outside the month.
 */
export function monthWeeks(ref: MonthRef): (string | null)[][] {
  const first = new Date(Date.UTC(ref.year, ref.month, 1));
  const daysInMonth = new Date(Date.UTC(ref.year, ref.month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(first.getUTCDay()).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(`${ref.year}-${pad(ref.month + 1)}-${pad(day)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** "Friday, October 23, 2026". Formatted in UTC so the calendar day never shifts. */
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(toUtc(iso));
}

/** "October 2026". */
export function formatMonth(ref: MonthRef): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(ref.year, ref.month, 1)),
  );
}

/** 24-hour `HH:MM` (the `preferredTime` wire format) -> "9:15 AM". Returns "" for anything else. */
export function formatTime12h(value: string): string {
  if (!TIME_RE.test(value)) return "";
  const [h, m] = value.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${suffix}`;
}

export interface TimeOption {
  /** Wire value, 24-hour `HH:MM`. */
  value: string;
  /** Display label, e.g. "9:15 AM". */
  label: string;
}

export interface TimeOptionGroup {
  label: string;
  options: TimeOption[];
}

function range(fromMinutes: number, toMinutes: number): TimeOption[] {
  const out: TimeOption[] = [];
  for (let t = fromMinutes; t < toMinutes; t += 15) {
    const value = `${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}`;
    out.push({ value, label: formatTime12h(value) });
  }
  return out;
}

/**
 * Preferred pickup times in 15-minute steps, grouped for a compact native
 * select. These are preferences a person can ask for, not inventory: every
 * time of day is listed, and no group or option is marked available.
 * Morning comes first because most medical trips start then.
 */
export const PREFERRED_TIME_GROUPS: readonly TimeOptionGroup[] = [
  { label: "Morning", options: range(5 * 60, 12 * 60) },
  { label: "Afternoon", options: range(12 * 60, 17 * 60) },
  { label: "Evening", options: range(17 * 60, 22 * 60) },
  { label: "Night", options: [...range(22 * 60, 24 * 60), ...range(0, 5 * 60)] },
];
