/**
 * Zenny: the branded identity of the Zenward Transportation Assistant
 * (ZW-WEB-04H2). Zenny is a WEBSITE ASSISTANT, never presented as a member of
 * staff, a live agent or a person monitoring the chat. Copy, the time-of-day
 * greeting and the phone-number validation live here (pure, node-testable).
 * The answering engine (responses.ts) is unchanged.
 *
 * Owner revision: ONE opening bubble offers an OPTIONAL phone number (no
 * name). Continue with the field empty skips straight to the assistant and
 * sends nothing. A number that is provided is delivered to Zenward's
 * monitored contact inbox through the trusted server-side contact path for
 * possible follow-up (see src/app/assistant/actions.ts). Chat messages are
 * never sent.
 */

export const ZENNY = {
  name: "Zenny",
  /** Teaser shown near the launcher on page load (owner copy, exact). */
  teaser: "Hi, I’m Zenny, here to assist you.",
  /** Panel heading: the assistant's name (owner copy, exact). */
  heading: "Zenny",
  subtitle: "Zenward Transportation Assistant",
  /** Launcher's accessible name. */
  launcherLabel: "Ask Zenny the Assistant",
  /** Owner-supplied fictional portrait (AI-generated, not a real person); served through next/image. */
  avatarSrc: "/images/assistant/zenny-avatar.png",
  /** Second paragraph of the single opening bubble. */
  phonePrompt: "If you’d like Zenward to follow up, you can leave a phone number below.",
  phoneLabel: "Phone number (optional)",
  phonePlaceholder: "(404) 555-0123",
  /** Follow-up disclosure under the field. The number is OPTIONAL; not a marketing or SMS opt-in. */
  consent: "If provided, we’ll only use your number to follow up about this enquiry.",
  /** After Continue (empty = skip, or a delivered number): into the normal assistant. */
  ready: "How can I assist you today?",
  /** Added before `ready` only when a number was entered but delivery wasn't confirmed. */
  notDelivered: "I couldn’t save your number for follow-up, but you can still use Zenny below.",
  welcomeBack: "Welcome back. How can I assist you today?",
  emergencyPrefix: "If this is a medical emergency,",
  emergencyLink: "Call 911",
  operatorPrefix: "To speak with an operator,",
  operatorLink: "Call Zenward 678-935-5489",
} as const;

export type DayPart = "morning" | "afternoon" | "evening";

/** 5:00–11:59 morning, 12:00–16:59 afternoon, 17:00–4:59 evening (visitor's local clock). */
export function dayPart(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

/** First paragraph of the single opening bubble. */
export function timeGreeting(now: Date = new Date()): string {
  const part = dayPart(now.getHours());
  return `Good ${part}. I’m Zenny, here to help with your transportation enquiry.`;
}

/**
 * A US phone number typed with common formatting (digits, spaces, hyphens,
 * dots, parentheses, optional +1). Returns the 10 digits, or an error.
 */
export function validatePhone(raw: string): { ok: true; value: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Please enter your phone number." };
  if (!/^\+?[\d\s().-]+$/.test(trimmed)) {
    return { ok: false, error: "Please enter a 10-digit US phone number, for example 404-555-0123." };
  }
  let digits = trimmed.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10 || /^[01]/.test(digits)) {
    return { ok: false, error: "Please enter a 10-digit US phone number, for example 404-555-0123." };
  }
  return { ok: true, value: digits };
}

/** "(404) 555-0123" for a 10-digit number (used in the internal follow-up email only). */
export function formatUsPhone(digits: string): string {
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
