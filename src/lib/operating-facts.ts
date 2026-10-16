/**
 * Customer-facing operating and commercial facts (ZW-WEB-04I): the ONE source
 * for how Zenward answers hours, payment, coverage, pricing, service-area,
 * same-day/advance, cancellation, return-trip, recurring and confirmation
 * questions, on pages and in the Transportation Assistant.
 *
 * Each fact has an internal status:
 *   confirmed     owner-confirmed; `statement` is published as written
 *   unpublished   exists but the owner hasn't published it (working hours)
 *   unconfirmed   not confirmed by the owner (payment, coverage, ...)
 *   needs_review  needs owner + legal/operations review (cancellation, ...)
 * Status words are NEVER shown publicly. Until a fact is confirmed, its
 * public answer is an honest, professional hand-off to the team (call,
 * request a quote, or contact). To activate a fact later: set
 * `status: "confirmed"` and write the owner's exact `statement`. Every page
 * and the assistant pick it up through `factAnswer()`. Nothing else changes.
 * (The open decisions are listed in docs/product/owner-operating-facts-needed.md.)
 *
 * Never inferred from competitors. Pure data + functions, relative imports,
 * node-testable.
 */
import { business } from "./business.ts";
import { getDefaultMarket } from "./service-area.ts";
import { QUOTE_RESPONSE_LINE } from "./trust.ts";

export type FactStatus = "confirmed" | "unpublished" | "unconfirmed" | "needs_review";

export interface OperatingFact {
  status: FactStatus;
  /** Owner's exact public wording. Only used when status is "confirmed". */
  statement?: string;
  /** Professional public answer while the fact is not confirmed. */
  fallback: string;
}

export type FactKey =
  | "workingHours"
  | "paymentMethods"
  | "coverage"
  | "serviceAreaDetail"
  | "sameDay"
  | "advanceNotice"
  | "cancellation"
  | "noShow"
  | "waitTime"
  | "facilityBilling";

const PHONE = business.phoneDisplay;
const MARKET = getDefaultMarket().name;

/** Owner-confirmed facts, restated from their canonical sources. */
export const CONFIRMED = {
  business: `Zenward Mobility provides non-emergency medical transportation in ${MARKET}.`,
  response: QUOTE_RESPONSE_LINE,
  notABooking:
    "A request isn't a confirmed ride. Zenward reviews availability, trip details and pricing, and transportation is arranged only after we confirm it with you.",
  pricing: "Pricing is confirmed after Zenward reviews the transportation request and trip details.",
  serviceArea: `Zenward serves ${MARKET}.`,
  returnTrip:
    "Tell us on the request whether you need a return trip, or that you're not sure yet. Zenward confirms return-trip timing with you.",
  recurring:
    "You can describe a repeating schedule on one request. Submitting it doesn't automatically create or confirm a series of rides; Zenward reviews the schedule and confirms what can be arranged.",
  howToRequest: `Send a quote request online or call ${PHONE}. Zenward reviews the trip details and contacts you to confirm availability, next steps and pricing.`,
};

/** Facts the owner has not confirmed for publication. Public answers hand off to the team. */
export const OPERATING_FACTS: Record<FactKey, OperatingFact> = {
  workingHours: {
    status: "unpublished",
    fallback: `Our exact working hours aren't published here yet. Transportation requests received during working hours are reviewed and answered within 2 hours. You can also call ${PHONE}.`,
  },
  paymentMethods: {
    status: "unconfirmed",
    fallback: `Payment and coverage options can depend on the transportation arrangement. Please contact Zenward at ${PHONE} so our team can confirm the options for your request.`,
  },
  coverage: {
    status: "unconfirmed",
    fallback: `Payment and coverage options can depend on the transportation arrangement. Please contact Zenward at ${PHONE} so our team can confirm the options for your request.`,
  },
  serviceAreaDetail: {
    status: "unconfirmed",
    fallback: `Zenward serves ${MARKET}. For a specific pickup or destination, send a transportation request or call our team at ${PHONE} and we'll confirm whether the trip can be arranged.`,
  },
  sameDay: {
    status: "unconfirmed",
    fallback: `Same-day availability must be confirmed by the Zenward team. For a trip today, calling ${PHONE} is the quickest way to reach us.`,
  },
  advanceNotice: {
    status: "unconfirmed",
    fallback:
      "Availability depends on the trip details and requested time. Submit your request as early as possible, and Zenward will review what can be arranged.",
  },
  cancellation: {
    status: "needs_review",
    fallback: `If your plans change, please call ${PHONE} as soon as possible so our team can help with your request.`,
  },
  noShow: {
    status: "needs_review",
    fallback: `If your plans change, please call ${PHONE} as soon as possible so our team can help with your request.`,
  },
  waitTime: {
    status: "needs_review",
    fallback: `Tell us about appointment timing and any return trip on the request, and Zenward will confirm the arrangement with you.`,
  },
  facilityBilling: {
    status: "unconfirmed",
    fallback: `Talk to our team about how payment would work for your organization's requests. Call ${PHONE} or send us a message.`,
  },
};

/** The public answer for a fact: the owner's statement once confirmed, otherwise the hand-off. */
export function factAnswer(key: FactKey, facts: Record<FactKey, OperatingFact> = OPERATING_FACTS): string {
  const fact = facts[key];
  return fact.status === "confirmed" && fact.statement ? fact.statement : fact.fallback;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/** Shared commercial/operations FAQ (not service-specific), built from the facts above. */
export function commercialFaq(facts: Record<FactKey, OperatingFact> = OPERATING_FACTS) {
  return {
    howToRequest: { question: "How do I request transportation?", answer: CONFIRMED.howToRequest },
    response: { question: "When will Zenward reply?", answer: CONFIRMED.response },
    confirmation: { question: "Is my ride confirmed when I submit a request?", answer: `No. ${CONFIRMED.notABooking}` },
    pricing: { question: "How is pricing confirmed?", answer: CONFIRMED.pricing },
    payment: { question: "What payment or coverage options are available?", answer: factAnswer("coverage", facts) },
    hours: { question: "What are your working hours?", answer: factAnswer("workingHours", facts) },
    timing: {
      question: "How far in advance should I request? Can I request same-day transportation?",
      answer: `${factAnswer("advanceNotice", facts)} ${factAnswer("sameDay", facts)}`,
    },
    area: { question: "Do you serve my area?", answer: factAnswer("serviceAreaDetail", facts) },
    returnTrip: { question: "Can I request a return trip?", answer: `Yes. ${CONFIRMED.returnTrip}` },
    recurring: { question: "Can I request recurring transportation?", answer: `Yes. ${CONFIRMED.recurring}` },
    changes: { question: "What if my plans change?", answer: factAnswer("cancellation", facts) },
    facilityBilling: { question: "How is payment arranged for our organization's requests?", answer: factAnswer("facilityBilling", facts) },
  } satisfies Record<string, FaqEntry>;
}
