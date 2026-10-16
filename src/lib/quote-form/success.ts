/**
 * Copy for the request-received experience (ZW-WEB-04G3). Shown ONLY after
 * the trusted Server Action returns `delivered: true`.
 *
 * It answers three questions straight away:
 *   Did Zenward receive it?   Yes.
 *   When will I hear back?    Within 2 hours during working hours.
 *   Is my ride confirmed?     No, not until Zenward confirms it.
 *
 * "What happens next" is an EXPLANATION of the process, not a live status:
 * no current/completed/pending states, no progress, no "reviewing now",
 * no driver or vehicle. No reference number is shown (Nemryn returns none,
 * and none is invented) and no internal identifier ever reaches this screen.
 *
 * Pure (node-testable).
 */
import { QUOTE_RESPONSE_LINE } from "../trust.ts";

export const SUCCESS_HEADING = "Request received";
export const SUCCESS_RECEIVED = "Zenward has received your transportation request.";
export const SUCCESS_NOT_CONFIRMED = "This is not a confirmed ride yet.";
export const SUCCESS_NEXT_HEADING = "What happens next";
export const SUCCESS_HELP_HEADING = "Questions about your request?";

export interface SuccessStep {
  title: string;
  text: string;
}

export const SUCCESS_STEPS: readonly SuccessStep[] = [
  { title: "Request received", text: "Your transportation request has reached Zenward." },
  { title: "Review", text: "Our team reviews availability, trip details and pricing." },
  { title: "Follow-up", text: QUOTE_RESPONSE_LINE },
  { title: "Confirmation", text: "Transportation is arranged only after Zenward confirms the details with you." },
];

/** Restrained secondary actions. No "Request another trip" (see the 04G3 report). */
export const SUCCESS_ACTIONS = [
  { label: "View transportation services", href: "/services" },
  { label: "Return to home", href: "/" },
] as const;
