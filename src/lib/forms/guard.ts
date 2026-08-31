/**
 * Shared, provider-agnostic hardening for the two public forms (transportation
 * request + contact). Everything here runs **server-side only**, inside the
 * Server Actions — the browser never sees these checks or their thresholds.
 *
 * Deliberately lightweight: a honeypot field, a minimum fill-time, length
 * caps, a total-payload cap, and string normalisation. No CAPTCHA — the
 * brief calls for restraint, and these controls stop the overwhelming
 * majority of drive-by bot spam without adding friction for real people.
 */

/** Anti-abuse signals collected by the client and passed alongside the form payload. */
export interface SubmissionGuard {
  /** Honeypot field value. A real user never fills it; a bot that auto-fills every input does. */
  hp?: string;
  /** `Date.now()` captured when the form first mounted, used for a minimum fill-time check. */
  startedAt?: number;
}

/** Minimum time (ms) a genuine person needs to read and complete a form. Faster than this ⇒ almost certainly automated. */
const MIN_FILL_MS = 2_500;

/** Upper bound (ms) on `startedAt` skew we tolerate — guards against a stale timestamp being replayed. */
const MAX_FILL_MS = 1000 * 60 * 60 * 6;

/** Hard cap on the JSON size of a single submission. Normal submissions are a few KB. */
export const MAX_PAYLOAD_BYTES = 16 * 1024;

/** Per-field length caps. Applied by truncating, not by rejecting, so a slightly long value still goes through. */
export const FIELD_LIMITS = {
  name: 120,
  email: 254,
  phone: 40,
  organization: 160,
  shortText: 400,
  longText: 2_000,
} as const;

export type GuardOutcome = { ok: true } | { ok: false; reason: string };

/**
 * Runs the honeypot + timing checks. Returns a generic, non-technical reason
 * string on failure — safe to surface to the user (it never names the check
 * that tripped).
 */
export function checkSubmissionGuard(guard: SubmissionGuard | undefined): GuardOutcome {
  const genericReject = "We couldn't accept this submission. Please try again, or call us.";

  if (guard?.hp && guard.hp.trim() !== "") {
    return { ok: false, reason: genericReject };
  }

  // Only enforce timing when the client sent a plausible positive timestamp.
  const startedAt =
    typeof guard?.startedAt === "number" && Number.isFinite(guard.startedAt) && guard.startedAt > 0
      ? guard.startedAt
      : undefined;
  if (startedAt !== undefined) {
    const elapsed = Date.now() - startedAt;
    if (Number.isNaN(elapsed) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
      return { ok: false, reason: genericReject };
    }
  }

  return { ok: true };
}

/** Rejects an obviously oversized payload before it reaches an adapter. */
export function isPayloadWithinLimit(payload: unknown): boolean {
  try {
    return new TextEncoder().encode(JSON.stringify(payload ?? {})).length <= MAX_PAYLOAD_BYTES;
  } catch {
    return false;
  }
}

// C0/C1 control characters, keeping tab (U+0009) and newline (U+000A).
const CONTROL_CHARS = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F-\\u009F]", "g");

/**
 * Normalises a single string field: coerces to string, strips control
 * characters, collapses runaway blank lines, trims, and truncates to `max`.
 * Returns `undefined` for empty results so optional fields stay optional.
 */
export function cleanString(value: unknown, max: number): string | undefined {
  if (value === null || value === undefined) return undefined;
  const raw = typeof value === "string" ? value : String(value);
  const stripped = raw.replace(CONTROL_CHARS, "").replace(/\n{4,}/g, "\n\n\n").trim();
  const capped = stripped.length > max ? stripped.slice(0, max) : stripped;
  return capped.length > 0 ? capped : undefined;
}

/** True when `value` is one of the allowed literals. Used for select/enum fields. */
export function isAllowed<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

/** A loose but real email-shape check — not RFC-perfect, just enough to reject junk. */
export function looksLikeEmail(value: string | undefined): value is string {
  if (!value) return false;
  return value.length <= FIELD_LIMITS.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}
