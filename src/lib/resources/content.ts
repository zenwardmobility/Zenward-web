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
import type { brandImages } from "../images.ts";
import type { ResourceSlug } from "./catalog.ts";

/*
 * Block text (p, list items, notes) may use a minimal inline markup for
 * owner-approved copy: **bold**, *italic* and [label](/in-site-path).
 */
export type ResourceBlock =
  /** A paragraph, optionally followed by one in-site link. */
  | { type: "p"; text: string; link?: { href: string; label: string } }
  /** An approved photograph from `brandImages`, shown uncropped with a caption. */
  | { type: "figure"; image: keyof typeof brandImages; caption: string }
  /** In-body request + call buttons (the Resource's request CTA and the business line). */
  | { type: "actions"; requestLabel: string; callLabel: string }
  /**
   * A compact conversion callout (heading, one line, the Resource's request CTA and the business line), in the
   * bridge design language. ZW-SEO-KW-01: used by Guide 1 only, right after the introduction.
   */
  | { type: "callout"; heading: string; text: string; requestLabel: string; callLabel: string }
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
  /** One contextual bridge to the most relevant service. Omitted when the body ends with its own request section. */
  bridge?: {
    heading: string;
    text: string;
    /** Secondary link beside the bridge button; defaults to the Resource's service/services link (ZW-SEO-GROWTH-02). */
    about?: { href: string; label: string };
  };
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
  // Owner-approved copy (ZENWARD-WEB-SEO-ARTICLE-01): do not reword. The body
  // ends with its own request section, so it has no separate bridge.
  "what-is-non-emergency-medical-transportation": {
    intro:
      "Getting to a medical appointment should be straightforward. But for many people, especially older adults, wheelchair users, and those managing ongoing health conditions, transportation can be one of the hardest parts of receiving care.",
    blocks: [
      {
        type: "p",
        text: "Perhaps your mother needs to attend dialysis three times a week, but you cannot always leave work to drive her. Maybe your father no longer feels comfortable behind the wheel. Or someone you care for needs a wheelchair-accessible vehicle that an ordinary rideshare cannot provide.",
      },
      {
        type: "p",
        text: "These are everyday situations where **non-emergency medical transportation (NEMT)** can make a meaningful difference.",
      },
      {
        type: "p",
        text: "For families in **Metro Atlanta, Georgia**, Zenward Mobility provides scheduled medical transportation, helping patients and caregivers arrange suitable rides with greater clarity and less uncertainty.",
      },
      {
        type: "figure",
        image: "officialVehicle",
        caption: "Zenward Mobility's branded non-emergency medical transportation vehicle serving Metro Atlanta, Georgia.",
      },
      { type: "h2", id: "what-is-nemt", text: "What Is Non-Emergency Medical Transportation?" },
      {
        type: "p",
        text: "Non-emergency medical transportation, commonly called NEMT, helps people travel to and from healthcare appointments when they don't require an ambulance but need a suitable way to get there.",
      },
      {
        type: "p",
        text: "Unlike emergency transportation, NEMT is arranged in advance. It may involve an ordinary passenger vehicle or a wheelchair-accessible vehicle, depending on the rider's mobility requirements.",
      },
      {
        type: "p",
        text: "The goal is simple: help people reach necessary medical care without transportation becoming another obstacle.",
      },
      { type: "h2", id: "who-can-benefit", text: "Who Can Benefit From NEMT?" },
      { type: "p", text: "Medical transportation isn't only for people who use wheelchairs. It can also help:" },
      {
        type: "list",
        items: [
          "**Older adults** who no longer drive independently.",
          "**Dialysis patients** who need transportation several times a week.",
          "**People with mobility limitations** who require an accessible vehicle.",
          "**Patients recovering from procedures** who are unable to drive.",
          "**Individuals attending therapy or specialist appointments** without dependable transportation.",
          "**Families and caregivers** coordinating appointments for loved ones.",
        ],
      },
      {
        type: "p",
        text: "For someone managing a health condition, knowing that transportation has been arranged can make an already demanding day a little easier.",
      },
      { type: "h2", id: "types-of-trips", text: "What Types of Medical Trips Can Be Arranged?" },
      { type: "p", text: "Depending on the provider's capabilities, non-emergency medical transportation may be arranged for:" },
      {
        type: "list",
        items: [
          "Doctor and specialist appointments",
          "Dialysis treatments",
          "Physical therapy and rehabilitation",
          "Outpatient procedures",
          "Medical tests and follow-up visits",
          "Suitable hospital discharge trips",
          "Recurring medical appointments",
        ],
      },
      {
        type: "p",
        text: "At Zenward Mobility, we review each transportation request to understand the passenger's needs, destination, schedule, and vehicle requirements before confirming availability.",
      },
      { type: "h2", id: "choosing-a-provider", text: "What Should You Look for in an NEMT Provider?" },
      { type: "p", text: "When arranging transportation for yourself or someone you love, a few questions are worth asking." },
      {
        type: "p",
        text: "**Is the vehicle suitable?** If the passenger uses a wheelchair or mobility aid, confirm that the vehicle can accommodate their needs.",
      },
      {
        type: "p",
        text: "**Are pickup and return arrangements clear?** Medical appointments sometimes run longer than expected. Ask how the return trip will be handled.",
      },
      {
        type: "p",
        text: "**Will you receive confirmation?** Make sure the provider has reviewed the trip details and confirmed the arrangements.",
      },
      {
        type: "p",
        text: "**Do you understand the cost?** Ask about pricing, waiting time, and any additional charges before booking.",
      },
      {
        type: "p",
        text: "A dependable experience begins with clear communication, not just a vehicle arriving at the pickup location.",
      },
      { type: "h2", id: "nemt-in-the-united-states", text: "How Does NEMT Work in the United States?" },
      {
        type: "p",
        text: "In the United States, non-emergency medical transportation may be arranged privately, through healthcare facilities, or through certain health coverage programs.",
      },
      {
        type: "p",
        text: "Some eligible Medicaid beneficiaries may receive transportation assistance for covered medical services. However, eligibility, scheduling procedures, and participating providers vary by state and health plan.",
      },
      {
        type: "p",
        text: "If you intend to use an insurance or transportation benefit, confirm the arrangements with your coverage provider before booking.",
      },
      {
        type: "p",
        text: "For privately arranged trips, contact the transportation company directly to discuss availability, mobility requirements, and pricing.",
      },
      { type: "h2", id: "metro-atlanta", text: "Non-Emergency Medical Transportation in Metro Atlanta, Georgia" },
      {
        type: "p",
        text: "Finding dependable transportation for medical appointments can be challenging, especially when you're coordinating care for someone else.",
      },
      {
        type: "p",
        text: "**Zenward Mobility serves patients and families in Metro Atlanta**, providing scheduled non-emergency medical transportation with a focus on clear communication, appropriate vehicle arrangements, and respectful service.",
      },
      {
        type: "p",
        text: "Our transportation options include wheelchair-accessible transportation for suitable trips, subject to vehicle availability and the passenger's needs.",
      },
      {
        type: "p",
        text: "Whether you're arranging transportation for a doctor's visit, recurring treatment, or another non-emergency medical appointment, we want the process to feel straightforward.",
      },
      {
        type: "p",
        text: "When you request a ride, we review your trip details, confirm what transportation arrangements are available, and communicate pricing before the booking is finalized.",
      },
      {
        type: "p",
        text: "You can learn more about our [medical transportation services](/services) or explore our [Metro Atlanta service area](/locations/metro-atlanta).",
      },
      { type: "h2", id: "getting-to-care", text: "Getting to Care Shouldn't Be Another Worry" },
      {
        type: "p",
        text: "Medical appointments can already bring enough uncertainty. Patients may be thinking about their treatment, while family members are concerned about how their loved one will get there and return home.",
      },
      {
        type: "p",
        text: "Having the right transportation arrangements won't remove every concern, but it can make one important part of the day easier to manage.",
      },
      { type: "p", text: "That is what we want to help families achieve at Zenward Mobility." },
      { type: "h2", id: "request-transportation", text: "Need Medical Transportation in Metro Atlanta?" },
      {
        type: "p",
        text: "If you or someone you care for needs non-emergency medical transportation in Metro Atlanta, we'd be glad to review your trip requirements.",
      },
      {
        type: "p",
        text: "Tell us where you need to go, when your appointment is scheduled, and whether you need wheelchair-accessible transportation or other assistance.",
      },
      { type: "p", text: "We'll review the details, check availability, and explain the next steps." },
      { type: "actions", requestLabel: "Request Transportation", callLabel: `Call: ${business.phoneDisplay}` },
      { type: "p", text: "*Zenward Mobility — Care that gets you there.*" },
      {
        type: "note",
        text: "*Please note: Non-emergency medical transportation is not a substitute for emergency medical care. If you're experiencing a medical emergency, call 911.*",
      },
    ],
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
        text: "Think about the reason for the trip: a single [medical appointment](/services/medical-appointments), a repeating treatment such as [dialysis](/services/dialysis-transportation), a [hospital discharge](/services/hospital-discharge-transportation), or a trip that needs [wheelchair-accessible transportation](/services/wheelchair-transportation). Picking the closest match helps the team plan, and you can add anything else in the notes.",
        link: { href: "/locations/metro-atlanta", label: "Non-emergency medical transportation in Metro Atlanta" },
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
      { type: "actions", requestLabel: "Request a Quote", callLabel: `Call ${business.phoneDisplay}` },
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
      about: { href: "/locations/metro-atlanta", label: "Medical transportation in Metro Atlanta" },
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
        link: { href: "/services/dialysis-transportation", label: "Dialysis transportation in Metro Atlanta" },
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
      {
        type: "p",
        text: "Zenward reviews every wheelchair-accessible request and confirms the arrangement with you before the trip.",
        link: { href: "/services/wheelchair-transportation", label: "Wheelchair-accessible transportation in Metro Atlanta" },
      },
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
          "If the patient needs ambulance or stretcher transport, arrange that separately. Zenward provides non-emergency [hospital discharge transportation](/services/hospital-discharge-transportation).",
        ],
      },
      { type: "note", text: REQUEST_NOTE },
    ],
    bridge: {
      heading: "Arranging transportation after a discharge?",
      text: "Share the discharge details and Zenward will review the trip and confirm timing with you. Zenward provides non-emergency hospital discharge transportation in Metro Atlanta.",
    },
  },

  // ZW-SEO-KW-01 Guide 1: owner-approved REV 2 copy (2026-11-26). Shared facts come from their canonical
  // sources (assistance levels, short-notice hand-off, response line, pricing). Do not reword without approval.
  "no-ride-home-from-the-hospital": {
    intro:
      "When a hospital stay ends, the question of how to get home can come up quickly, especially if family can't drive or no one is nearby. This guide covers your options, what to have ready, and how to request planned, non-emergency transportation home or to the next place of care in the Metro Atlanta area.",
    blocks: [
      // Owner-approved conversion callout (KW-01 final refinement): after the intro, before "On this page".
      {
        type: "callout",
        heading: "Need help arranging a ride home?",
        text: "Request planned hospital discharge transportation in Metro Atlanta. Availability and pricing are confirmed after we review your trip.",
        requestLabel: "Request a Quote",
        callLabel: `Call ${business.phoneDisplay}`,
      },
      { type: "h2", id: "care-team", text: "1. Start with the care team" },
      {
        type: "p",
        text: "Ask the care team when discharge is expected, and whether the patient has any discharge requirements for the trip home. Discharge times often shift during the day, so treat any time you're given as an estimate.",
      },
      {
        type: "p",
        text: "If the care team says the patient needs ambulance or stretcher transport, that has to be arranged separately. Zenward provides non-emergency transportation only.",
      },
      { type: "h2", id: "options", text: "2. Your options for getting home" },
      {
        type: "list",
        items: [
          "**Family or a friend.** Often the simplest, if someone is available and the passenger can get in and out of a car comfortably.",
          "**A taxi or rideshare.** This can work for some people. It may not suit a passenger who uses a wheelchair, or who needs help between the door and the vehicle.",
          "**Scheduled non-emergency medical transportation.** A planned ride that takes mobility needs into account, requested by the patient, a family member or the care team. This is what Zenward provides.",
        ],
      },
      { type: "h2", id: "no-family", text: "3. When family can't come" },
      {
        type: "p",
        text: "You don't need a relative to make the request. The passenger, a family member, a caregiver, or healthcare provider or facility staff can request transportation. The form asks for your relationship to the passenger, and Zenward follows up with the person who made the request.",
      },
      {
        type: "p",
        // Release decision (KW-01): post-procedure policy is unconfirmed, so this only points to the facility's requirements.
        text: "Some facilities have their own discharge requirements, for example after a procedure or sedation. Check these with the care team before you arrange transportation.",
      },
      { type: "h2", id: "prepare", text: "4. What to have ready" },
      {
        type: "list",
        items: [
          "The hospital, and where the passenger will be picked up",
          "The destination",
          "The expected discharge date and time (entered as the preferred date and pickup time)",
          "A contact name and phone number",
          "Any mobility needs",
        ],
      },
      {
        type: "p",
        text: "Our [hospital discharge transportation checklist](/resources/hospital-discharge-transportation-checklist) lists everything in one place.",
      },
      { type: "p", text: "If you don't have every detail yet, send what you know. The transportation team can follow up on the rest." },
      { type: "h2", id: "mobility", text: "5. Wheelchairs, walkers and help at the door" },
      {
        type: "p",
        text: "Say whether the passenger uses a wheelchair, walker or cane, or needs extra time. Zenward offers [wheelchair-accessible transportation](/services/wheelchair-transportation).",
      },
      {
        type: "p",
        text: "The request form asks for the pickup & assistance level, meaning how much driver escort would help at pickup and drop-off:",
      },
      ASSISTANCE_DEFINITIONS,
      {
        type: "p",
        text: ASSISTANCE_REVIEW_NOTE,
        link: { href: "/resources/wheelchair-accessible-transportation-guide#assistance-level", label: "What each assistance level means" },
      },
      { type: "h2", id: "destination", text: "6. Going somewhere other than home" },
      {
        type: "p",
        text: "The trip doesn't have to end at the passenger's own home. It can go to a relative's address or another care setting. Name the destination in the request, and Zenward will review it with you.",
      },
      { type: "h2", id: "short-notice", text: "7. If discharge happens sooner than expected" },
      { type: "p", text: `${factAnswer("advanceNotice")} ${factAnswer("sameDay")}` },
      {
        type: "p",
        text: `If the discharge time changes after you've sent the request, call ${business.phoneDisplay} as soon as you know. A changed time is confirmed by our team, not assumed.`,
      },
      { type: "h2", id: "how-zenward-handles-it", text: "8. How Zenward handles a discharge request" },
      {
        type: "list",
        ordered: true,
        items: [
          `Send the request online or call ${business.phoneDisplay}.`,
          QUOTE_RESPONSE_LINE,
          "Availability is confirmed trip by trip. Our team reviews the pickup location, destination, mobility needs and requested time for each request.",
          "Zenward confirms availability, details and pricing with you. A request isn't a confirmed ride until Zenward confirms it.",
        ],
      },
      { type: "p", text: `Zenward is a private-pay service. It doesn't bill Medicaid, Medicare or insurance. ${CONFIRMED.pricing}` },
      { type: "actions", requestLabel: "Request a Quote", callLabel: `Call ${business.phoneDisplay}` },
      {
        type: "note",
        text: "**If the passenger has Georgia Medicaid:** Georgia Medicaid provides non-emergency transportation for eligible members who have no other way to get to covered medical care, arranged through the transportation broker that serves the county where the member lives. The care team can help. This is a separate state program: Zenward is a private-pay service and doesn't provide Medicaid-covered rides.",
      },
      { type: "h2", id: "common-questions", text: "Common questions" },
      {
        type: "faq",
        items: [
          {
            question: "Can I arrange a ride home for a parent who is in the hospital?",
            answer: "Yes. A family member, caregiver, or healthcare provider or facility staff can make the request. Zenward follows up with the person who made it.",
          },
          {
            question: "Can the ride go to a rehab facility or a relative's home instead?",
            answer: "Yes. Give the destination in the request, and Zenward reviews it and confirms availability with you.",
          },
          {
            question: "What if the patient had a procedure or sedation?",
            answer:
              "Check the facility's discharge requirements with the care team before you arrange transportation. Include any travel restrictions in your request.",
          },
          {
            question: "Does Zenward provide ambulance or stretcher transport?",
            answer:
              "No. Zenward provides non-emergency medical transportation only. If a patient needs ambulance or stretcher transport, that must be arranged separately.",
          },
        ],
      },
      { type: "note", text: EMERGENCY_NOTE },
    ],
    bridge: {
      heading: "Need a planned ride home from the hospital?",
      text: "Send the discharge details and Zenward will review the trip, confirm timing with you and let you know what can be arranged.",
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
