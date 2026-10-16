/**
 * Healthcare-provider page content (ZW-WEB-04L): who it is for, what to have
 * ready, how a request works and the two common coordination scenarios.
 * Pure data, relative imports only (node-testable).
 *
 * RULES:
 *   - No implied contracts, partnerships, integrations, portals, referral
 *     agreements, facility billing or dedicated account managers. Care teams
 *     REQUEST transportation for patients, exactly like anyone else.
 *   - No organisation names or logos.
 *   - Operational information only: no diagnosis, records or treatment
 *     details are needed to arrange transportation.
 *   - Request (structured form) vs general enquiry (contact form) stays
 *     distinct: trip and passenger details never go through /contact.
 *   - The response and confirmation wording comes from the canonical sources.
 */
import { CONFIRMED } from "./operating-facts.ts";
import { QUOTE_RESPONSE_LINE } from "./trust.ts";
import { ASSISTANCE_LEVEL_LABEL } from "./assistance-level.ts";

export const PROVIDER_REQUEST_HREF = "/request-transportation";
export const PROVIDER_ENQUIRY_HREF = "/contact";
export const DISCHARGE_CHECKLIST_HREF = "/resources/hospital-discharge-transportation-checklist";

export const PROVIDER_HEADLINE = (marketName: string) => `Healthcare transportation coordination for ${marketName}`;

export const PROVIDER_LEDE =
  "Zenward works with care teams that arrange scheduled, non-emergency transportation for patients: one-time trips, recurring schedules and rides home after discharge.";

/** Who the page is for. Roles and settings, never named organisations. */
export const PROVIDER_AUDIENCES = [
  "Care coordinators",
  "Discharge planners",
  "Clinics",
  "Dialysis and treatment centers",
  "Rehabilitation teams",
  "Senior-care teams",
] as const;

/** What a care team should have ready. Transportation details only. */
export const PROVIDER_READY_ITEMS: readonly { label: string; detail: string }[] = [
  { label: "Passenger name", detail: "The person who will be travelling." },
  { label: "Requester and contact details", detail: "Who Zenward should contact about the ride, and their relationship to the passenger." },
  { label: "Pickup and destination", detail: "Addresses or facility names, and the entrance to use." },
  { label: "Trip date and timing", detail: "The preferred date and pickup time, or the appointment time." },
  { label: "Return trip", detail: "Whether a ride back is needed, or not sure yet." },
  { label: "Transportation type", detail: "For example, a medical appointment, dialysis or a hospital discharge." },
  { label: ASSISTANCE_LEVEL_LABEL, detail: "Curb-to-curb, door-to-door, door-through-door, or not sure." },
  { label: "Mobility and access", detail: "A wheelchair or walker, steps, or building-access details that affect the trip." },
  { label: "Recurring schedule", detail: "Days of the week and a start date, if the trips repeat." },
];

export const PROVIDER_NO_MEDICAL_DETAILS =
  "Diagnoses, medical records and treatment details aren't needed to arrange transportation. Please share only what affects the trip.";

/** The real workflow. A request is reviewed by people; nothing is scheduled automatically. */
export const PROVIDER_STEPS: readonly { title: string; text: string }[] = [
  { title: "Send the transportation details", text: "Use the request form, or call our team." },
  { title: "Zenward reviews the request", text: "Our team reviews availability, trip details and pricing." },
  { title: "Zenward follows up", text: QUOTE_RESPONSE_LINE },
  { title: "Transportation is confirmed", text: "Transportation is arranged only after Zenward confirms the details with your team." },
];

export const PROVIDER_NOT_AUTOMATED = `Requests are reviewed by our team, not scheduled automatically. ${CONFIRMED.notABooking}`;

export const PROVIDER_SCENARIOS = {
  recurring: {
    title: "Recurring transportation",
    text: "For dialysis, rehabilitation or other repeating appointments, describe the schedule once: the days of the week, the start date and the usual appointment time. Zenward reviews it and confirms with your team what can be arranged; nothing repeats automatically.",
  },
  discharge: {
    title: "Transportation after discharge",
    text: "For a planned, non-emergency ride after discharge, share the discharge location, the destination and your best estimate of timing. Discharge times can change, so Zenward confirms timing with your team.",
  },
} as const;

/** The distinction between the two routes in, stated plainly. */
export const PROVIDER_ROUTES = {
  request: "To arrange a ride for a patient, use the request form. It collects the trip, passenger and assistance details our team needs.",
  enquiry:
    "For a general question about working with Zenward, not a specific trip, send our team a message. Please don't include patient or trip details there.",
} as const;
