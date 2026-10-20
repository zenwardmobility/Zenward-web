/**
 * Zenward Resources: article bodies (ZW-WEB-04K). Rendered on the server by
 * the Resource template; never imported by client components.
 *
 * Writing rules (see the 04K report):
 *   - transportation information, never healthcare advice (no diagnosis,
 *     treatment, medication or condition-management guidance)
 *   - only owner-confirmed facts: Metro Atlanta; licensed & insured;
 *     punctuality standard; trained & vetted drivers; background checks;
 *     wheelchair-accessible transportation; 2-hour response during working
 *     hours; a request isn't a confirmed ride; pricing confirmed after review
 *   - nothing about hours, payment, insurance/Medicaid/Medicare, specific
 *     cities or counties, equipment specifications or same-day promises
 *   - short paragraphs, practical lists, one contextual bridge + one final CTA
 *
 * Relative imports only (node-testable claim scan).
 */
import { QUOTE_RESPONSE_LINE } from "../trust.ts";
import { CONFIRMED, factAnswer } from "../operating-facts.ts";
import { business } from "../business.ts";
import { ASSISTANCE_LEVELS, ASSISTANCE_REVIEW_NOTE } from "../assistance-level.ts";
import type { ResourceSlug } from "./catalog.ts";

export type ResourceBlock =
  /** A paragraph, optionally followed by one in-site link. */
  | { type: "p"; text: string; link?: { href: string; label: string } }
  /** Term + description pairs (the canonical assistance levels). */
  | { type: "definitions"; items: { term: string; description: string }[] }
  | { type: "h2"; id: string; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  /** A static checklist (printable, not interactive). */
  | { type: "checklist"; items: { label: string; hint?: string }[] }
  /** A short highlighted note (non-emergency boundary, request vs booking). */
  | { type: "note"; text: string }
  /** Short questions and answers (confirmed operating facts only). */
  | { type: "faq"; items: { question: string; answer: string }[] };

export interface ResourceBody {
  intro: string;
  blocks: ResourceBlock[];
  /** One contextual bridge to the most relevant service. */
  bridge: { heading: string; text: string };
  /** Interactive checklist items (the trip-checklist tool only). */
  tool?: { label: string; hint: string }[];
}

const EMERGENCY_NOTE =
  "Zenward provides non-emergency transportation only. For a medical emergency, call 911 or your local emergency services.";
const REQUEST_NOTE = `${CONFIRMED.notABooking} ${CONFIRMED.pricing}`;

/** The four Pickup & assistance levels, from the canonical source (ZW-WEB-04G3). */
const ASSISTANCE_DEFINITIONS: ResourceBlock = {
  type: "definitions",
  items: ASSISTANCE_LEVELS.map((level) => ({ term: level.label, description: level.description })),
};

export const RESOURCE_BODIES: Record<ResourceSlug, ResourceBody> = {
  "what-is-non-emergency-medical-transportation": {
    intro:
      "Non-emergency medical transportation, often called NEMT, is pre-arranged transportation to or from medical care for people who do not need emergency medical transport.",
    blocks: [
      { type: "h2", id: "what-it-is", text: "What NEMT is" },
      {
        type: "p",
        text: "NEMT is planned transportation for medical reasons. The trip is arranged ahead of time, the pickup and destination are known, and the transportation team knows enough about the passenger to plan the ride properly.",
      },
      {
        type: "p",
        text: "It is different from a taxi or rideshare because the trip is organised around the medical visit and the passenger's needs, not just the address.",
      },
      { type: "h2", id: "who-uses-it", text: "Who may use it" },
      {
        type: "list",
        items: [
          "People who cannot drive themselves or need another transportation option for a medical appointment",
          "Older adults going to regular medical care",
          "Passengers who use a wheelchair or need extra time getting in and out of a vehicle",
          "People going home after a hospital stay",
          "Anyone with a repeating schedule, such as dialysis or therapy sessions",
        ],
      },
      {
        type: "p",
        text: "The ride is often arranged by someone else: a family member, a caregiver, or a care team at a clinic or hospital.",
      },
      { type: "h2", id: "examples", text: "Examples of non-emergency trips" },
      {
        type: "list",
        items: [
          "A doctor, specialist or outpatient appointment",
          "A diagnostic visit, such as a scan or test",
          "Dialysis treatments on set days each week",
          "Physical or occupational therapy sessions",
          "Leaving the hospital after discharge",
        ],
      },
      { type: "h2", id: "not-an-ambulance", text: "How it differs from an ambulance" },
      {
        type: "p",
        text: "NEMT is not emergency medical transportation. If someone needs emergency medical care, call 911. Zenward does not provide ambulance or stretcher transportation.",
      },
      { type: "h2", id: "how-a-request-works", text: "How a transportation request generally works" },
      {
        type: "list",
        ordered: true,
        items: [
          "You share the trip details: who is travelling, from where, to where, and when.",
          "The transportation provider reviews the trip, including any mobility or assistance needs.",
          "They contact you to confirm availability, the details and the price.",
          "The ride takes place as confirmed.",
        ],
      },
      { type: "note", text: REQUEST_NOTE },
    ],
    bridge: {
      heading: "Need a ride to a medical appointment?",
      text: "Zenward Mobility provides non-emergency medical transportation in Metro Atlanta. Send the trip details and our team will review them and contact you.",
    },
  },

  "how-to-arrange-nemt-in-metro-atlanta": {
    intro:
      "Arranging a ride to medical care goes more smoothly when you have the right details ready. This guide walks through what to prepare and what happens after you request transportation in Metro Atlanta.",
    blocks: [
      { type: "h2", id: "prepare", text: "1. Gather the trip details" },
      {
        type: "list",
        items: [
          "The passenger's name, and your relationship to them if you're arranging it",
          "The pickup address, or the name of the facility",
          "The destination address or facility name",
          "The date of the trip",
          "The appointment time, if there is one",
          "A phone number where you can be reached",
        ],
      },
      {
        type: "p",
        text: "If you're not sure of every detail yet, start with what you know. The transportation team can follow up on the rest.",
      },
      { type: "h2", id: "choose", text: "2. Choose the closest type of transportation" },
      {
        type: "p",
        text: "Think about the reason for the trip: a single appointment, a repeating treatment such as dialysis, a hospital discharge, or a trip that needs wheelchair-accessible transportation. Picking the closest match helps the team plan, and you can add anything else in the notes.",
        link: { href: "/locations/metro-atlanta", label: "Transportation services in Metro Atlanta" },
      },
      { type: "h2", id: "timing", text: "3. Plan the date and time" },
      {
        type: "list",
        items: [
          "Give your preferred date and pickup time, and the appointment time if you know it.",
          "Allow for check-in at the destination when you think about pickup time.",
          "Request as early as you can. Availability depends on the trip details and requested time.",
        ],
      },
      { type: "h2", id: "mobility", text: "4. Share mobility and assistance needs" },
      {
        type: "p",
        text: "Say whether the passenger uses a wheelchair, a walker or a cane, or needs extra time. Mention steps, narrow entrances or a specific door at either end. This information is about planning the ride, so there is no need to share medical details.",
      },
      {
        type: "p",
        text: "The request form also asks for the pickup & assistance level: curb-to-curb, door-to-door, door-through-door, or not sure, if you'd like Zenward to review it with you.",
        link: { href: "/resources/wheelchair-accessible-transportation-guide#assistance-level", label: "What each assistance level means" },
      },
      { type: "h2", id: "return", text: "5. Decide about the return trip" },
      {
        type: "p",
        text: "Say whether a ride home is needed, or that you're not sure yet. Appointments can run long, so the return timing is usually confirmed with you separately.",
      },
      { type: "h2", id: "after", text: "6. What happens after you send the request" },
      {
        type: "list",
        items: [
          QUOTE_RESPONSE_LINE,
          "Zenward reviews availability, the trip details and pricing.",
          "Your ride is arranged only once Zenward confirms it with you.",
        ],
      },
      { type: "note", text: REQUEST_NOTE },
      { type: "h2", id: "common-questions", text: "Common questions" },
      {
        type: "faq",
        items: [
          { question: "How far ahead should I request transportation?", answer: factAnswer("advanceNotice") },
          {
            question: "Can I arrange transportation for a family member?",
            answer:
              "Yes. Many requests are made by a family member, caregiver or care coordinator. The request form asks for your details and your relationship to the passenger, so Zenward knows who to contact about the trip.",
          },
          { question: "What if I don't know the return time yet?", answer: CONFIRMED.returnTrip },
        ],
      },
      { type: "note", text: EMERGENCY_NOTE },
    ],
    bridge: {
      heading: "Ready to arrange a ride in Metro Atlanta?",
      text: `Request a quote online with the details above, or call ${business.phoneDisplay}. Zenward Mobility provides non-emergency medical transportation in Metro Atlanta.`,
    },
  },

  "dialysis-transportation-guide": {
    intro:
      "For many riders, dialysis transportation follows a repeating weekly schedule. Planning those trips together can make transportation easier to coordinate for the rider and family.",
    blocks: [
      { type: "h2", id: "schedule", text: "Think in schedules, not single trips" },
      {
        type: "p",
        text: "When you request recurring transportation, describe the pattern: which days of the week, the date the schedule should start, and the time you usually need to arrive. If the schedule has an end date, include it.",
      },
      {
        type: "p",
        text: "Consistency matters for transportation planning. If treatment days or times are likely to change, say so in the notes so the team can plan around it.",
      },
      { type: "h2", id: "pickup", text: "Pickup details" },
      {
        type: "list",
        items: [
          "The pickup address, and the entrance or door to use",
          "Whether there are steps or a long walk to the vehicle",
          "The name of the treatment center and the entrance used for drop-off",
          "A phone number for the person who should be contacted about the rides",
        ],
      },
      { type: "h2", id: "times", text: "Preferred times" },
      {
        type: "p",
        text: "Give the time you need to arrive for treatment. The transportation team will confirm pickup timing with you, allowing for the trip and check-in.",
      },
      { type: "h2", id: "return", text: "The ride home" },
      {
        type: "p",
        text: "Say whether a return trip is expected on treatment days. Return pickup times may vary, so the return arrangement should be confirmed rather than assumed.",
      },
      { type: "h2", id: "prepare", text: "Information to have ready" },
      {
        type: "checklist",
        items: [
          { label: "Days of the week" },
          { label: "Start date", hint: "and end date, if known" },
          { label: "Arrival time at the treatment center" },
          { label: "Pickup address and entrance" },
          { label: "Treatment center name and address" },
          { label: "Return trip on treatment days?" },
          { label: "Mobility or assistance needs" },
          { label: "Contact name and phone number" },
        ],
      },
      { type: "h2", id: "review", text: "A recurring request is reviewed, not booked automatically" },
      {
        type: "p",
        text: "Sending a recurring schedule doesn't automatically create or confirm a series of rides. Zenward reviews the schedule and confirms with you what can be arranged.",
      },
      { type: "note", text: "This guide covers transportation only. For questions about treatment, speak with your care team." },
    ],
    bridge: {
      heading: "Need recurring transportation for dialysis?",
      text: "Tell Zenward about the schedule and we'll review what can be arranged.",
    },
  },

  "wheelchair-accessible-transportation-guide": {
    intro:
      "A wheelchair-accessible trip is easier to plan when the transportation team knows how the passenger moves and what the pickup and destination are like. Here is what to share before the ride.",
    blocks: [
      { type: "h2", id: "mobility", text: "Share the right mobility information" },
      {
        type: "list",
        items: [
          "Whether the passenger travels in their own wheelchair",
          "Whether it is a manual or power wheelchair",
          "Any other mobility aid, such as a walker",
        ],
      },
      {
        type: "p",
        text: "You don't need to share medical details. The goal is to help the team plan a safe, comfortable ride.",
      },
      { type: "h2", id: "pickup", text: "Pickup accessibility" },
      {
        type: "list",
        items: [
          "Steps, ramps or a lift at the pickup building",
          "The entrance that is easiest to use",
          "Where a vehicle can stop close to that entrance",
          "Any gate codes or building access instructions",
        ],
      },
      { type: "h2", id: "destination", text: "Destination details" },
      {
        type: "p",
        text: "Give the facility name and address, and the entrance used for drop-off if you know it. Large medical campuses often have several entrances.",
      },
      { type: "h2", id: "prepare", text: "Preparing for the trip" },
      {
        type: "list",
        items: [
          "Allow extra time for getting in and out of the vehicle.",
          "Have anything the passenger needs for the visit ready before pickup.",
          "Say whether someone will travel with the passenger or meet them on arrival.",
        ],
      },
      { type: "h2", id: "assistance-level", text: "Choose the assistance level that fits the trip" },
      {
        type: "p",
        text: `The request form asks for the pickup & assistance level: how much driver escort would help at pickup and drop-off. ${ASSISTANCE_REVIEW_NOTE}`,
      },
      ASSISTANCE_DEFINITIONS,
      {
        type: "p",
        text: "If the passenger needs any other assistance, describe it in the request. Zenward reviews it and confirms what can be accommodated before the trip.",
      },
      { type: "h2", id: "review", text: "Reviewed and confirmed with you" },
      { type: "p", text: "Zenward reviews every wheelchair-accessible request and confirms the arrangement with you before the trip." },
      { type: "note", text: REQUEST_NOTE },
    ],
    bridge: {
      heading: "Planning a wheelchair-accessible trip?",
      text: "Send the trip and mobility details, and Zenward will review the request and confirm the arrangement with you.",
    },
  },

  "hospital-discharge-transportation-checklist": {
    intro:
      "Getting someone home, or to their next place of care, after a hospital stay involves a few moving parts. Use this checklist to gather the details before you request transportation.",
    blocks: [
      { type: "h2", id: "checklist", text: "Discharge transportation checklist" },
      {
        type: "checklist",
        items: [
          { label: "Hospital and discharge location", hint: "unit or department, and the exit to use" },
          { label: "Destination", hint: "home, family member's home, or another care setting" },
          { label: "Expected discharge date and time", hint: "your best estimate" },
          { label: "Transportation contact", hint: "name and phone number of the person to call about the ride" },
          { label: "Mobility and accessibility needs", hint: "wheelchair, walker, extra time" },
          { label: "Entrance and pickup instructions", hint: "where the vehicle should stop" },
          { label: "Will someone meet the passenger at the destination?" },
          { label: "Transportation confirmed", hint: "wait for confirmation before relying on the ride" },
        ],
      },
      { type: "h2", id: "timing", text: "Discharge times often change" },
      {
        type: "p",
        text: "Hospital discharge times can change during the day. Share the best estimate available and update the transportation provider if the expected time changes.",
      },
      {
        type: "p",
        text: "An estimated discharge time is a starting point for planning, not a fixed pickup. Zenward confirms timing with you.",
      },
      { type: "h2", id: "coordinators", text: "For care coordinators" },
      {
        type: "list",
        items: [
          "Confirm who the transportation team should contact: you, the patient or a family member.",
          "Note anything about the destination the patient can't easily explain, such as building access.",
          "If the patient needs ambulance or stretcher transport, arrange that separately. Zenward provides non-emergency transportation.",
        ],
      },
      { type: "note", text: REQUEST_NOTE },
    ],
    bridge: {
      heading: "Arranging transportation after a discharge?",
      text: "Share the discharge details and Zenward will review the trip and confirm timing with you.",
    },
  },

  "medical-transportation-trip-checklist": {
    intro:
      "Use this checklist to get the details together before you request a ride. Tick items off as you go, or print it.",
    blocks: [
      {
        type: "note",
        text: "This checklist is for your own planning. Nothing you tick here is sent to Zenward, and it is not a transportation request.",
      },
    ],
    tool: [
      { label: "Transportation type", hint: "For example, a medical appointment, dialysis or a hospital discharge" },
      { label: "Pickup location", hint: "Address or facility name, and the entrance to use" },
      { label: "Destination", hint: "Address or facility name" },
      { label: "Trip date", hint: "The day you need transportation" },
      { label: "Appointment or required arrival time", hint: "If known" },
      { label: "Preferred pickup time", hint: "Allow for check-in at the destination" },
      { label: "Return trip needed?", hint: "Yes, no, or not sure yet" },
      { label: "Pickup & assistance level", hint: "Curb-to-curb, door-to-door, door-through-door, or not sure" },
      { label: "Mobility or assistance needs", hint: "Wheelchair, walker, extra time" },
      { label: "Requester / contact person", hint: "Name and phone number" },
      { label: "Special entrance or pickup instructions", hint: "Gate codes, a specific door, where to wait" },
    ],
    bridge: {
      heading: "Ready to request transportation?",
      text: "Bring these details to the quote request, or call Zenward and we'll take them over the phone.",
    },
  },
};
