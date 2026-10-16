/**
 * The assistant's knowledge (ZW-WEB-04H). Facts come from the canonical
 * modules, never restated here:
 *   services, labels, pages, quote links  src/lib/service-catalog.ts
 *   service summaries, market name        AssistantContext (built from
 *                                         src/lib/services.ts and
 *                                         src/lib/service-area.ts)
 *   phone                                 src/lib/business.ts
 *   trust facts, 2-hour response          src/lib/trust.ts (04F)
 * This file only adds short, claim-free assistant wording that explains those
 * facts in conversation.
 */
import { SERVICE_CATALOG, SERVICE_ORDER, type ServiceSlug } from "../service-catalog.ts";
import { business } from "../business.ts";
import { OPERATING_STANDARDS, QUOTE_RESPONSE_LINE, TRUST_POINTS } from "../trust.ts";
import type { AssistantContext } from "./types.ts";

export { SERVICE_ORDER };

export const ASSISTANT_NAME = "Zenward Transportation Assistant";

export const PATHS = {
  quote: "/request-transportation",
  contact: "/contact",
  providers: "/healthcare-providers",
  services: "/services",
} as const;

export const PHONE = { display: business.phoneDisplay, href: business.phoneHref };

/** The four approved trust headlines and their wording (04F). */
export const TRUST = {
  licensed: OPERATING_STANDARDS.licensed.description,
  onTime: TRUST_POINTS.find((p) => p.key === "onTime")!.detail,
  drivers: OPERATING_STANDARDS.drivers.description,
  care: OPERATING_STANDARDS.care.description,
  response: QUOTE_RESPONSE_LINE,
  labels: TRUST_POINTS.map((p) => p.compactLabel),
};

export interface ServiceFact {
  slug: ServiceSlug;
  label: string;
  path: string;
  /** `/request-transportation?service=<serviceType>`: the only handoff the assistant uses. */
  requestHref: string;
  summary: string;
}

export function serviceFact(slug: ServiceSlug, ctx: AssistantContext): ServiceFact {
  const entry = SERVICE_CATALOG[slug];
  return { slug, label: entry.label, path: entry.path, requestHref: entry.requestHref, summary: ctx.summaries[slug] };
}

/** One extra line per service, in the same spirit as the quote form's guidance. No new claims. */
export const SERVICE_TIPS: Record<ServiceSlug, string> = {
  "medical-appointments": "On the request, include the clinic or office name as the destination.",
  "dialysis-transportation":
    "If the trips repeat on a treatment schedule, choose Recurring on the request form and tell us the days. Zenward reviews the schedule and confirms what can be arranged.",
  "rehabilitation-transportation":
    "For a series of therapy visits, choose Recurring on the request form and tell us the days.",
  "hospital-discharge-transportation":
    "Discharge times often change. Give your best estimate and Zenward will confirm timing with you.",
  "recurring-care-transportation":
    "Describe the days and start date once. A recurring request isn't an automatically booked series: Zenward reviews it and confirms what can be arranged.",
  "senior-medical-transportation": "Family members and caregivers can request transportation on the passenger's behalf.",
  "wheelchair-transportation":
    "Tell us about the passenger's mobility needs in the request, and Zenward will review the trip and confirm the arrangement with you.",
  "airport-transportation":
    "Include the airport and trip details in the destination or notes. Zenward will confirm the timing with you.",
};

/** The request process, in the order the visitor experiences it. */
export const PROCESS_STEPS = [
  "Send a transportation quote request online, or call us.",
  "Zenward reviews the request.",
  QUOTE_RESPONSE_LINE,
  "Zenward confirms availability, trip details and pricing with you.",
  "A ride isn't confirmed until Zenward confirms it with you.",
];

export const NOT_A_BOOKING = "A request isn't a confirmed ride. Zenward confirms availability and details with you first.";
