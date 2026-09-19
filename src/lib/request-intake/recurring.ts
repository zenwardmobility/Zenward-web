/**
 * Requested recurring schedule (trusted intake contract v1.1).
 *
 * This describes the schedule the requester WANTS. It does not create trips,
 * a series, or any booking — Zenward reviews it and confirms what can be
 * arranged. Deliberately a small explicit shape, not an iCalendar RRULE.
 *
 * `parseRecurringSchedule` is the single server-side validator. It is pure
 * (no I/O, no logging), so the Server Action, the contract tests and any
 * future receiver reference implementation share one set of rules.
 */
export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, { short: string; long: string }> = {
  monday: { short: "Mon", long: "Monday" },
  tuesday: { short: "Tue", long: "Tuesday" },
  wednesday: { short: "Wed", long: "Wednesday" },
  thursday: { short: "Thu", long: "Thursday" },
  friday: { short: "Fri", long: "Friday" },
  saturday: { short: "Sat", long: "Saturday" },
  sunday: { short: "Sun", long: "Sunday" },
};

export interface RecurringSchedule {
  /** One or more distinct weekdays, in Monday→Sunday order. */
  daysOfWeek: Weekday[];
  /** First requested date, `YYYY-MM-DD`. */
  startDate: string;
  /** Last requested date, `YYYY-MM-DD`; on or after `startDate`. Omitted when open-ended/unknown. */
  endDate?: string;
  /** Typical appointment time, 24-hour `HH:MM`. */
  appointmentTime?: string;
  /** Whether a return trip is expected on the recurring days. Strict boolean. */
  returnTripExpected?: boolean;
}

export type RecurringParseResult =
  | { ok: true; value: RecurringSchedule | undefined }
  | { ok: false; reason: string };

const ALLOWED_KEYS = new Set(["daysOfWeek", "startDate", "endDate", "appointmentTime", "returnTripExpected"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** True for a real calendar date in `YYYY-MM-DD` form (rejects 2026-02-30, 2026-13-01, …). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** True for a 24-hour `HH:MM` time. */
export function isTime(value: unknown): value is string {
  return typeof value === "string" && TIME_RE.test(value);
}

const fail = (reason: string): RecurringParseResult => ({ ok: false, reason });

/** An optional string that the form sends as "" or omits when empty. */
function absent(v: unknown): boolean {
  return v === undefined || v === null || v === "";
}

/**
 * Validates an untrusted value as a `RecurringSchedule`.
 *
 * - `undefined` / `null` → `{ ok: true, value: undefined }` (a one-time request).
 * - Anything else must be a plain object with ONLY the five known keys —
 *   an array, primitive, or object with unknown keys is rejected (a
 *   structured object is rejected when malformed rather than silently
 *   trimmed).
 * - `daysOfWeek`: array of 1–7 distinct allowed weekday strings.
 * - `startDate`: required, a real `YYYY-MM-DD` date.
 * - `endDate`: optional; a real date, not before `startDate`.
 * - `appointmentTime`: optional; valid 24-hour `HH:MM`.
 * - `returnTripExpected`: optional; a strict boolean (`"true"`/`1` rejected).
 * The returned value is a freshly built object (never the input reference)
 * with weekdays in canonical Monday→Sunday order.
 */
export function parseRecurringSchedule(input: unknown): RecurringParseResult {
  if (input === undefined || input === null) return { ok: true, value: undefined };

  if (typeof input !== "object" || Array.isArray(input)) return fail("not an object");
  const proto = Object.getPrototypeOf(input);
  if (proto !== Object.prototype && proto !== null) return fail("not a plain object");

  const src = input as Record<string, unknown>;
  for (const key of Object.keys(src)) {
    if (!ALLOWED_KEYS.has(key)) return fail("unknown field");
  }

  // daysOfWeek
  const days = src.daysOfWeek;
  if (!Array.isArray(days) || days.length < 1 || days.length > WEEKDAYS.length) return fail("daysOfWeek");
  const seen = new Set<string>();
  for (const d of days) {
    if (typeof d !== "string" || !(WEEKDAYS as readonly string[]).includes(d)) return fail("daysOfWeek value");
    if (seen.has(d)) return fail("duplicate day");
    seen.add(d);
  }
  const daysOfWeek = WEEKDAYS.filter((d) => seen.has(d));

  // startDate (required)
  if (!isIsoDate(src.startDate)) return fail("startDate");
  const startDate = src.startDate;

  // endDate (optional)
  let endDate: string | undefined;
  if (!absent(src.endDate)) {
    if (!isIsoDate(src.endDate)) return fail("endDate");
    if (src.endDate < startDate) return fail("endDate before startDate"); // ISO dates sort lexicographically
    endDate = src.endDate;
  }

  // appointmentTime (optional)
  let appointmentTime: string | undefined;
  if (!absent(src.appointmentTime)) {
    if (!isTime(src.appointmentTime)) return fail("appointmentTime");
    appointmentTime = src.appointmentTime;
  }

  // returnTripExpected (optional, strict boolean)
  let returnTripExpected: boolean | undefined;
  if (src.returnTripExpected !== undefined && src.returnTripExpected !== null) {
    if (typeof src.returnTripExpected !== "boolean") return fail("returnTripExpected");
    returnTripExpected = src.returnTripExpected;
  }

  const value: RecurringSchedule = { daysOfWeek, startDate };
  if (endDate !== undefined) value.endDate = endDate;
  if (appointmentTime !== undefined) value.appointmentTime = appointmentTime;
  if (returnTripExpected !== undefined) value.returnTripExpected = returnTripExpected;
  return { ok: true, value };
}
