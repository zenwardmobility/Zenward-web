/**
 * Content for the seven service pages (ZW-WEB-03A; wheelchair added in
 * ZW-WEB-03B2; restructured in ZW-WEB-04C). One typed config per approved
 * service, rendered by `ServicePage`. `/services`, the homepage, the service
 * pages, the sitemap and cross-links all read the same slugs, labels and
 * summaries from here.
 *
 * IDENTITY: slug, path, label, intake state, quote link and related services
 * come from src/lib/service-catalog.ts. Live services take their label from
 * `SERVICE_TYPE_LABELS` (the same source as the request-form options);
 * any contract-pending service would take its label from
 * `CONTRACT_PENDING_SERVICE_LABELS` (none today; Airport Transportation went
 * live in ZW-WEB-04C2). Internal/wire values are unchanged.
 *
 * MARKET: copy here is market-free. Pages add the market from
 * src/lib/service-area.ts.
 *
 * CLAIM DISCIPLINE (docs/product/marketing-scope.md): copy here describes only
 * what Zenward does today — non-emergency transportation, reviewed by a person,
 * confirmed by Zenward after the request. Wheelchair-accessible transportation
 * is an owner-confirmed service; nothing here may extend it (or any service)
 * to stretcher, ambulance, emergency response, medical monitoring or clinical
 * care, oxygen administration, transfer/lifting assistance, door-through-door
 * assistance, vehicle/securement specifications, chair size or weight limits,
 * Medicaid/insurance, certification (incl. ADA), same-day availability,
 * guaranteed punctuality, pricing, or automatic scheduling. Owner-confirmed
 * trust facts (licensed & insured, on-time standard, trained & vetted
 * drivers, 2-hour response) are stated only via src/lib/trust.ts (ZW-WEB-04F).
 */
import type { Icon } from "@phosphor-icons/react";
import {
  Stethoscope,
  Heartbeat,
  FirstAidKit,
  Hospital,
  CalendarCheck,
  HandHeart,
  MapPin,
  Clock,
  ArrowUUpLeft,
  UsersThree,
  ArrowsClockwise,
  ClipboardText,
  ChatCircleText,
  Repeat,
  Wheelchair,
  AirplaneTilt,
} from "@phosphor-icons/react/dist/ssr";
import type { FaqItem } from "@/components/public/FaqAccordion";
import { business } from "@/lib/business";
import { brandImages, type BrandImageAsset } from "@/lib/images";
import { SERVICE_CATALOG, SERVICE_ORDER as CATALOG_ORDER, SERVICE_PATHS as CATALOG_PATHS, type CatalogEntry, type ServiceSlug } from "@/lib/service-catalog";

const PHONE = business.phoneDisplay;

export type ServiceSectionKey = "audience" | "coordinate" | "expect" | "considerations" | "scenarios";

export type { ServiceSlug };

/**
 * Identity fields (slug, path, label, intake, requestHref, related) come from
 * the catalogue (src/lib/service-catalog.ts); the rest is page content.
 */
export interface ServiceContent extends CatalogEntry {
  /** One sentence used on the homepage, /services and related-service links. */
  summary: string;
  /** Meta description stem; the page appends the market sentence. */
  metaDescription: string;
  icon: Icon;
  /** Approved photograph for this page (existing repository imagery only). */
  image: { asset: BrandImageAsset; objectPosition: string };
  /** Hero intro, kept short so the CTAs land early on phones. */
  lede: string;
  /** "A good fit for" items, shown with the audience and on /services. */
  fit: string[];
  audience: { heading: string; intro: string; points: string[] };
  coordinate: { heading: string; items: { icon: Icon; title: string; description: string }[] };
  expect: { heading: string; intro: string; steps: { title: string; description: string }[] };
  /** Service-specific things to know before requesting. */
  considerations: { heading: string; items: { title: string; description: string }[] };
  scenarios: { heading: string; items: { title: string; description: string }[] };
  faq: FaqItem[];
  ctaHeading: string;
  ctaBody: string;
  /** Section order between the practical facts and the FAQ. Restrained variation between pages. */
  order: ServiceSectionKey[];
  /** Hero eyebrow; defaults to "Non-Emergency Medical Transportation". */
  heroEyebrow?: string;
  /** Shown under the hero CTAs (used while a service is contract-pending). */
  intakeNote?: string;
  /** Closing-panel note; defaults to the non-emergency / 911 note. */
  closingNote?: string;
}

/** The four request steps, worded per service where it matters. */
const steps = (first: string, last: string) => [
  { title: "Request a quote", description: first },
  { title: "Zenward reviews it", description: "A member of our team reviews the trip details and any notes you added." },
  { title: "We contact you", description: "We reach out to the person who made the request with any questions and to talk through the trip." },
  { title: "We confirm the details", description: last },
];

const NOT_A_BOOKING = "Submitting a request is not a confirmed booking.";

export const SERVICES: Record<ServiceSlug, ServiceContent> = {
  "medical-appointments": {
    ...SERVICE_CATALOG["medical-appointments"],
    summary: "Rides to doctor visits, specialist and outpatient appointments, and diagnostic visits.",
    metaDescription:
      "Non-emergency transportation to doctor visits, specialist and outpatient appointments, and diagnostic visits. Request a quote and Zenward will review your trip and contact you.",
    icon: Stethoscope,
    image: { asset: brandImages.vanWalkerAssist, objectPosition: "70% 55%" },
    lede: "Non-emergency transportation to scheduled medical appointments, planned around your appointment time, from request to arrival.",
    fit: ["Doctor and specialist visits", "Outpatient appointments", "Diagnostic and imaging visits", "Follow-up appointments"],
    audience: {
      heading: "Who this transportation is for",
      intro: "Anyone with a scheduled medical appointment who needs a dependable way to get there and, if needed, back.",
      points: [
        "Adults who don't drive, or prefer not to drive to a medical visit",
        "Family members arranging a trip for a parent, spouse or relative",
        "Caregivers keeping track of appointments for someone else",
        "People whose usual ride isn't available for a particular visit",
      ],
    },
    coordinate: {
      heading: "What Zenward helps coordinate",
      items: [
        { icon: MapPin, title: "Pickup and destination", description: "Where the passenger is starting from, and the office, clinic or facility they're going to." },
        { icon: Clock, title: "Timing around the appointment", description: "Your preferred date and time, so the trip is planned around when the appointment is." },
        { icon: ArrowUUpLeft, title: "A return trip", description: "If the passenger needs a ride back, say so in the request and it's reviewed with the rest of the trip." },
        { icon: ChatCircleText, title: "Who we follow up with", description: "The passenger, a family member or a caregiver can make the request. Zenward contacts them directly." },
      ],
    },
    expect: {
      heading: "How the request works",
      intro: `${NOT_A_BOOKING} Here is how it works from your side.`,
      steps: steps(
        "Share the passenger, pickup, destination and appointment date and time, online or by phone.",
        "The trip is confirmed only once Zenward confirms availability, details and pricing with you.",
      ),
    },
    considerations: {
      heading: "Helpful to know",
      items: [
        { title: "Include the facility name", description: "A clinic or building name, plus a suite or department if you know it, helps us plan the trip." },
        { title: "Return timing can vary", description: "Appointments sometimes run long. Tell us whether you need a ride back, and we'll talk through return timing." },
        { title: "Regular visits", description: "If the appointment repeats, choose Recurring on the request form so we can look at the whole schedule." },
      ],
    },
    scenarios: {
      heading: "Trips people request",
      items: [
        { title: "A routine checkup", description: "A parent has a regular appointment and the family can't take time off to drive." },
        { title: "A new specialist", description: "An appointment somewhere unfamiliar, where the passenger wants a clear plan for getting there and back." },
        { title: "A diagnostic visit", description: "A scan or test booked weeks out, when the usual ride isn't available." },
      ],
    },
    faq: [
      {
        question: "What kinds of appointments can I request transportation to?",
        answer:
          "Scheduled, non-emergency medical care: doctor and specialist visits, outpatient appointments, diagnostic or imaging visits and follow-ups. If you're not sure your trip fits, call us.",
      },
      {
        question: "Can I ask for a ride home after the appointment?",
        answer:
          "Yes. The form asks whether a return trip is needed. Zenward reviews it with the rest of the request and talks through return timing when we contact you.",
      },
      {
        question: "Can someone else book the ride for me?",
        answer:
          "Yes. A family member or caregiver can make the request. The form asks for their relationship to the passenger, and Zenward follows up with them.",
      },
      {
        question: "Does Zenward provide medical care during the trip?",
        answer: "No. Zenward provides non-emergency transportation only. It does not provide medical treatment or care.",
      },
      {
        question: "Is my ride confirmed when I submit the form?",
        answer: `No. Zenward reviews your request and contacts you, and the trip is confirmed only once we've confirmed availability and details. Prefer to talk it through? Call ${PHONE}.`,
      },
    ],
    ctaHeading: "Need a ride to an appointment?",
    ctaBody: "Send the trip details and Zenward will review your request and contact you.",
    order: ["audience", "coordinate", "expect", "considerations", "scenarios"],
  },

  "dialysis-transportation": {
    ...SERVICE_CATALOG["dialysis-transportation"],
    summary: "Transportation coordinated around repeating dialysis treatment schedules, there and back.",
    metaDescription:
      "Non-emergency transportation coordinated around dialysis treatment schedules, including return trips. Describe your schedule and Zenward will review it with you.",
    icon: Heartbeat,
    image: { asset: brandImages.vanWalkerAssist, objectPosition: "82% 55%" },
    lede: "Dialysis means getting to the same place again and again. Tell us your treatment schedule and we'll review it and confirm what we can arrange.",
    fit: ["Repeating treatment schedules", "Outbound and return trips", "Family and caregiver coordination"],
    audience: {
      heading: "Who this is for",
      intro: "People who travel to dialysis on a repeating schedule, and the family and caregivers who help them get there.",
      points: [
        "Patients who can't drive to treatment, or need a dependable alternative",
        "Family members and caregivers coordinating trips on someone's behalf",
        "Anyone whose usual ride to treatment has fallen through",
      ],
    },
    coordinate: {
      heading: "What Zenward helps coordinate",
      items: [
        { icon: Repeat, title: "Your treatment schedule", description: "The days and times you're expected, so Zenward looks at the pattern and not only one trip." },
        { icon: Clock, title: "Getting there on time for treatment", description: "When you need to arrive, planned around your treatment time." },
        { icon: ArrowUUpLeft, title: "The trip home", description: "Return-trip requests, with timing talked through because treatment end times can vary." },
        { icon: ArrowsClockwise, title: "Changes to the schedule", description: "If treatment days or times change, let Zenward know and we'll talk through what it means for your trips." },
      ],
    },
    expect: {
      heading: "How the request works",
      intro: `The goal is to reduce how often you arrange each trip from scratch. ${NOT_A_BOOKING}`,
      steps: steps(
        "On the request form, choose Recurring and give the days of the week, start date and appointment time.",
        "Zenward confirms what it can arrange, the details and pricing. Until then, the request is not a booking.",
      ),
    },
    considerations: {
      heading: "Things to know about dialysis trips",
      items: [
        { title: "Return timing is talked through", description: "Treatment end times can vary, so Zenward discusses return-trip timing with you rather than assuming a fixed pickup." },
        { title: "Schedules are reviewed, not automatic", description: "The form records the schedule you'd like. It doesn't set up trips automatically; Zenward confirms the arrangement with you." },
        { title: "Mobility needs", description: "If the passenger uses a wheelchair or needs assistance, describe it in the request so it's part of the review." },
      ],
    },
    scenarios: {
      heading: "Situations we hear about",
      items: [
        { title: "Treatment several days a week", description: "Same pickup, same treatment center, repeating days, described once in one request." },
        { title: "A family member coordinating", description: "A daughter arranges trips for a parent who can't drive to treatment. She makes the request, and Zenward follows up with her." },
        { title: "A regular ride becomes unavailable", description: "A relative who usually drives can't for a while, and the passenger needs another way to get to treatment." },
      ],
    },
    faq: [
      {
        question: "Can I request transportation for my whole dialysis schedule?",
        answer:
          "Yes. Choose Recurring on the request form and tell us the days, start date and appointment time. Zenward reviews the schedule and confirms with you what it can arrange.",
      },
      {
        question: "What about the ride home after treatment?",
        answer:
          "Tell us on the request that a return trip is needed. Treatment end times can vary, so Zenward talks through return-trip timing with you when we follow up.",
      },
      {
        question: "Will my trips be scheduled automatically after I submit once?",
        answer:
          "No. Submitting a request is not a confirmed booking, and the form doesn't create repeat trips on its own. Zenward contacts you to talk through the schedule and confirm next steps.",
      },
      {
        question: "What if my treatment days change?",
        answer: `Let Zenward know as soon as you can by calling ${PHONE}. Changes are confirmed with our team, not assumed.`,
      },
      {
        question: "Does Zenward provide care during the trip?",
        answer: "No. Zenward provides non-emergency transportation only. It does not provide medical monitoring or care.",
      },
    ],
    ctaHeading: "Request transportation for treatment",
    ctaBody: "Describe your treatment schedule. Zenward will review it and contact you.",
    order: ["coordinate", "considerations", "audience", "expect", "scenarios"],
  },

  "rehabilitation-transportation": {
    ...SERVICE_CATALOG["rehabilitation-transportation"],
    summary: "Rides to physical therapy, occupational therapy and other rehabilitation appointments.",
    metaDescription:
      "Non-emergency transportation to physical therapy, occupational therapy and rehabilitation appointments, including a series of visits. Request a quote and Zenward will contact you.",
    icon: FirstAidKit,
    image: { asset: brandImages.staffWalkingAssist, objectPosition: "center 38%" },
    lede: "Rehabilitation often means a series of visits over weeks. Zenward coordinates non-emergency transportation to them, so getting there is one less thing to plan.",
    fit: ["Physical therapy", "Occupational therapy", "Other rehabilitation appointments", "A series of scheduled visits"],
    audience: {
      heading: "Who this transportation is for",
      intro: "People with scheduled rehabilitation or therapy visits who need a ride, and the family and caregivers who arrange it.",
      points: [
        "People who can't drive right now and have a series of visits ahead",
        "Family members who can't take time off for every appointment",
        "Caregivers looking for a regular way to get someone to therapy",
      ],
    },
    coordinate: {
      heading: "What Zenward helps coordinate",
      items: [
        { icon: Clock, title: "Appointment day and time", description: "Your preferred date and time, planned around when the visit is scheduled." },
        { icon: MapPin, title: "Pickup and clinic", description: "Where the passenger is starting from and the therapy or rehabilitation location." },
        { icon: ArrowUUpLeft, title: "A return trip", description: "If a ride back is needed, note it in the request so it's reviewed with the rest of the trip." },
        { icon: Repeat, title: "A series of visits", description: "Choose Recurring on the request form and Zenward looks at the whole schedule with you." },
      ],
    },
    expect: {
      heading: "How the request works",
      intro: `Zenward coordinates the transportation. ${NOT_A_BOOKING}`,
      steps: steps(
        "Give us the passenger, pickup, therapy location, and the date and time of the visit or visits.",
        "Availability, details and pricing are confirmed by Zenward before the trip is treated as arranged.",
      ),
    },
    considerations: {
      heading: "Helpful to know",
      items: [
        { title: "Describe mobility needs", description: "Use the optional assistance field to tell us about mobility needs. Zenward reviews it and confirms what it can accommodate." },
        { title: "Visits that repeat", description: "Therapy plans often run for weeks. Describing the full schedule up front helps us review it as one arrangement." },
        { title: "Plans change", description: "If your therapy schedule changes, call us so we can talk through what it means for your trips." },
      ],
    },
    scenarios: {
      heading: "Trips people request",
      items: [
        { title: "A series of therapy visits", description: "Several appointments over the coming weeks, all to the same clinic." },
        { title: "Not able to drive for a while", description: "Someone who usually drives needs help getting to appointments during recovery." },
        { title: "A caregiver with a full schedule", description: "A family member can't drive to every visit and needs another way for the passenger to get there." },
      ],
    },
    faq: [
      {
        question: "What kinds of therapy visits does this cover?",
        answer:
          "Transportation to scheduled physical therapy, occupational therapy and other rehabilitation appointments. Zenward provides the transportation, not the therapy.",
      },
      {
        question: "Can I request trips for a series of visits?",
        answer:
          "Yes. Choose Recurring on the request form and tell us the days and dates. Zenward reviews the schedule and confirms with you what it can arrange.",
      },
      {
        question: "What if the passenger has mobility or assistance needs?",
        answer:
          "Describe them in the optional assistance field. Zenward reviews the request and confirms what it can accommodate when we contact you.",
      },
      {
        question: "Is my ride confirmed when I submit the form?",
        answer: "No. Zenward reviews your request, contacts you, and confirms availability and details. Until then it is not a booking.",
      },
    ],
    ctaHeading: "Need a ride to therapy?",
    ctaBody: "Tell us about the visit or visits, and Zenward will review your request and contact you.",
    order: ["audience", "coordinate", "considerations", "expect", "scenarios"],
  },

  "hospital-discharge-transportation": {
    ...SERVICE_CATALOG["hospital-discharge-transportation"],
    summary: "Planned, non-emergency transportation from the hospital to the passenger's next destination.",
    metaDescription:
      "Planned non-emergency transportation after a hospital stay, coordinated with the passenger, family, caregivers or the care team. Request a quote for the trip to the next destination.",
    icon: Hospital,
    image: { asset: brandImages.staffWalkingAssist, objectPosition: "60% 38%" },
    lede: "When a hospital stay ends, the trip to the next place shouldn't be left to the last minute. Zenward coordinates non-emergency transportation with families, caregivers and care teams.",
    fit: ["A planned discharge", "Family, caregiver or care-team coordination", "Home or another destination"],
    audience: {
      heading: "Who this is for",
      intro: "Patients leaving the hospital, and the people arranging their transportation.",
      points: [
        "Families and caregivers planning the trip after a discharge",
        "Hospital case managers and discharge planners arranging transportation for a patient",
        "Patients who need a planned ride to their next destination",
      ],
    },
    coordinate: {
      heading: "What Zenward helps coordinate",
      items: [
        { icon: MapPin, title: "The next destination", description: "Home, a relative's address or another care setting. Tell us where, and Zenward reviews the trip." },
        { icon: Clock, title: "Discharge timing", description: "Share the expected date and time. Discharge timing can shift, so let us know if it changes." },
        { icon: UsersThree, title: "Who is arranging it", description: "A family member, caregiver or care-team member can make the request, so we have one contact to follow up with." },
        { icon: ClipboardText, title: "Pickup details", description: "The hospital name and, if you know it, where the passenger will be picked up." },
      ],
    },
    expect: {
      heading: "How the request works",
      intro: `Discharge plans can move quickly, so send the request as early as you can. ${NOT_A_BOOKING}`,
      steps: steps(
        "Send the hospital, the passenger's next destination and the expected date and time.",
        "Zenward confirms availability, details and pricing before the trip is considered arranged.",
      ),
    },
    considerations: {
      heading: "Before you request",
      items: [
        { title: "Non-emergency only", description: "If the care team says the patient needs ambulance or stretcher transport, that has to be arranged separately. Zenward doesn't provide it." },
        { title: "Wheelchair-accessible trips", description: "If the passenger uses a wheelchair, say so in the request. Zenward offers wheelchair-accessible transportation and reviews the details with you." },
        { title: "Timing changes", description: `Discharge times often shift. Call ${PHONE} as soon as you know, and we'll talk it through.` },
      ],
    },
    scenarios: {
      heading: "Situations we coordinate",
      items: [
        { title: "A family arranging the trip", description: "A daughter learns her father will be discharged later this week and needs a plan for getting him to where he'll be staying." },
        { title: "A discharge team arranging for a patient", description: "A case manager wants transportation coordinated so the ride isn't what holds up the discharge." },
        { title: "Going somewhere other than home", description: "The passenger is moving to another care setting or a relative's address, and the request names that destination." },
      ],
    },
    faq: [
      {
        question: "Who can request discharge transportation?",
        answer:
          "The passenger, a family member, a caregiver or a member of the care team. The form asks for your relationship to the passenger so Zenward knows who to follow up with.",
      },
      {
        question: "Does the trip have to end at the passenger's home?",
        answer: "No. Give us the passenger's next destination in the request, and Zenward reviews it and confirms availability with you.",
      },
      {
        question: "Can Zenward arrange ambulance or stretcher transportation?",
        answer:
          "No. Zenward provides non-emergency medical transportation only. If a patient needs ambulance or stretcher transport, that must be arranged separately.",
      },
      {
        question: "What if the discharge time changes?",
        answer: `Tell Zenward as soon as you know by calling ${PHONE}. A changed time is confirmed by our team, not assumed.`,
      },
    ],
    ctaHeading: "Planning a discharge trip?",
    ctaBody: "Send the discharge details and Zenward will review your request and contact you.",
    order: ["audience", "expect", "considerations", "coordinate", "scenarios"],
  },

  "recurring-care-transportation": {
    ...SERVICE_CATALOG["recurring-care-transportation"],
    summary: "One request for appointments that repeat, such as dialysis, therapy or ongoing care.",
    metaDescription:
      "Regular non-emergency transportation for repeating appointments such as dialysis, therapy and ongoing care. Describe your schedule and Zenward will review and confirm it with you.",
    icon: CalendarCheck,
    image: { asset: brandImages.staffWalkingAssist, objectPosition: "35% 38%" },
    lede: "For appointments that repeat, describe the schedule once. Zenward reviews it with you and confirms a regular arrangement, so you aren't starting over with every trip.",
    fit: ["Dialysis", "Physical and occupational therapy", "Other appointments on a routine"],
    audience: {
      heading: "Who this is for",
      intro: "People whose care means the same trip again and again, and those who help them get there.",
      points: [
        "Patients with ongoing treatment or therapy appointments",
        "Family members and caregivers who manage a regular schedule",
        "People who want one conversation about their schedule instead of arranging each trip separately",
      ],
    },
    coordinate: {
      heading: "What Zenward helps coordinate",
      items: [
        { icon: Repeat, title: "The pattern", description: "Which days and times you travel, when it starts, and an end date if you know it." },
        { icon: MapPin, title: "The same pickup and destination", description: "Where the passenger is picked up and where they're going, described once." },
        { icon: ArrowUUpLeft, title: "Return trips", description: "Whether the passenger needs a ride back each time." },
        { icon: ArrowsClockwise, title: "Changes along the way", description: "If days or times change, or visits pause, tell Zenward and we'll talk through what it means." },
      ],
    },
    expect: {
      heading: "How a regular arrangement starts",
      intro: "The request form records the schedule you'd like. A request is not a booking, and it doesn't set up trips automatically.",
      steps: steps(
        "On the request form, choose Recurring, then the days of the week, start date and appointment time.",
        "Zenward confirms what it can arrange, the details and pricing. Until then, nothing is confirmed.",
      ),
    },
    considerations: {
      heading: "How recurring requests are handled",
      items: [
        { title: "Reviewed and confirmed", description: "Every recurring request is reviewed by a person, and the arrangement is confirmed with you. Nothing repeats automatically." },
        { title: "Not open-ended", description: "Give a start date and, if you know it, an end date. Longer arrangements are talked through with you." },
        { title: "Changes need a call", description: `If the schedule changes, call ${PHONE}. Changes are confirmed with our team, not assumed.` },
      ],
    },
    scenarios: {
      heading: "Common recurring needs",
      items: [
        { title: "Dialysis", description: "Repeating treatment days, with timing built around treatment." },
        { title: "Rehabilitation", description: "A series of therapy visits over several weeks." },
        { title: "Other ongoing care", description: "Regular specialist visits or another scheduled treatment that brings you to the same place on a routine." },
      ],
    },
    faq: [
      {
        question: "What counts as recurring care transportation?",
        answer:
          "Trips to appointments that repeat on a schedule, such as dialysis, therapy or other ongoing care. Describe your schedule and Zenward reviews it with you.",
      },
      {
        question: "How do I request a recurring schedule?",
        answer:
          "Choose Recurring as the trip frequency on the request form, pick the days of the week and a start date, and add an end date and appointment time if you know them.",
      },
      {
        question: "Will trips be booked automatically?",
        answer:
          "No. Every recurring request is reviewed by our team, and Zenward confirms what it can arrange with you. The form doesn't create trips on its own.",
      },
      {
        question: "Can a family member arrange recurring trips for someone else?",
        answer: "Yes. The form asks for your relationship to the passenger, and Zenward follows up with you.",
      },
    ],
    ctaHeading: "Start a regular transportation arrangement",
    ctaBody: "Describe your schedule. Zenward will review it and contact you.",
    order: ["audience", "considerations", "coordinate", "scenarios", "expect"],
  },

  "senior-medical-transportation": {
    ...SERVICE_CATALOG["senior-medical-transportation"],
    summary: "Transportation for older adults going to scheduled medical care, arranged with family or caregivers.",
    metaDescription:
      "Non-emergency transportation for older adults travelling to scheduled medical care, arranged directly or with family members and caregivers. Request a quote and Zenward will contact you.",
    icon: HandHeart,
    image: { asset: brandImages.vanWalkerAssist, objectPosition: "72% 55%" },
    lede: "Non-emergency transportation for older adults travelling to scheduled medical care, with clear communication for the passenger and anyone helping to arrange it.",
    fit: ["Older adults going to scheduled care", "Family and caregiver involvement", "One-time or regular appointments"],
    audience: {
      heading: "Who this transportation is for",
      intro: "Older adults with scheduled medical care, and the family and caregivers who arrange trips with them.",
      points: [
        "Older adults who no longer drive, or would rather not drive to appointments",
        "Adult children arranging rides for a parent",
        "Caregivers managing several appointments for someone",
        "Senior care organizations arranging trips for the people they support",
      ],
    },
    coordinate: {
      heading: "What Zenward helps coordinate",
      items: [
        { icon: UsersThree, title: "The requester and the passenger", description: "They can be different people. Give both names, and Zenward follows up with the requester." },
        { icon: Clock, title: "The appointment", description: "Pickup, destination and your preferred date and time." },
        { icon: ArrowUUpLeft, title: "A return trip", description: "If the passenger needs a ride back, say so in the request." },
        { icon: ChatCircleText, title: "Mobility or assistance notes", description: "An optional field for anything Zenward should know. We review it and confirm what we can accommodate." },
      ],
    },
    expect: {
      heading: "How the request works",
      intro: `${NOT_A_BOOKING} Zenward contacts the requester to talk it through.`,
      steps: steps(
        "For yourself, a parent, a spouse or someone you care for, online or by phone.",
        "The trip is confirmed once Zenward confirms availability, details and pricing with you.",
      ),
    },
    considerations: {
      heading: "Helpful to know",
      items: [
        { title: "Transportation only", description: "Zenward provides non-emergency transportation. It doesn't provide home care, companion care or nursing services." },
        { title: "Who we talk to", description: "If you're arranging the trip for someone else, Zenward follows up with you. Tell us if the passenger should be contacted directly too." },
        { title: "Mobility needs", description: "If the passenger uses a walker or wheelchair, mention it in the request so it's part of the review." },
      ],
    },
    scenarios: {
      heading: "Trips people request",
      items: [
        { title: "An adult child arranging for a parent", description: "A son lives far from his mother and wants to arrange her ride to a specialist visit himself." },
        { title: "Regular appointments", description: "A caregiver manages a run of visits and wants to set up a regular arrangement." },
        { title: "After a hospital stay", description: "An older adult is leaving the hospital and needs planned transportation to their next destination." },
      ],
    },
    faq: [
      {
        question: "Can my adult child or caregiver arrange the ride for me?",
        answer: "Yes. The form asks for the requester's relationship to the passenger, and Zenward follows up with the requester.",
      },
      {
        question: "Can I tell Zenward about mobility or assistance needs?",
        answer:
          "Yes. Use the optional assistance field on the request. Zenward reviews it and confirms what it can accommodate when we contact you, so please don't assume a particular level of assistance before then.",
      },
      {
        question: "Does Zenward provide care at home or during the visit?",
        answer: "No. Zenward provides non-emergency transportation only, not home care, companion care or nursing services.",
      },
      {
        question: "Can I arrange regular trips to appointments?",
        answer: "Yes. Choose Recurring on the request form and tell us the days and dates. Zenward reviews the schedule and confirms with you what it can arrange.",
      },
    ],
    ctaHeading: "Arranging a ride for an older adult?",
    ctaBody: "Send the details and Zenward will review your request and contact you.",
    order: ["audience", "coordinate", "considerations", "expect", "scenarios"],
  },

  "wheelchair-transportation": {
    ...SERVICE_CATALOG["wheelchair-transportation"],
    summary: "Wheelchair-accessible transportation for scheduled, non-emergency medical trips.",
    metaDescription:
      "Zenward offers wheelchair-accessible transportation for scheduled, non-emergency medical trips. Share the passenger's mobility details and Zenward will review the trip and contact you.",
    icon: Wheelchair,
    image: { asset: brandImages.heroDesktop, objectPosition: "72% 45%" },
    lede: "Zenward offers wheelchair-accessible transportation for scheduled, non-emergency medical trips. Tell us about the passenger's mobility needs and we'll review the trip and confirm the arrangement with you.",
    fit: ["Passengers who use a wheelchair", "Scheduled, non-emergency medical trips", "One-time or recurring appointments"],
    audience: {
      heading: "Who this transportation is for",
      intro: "Passengers who use a wheelchair and have scheduled, non-emergency medical care to get to, and the people who arrange the trip with them.",
      points: [
        "Passengers who use a wheelchair to get to appointments, treatment or therapy",
        "Family members and caregivers arranging a trip for someone who uses a wheelchair",
        "Care coordinators and facility staff arranging transportation for a patient",
        "Passengers leaving the hospital who need planned transportation to their next destination",
      ],
    },
    coordinate: {
      heading: "What Zenward helps coordinate",
      items: [
        { icon: ChatCircleText, title: "The passenger's mobility details", description: "What the passenger needs for the trip, described in the request so our team can review it before anything is confirmed." },
        { icon: MapPin, title: "Pickup and destination", description: "Where the passenger is starting from, and the clinic, treatment center or other address they're going to." },
        { icon: Clock, title: "Timing and the return trip", description: "Your preferred date and time, planned around the appointment, and whether a ride back is needed." },
        { icon: UsersThree, title: "Who is arranging it", description: "The passenger, a family member, a caregiver or a care coordinator can make the request. Zenward follows up with them." },
      ],
    },
    expect: {
      heading: "How the request works",
      intro: `${NOT_A_BOOKING} Zenward reviews it and confirms the arrangement with you.`,
      steps: steps(
        "Choose Wheelchair-Accessible Transportation, add the trip details and describe the passenger's mobility needs.",
        "The trip is confirmed only once Zenward confirms availability, the arrangement and pricing with you.",
      ),
    },
    considerations: {
      heading: "Before you request",
      items: [
        { title: "Describe the passenger's mobility needs", description: "The more you tell us about the passenger's wheelchair and mobility needs, the better our team can review the trip before confirming it." },
        { title: "Confirmed during review", description: "Zenward confirms the transportation arrangement for each trip when we contact you, rather than assuming it from the form." },
        { title: "Not stretcher or ambulance transport", description: "Zenward provides wheelchair-accessible transportation for non-emergency trips, not stretcher or ambulance transport, which must be arranged separately. In an emergency, call 911." },
      ],
    },
    scenarios: {
      heading: "Trips people request",
      items: [
        { title: "A medical appointment", description: "A passenger who uses a wheelchair has a specialist visit and needs a planned round trip." },
        { title: "Recurring treatment or therapy", description: "Dialysis or rehabilitation visits on a repeating schedule, described once in the request." },
        { title: "After a hospital stay", description: "A family plans transportation for a passenger who uses a wheelchair to their next destination." },
      ],
    },
    faq: [
      {
        question: "Does Zenward offer wheelchair-accessible transportation?",
        answer:
          "Yes. Zenward offers wheelchair-accessible transportation for scheduled, non-emergency medical trips. Describe the passenger's mobility needs when you request a quote, and our team will review the trip and confirm the arrangement with you.",
      },
      {
        question: "What should I tell you about the passenger's wheelchair?",
        answer:
          "Anything that helps us plan the trip, such as the type of wheelchair and any mobility or assistance needs. Zenward reviews it and confirms what it can accommodate when we contact you.",
      },
      {
        question: "Can I request recurring wheelchair-accessible transportation?",
        answer:
          "Yes. Choose Recurring on the request form and tell us the days, start date and appointment time. Zenward reviews the schedule and confirms with you what it can arrange.",
      },
      {
        question: "Can a family member or care coordinator make the request?",
        answer: `Yes. They can use the request form or call ${PHONE}. Zenward follows up with the person who made the request.`,
      },
      {
        question: "Is this ambulance or stretcher transportation?",
        answer:
          "No. Zenward provides non-emergency medical transportation only. It does not provide ambulance, stretcher or emergency transportation, or medical care during the trip. In a medical emergency, call 911.",
      },
    ],
    ctaHeading: "Need wheelchair-accessible transportation?",
    ctaBody: "Send the trip and mobility details, and Zenward will review your request and contact you.",
    order: ["audience", "considerations", "expect", "coordinate", "scenarios"],
  },

  "airport-transportation": {
    ...SERVICE_CATALOG["airport-transportation"],
    summary: "Pre-arranged rides to and from the airport, coordinated in advance.",
    metaDescription:
      "Pre-arranged transportation to and from the airport for older adults, family-arranged travel and passengers with mobility considerations. Request a quote and Zenward will review your trip and contact you.",
    icon: AirplaneTilt,
    image: { asset: brandImages.vanWalkerAssist, objectPosition: "62% 55%" },
    heroEyebrow: "Pre-Arranged Transportation",
    lede: "Pre-arranged transportation to and from the airport for passengers who want a more coordinated ride, including older adults, family-arranged travel and passengers with mobility considerations.",
    closingNote: "Zenward does not provide emergency transportation. In a medical emergency, call 911.",
    fit: ["Rides to or from the airport", "Older adults and family-arranged travel", "Passengers with mobility considerations", "Travel for medical care"],
    audience: {
      heading: "Who airport transportation is for",
      intro: "Passengers who'd rather have a ride arranged in advance than find one on the day, and the people who plan travel with them.",
      points: [
        "Older adults travelling to or from the airport",
        "Family members arranging an airport ride for a parent or relative",
        "Passengers with mobility considerations, including people who use a wheelchair",
        "Passengers travelling to or from medical care in another city",
        "Caregivers arranging transportation for someone in their care",
      ],
    },
    coordinate: {
      heading: "What Zenward helps coordinate",
      items: [
        { icon: MapPin, title: "Pickup and drop-off", description: "Where the passenger is starting from and where they're going, including which airport." },
        { icon: Clock, title: "Timing around the flight", description: "Your flight date and time, so the trip can be planned around it. Zenward doesn't track flights, so tell us if your flight changes." },
        { icon: ChatCircleText, title: "Mobility details", description: "Any mobility or assistance needs, described in the request so our team can review them before confirming." },
        { icon: UsersThree, title: "Who is arranging it", description: "The passenger, a family member or a caregiver can make the request. Zenward follows up with them." },
      ],
    },
    expect: {
      heading: "How the request works",
      intro: `${NOT_A_BOOKING} Zenward reviews it and confirms the details with you.`,
      steps: steps(
        "Share the passenger, pickup, destination and flight timing, online or by phone.",
        "The trip is confirmed only once Zenward confirms availability, details and pricing with you.",
      ),
    },
    considerations: {
      heading: "Before you request",
      items: [
        { title: "Request as early as practical", description: "Airport trips are reviewed like every request, and availability is confirmed after review, so the earlier we hear from you the better." },
        { title: "Tell us about changes", description: `Flights move. If your flight time changes, call ${PHONE} so we can talk through what it means for your ride.` },
        { title: "Pickup details are confirmed with you", description: "Where exactly the passenger will be picked up or dropped off is confirmed when we contact you, not assumed." },
      ],
    },
    scenarios: {
      heading: "Trips people request",
      items: [
        { title: "A parent flying home", description: "An adult child arranges a ride to the airport for a parent at the end of a visit." },
        { title: "Travel for treatment", description: "A passenger flies to see a specialist in another city and wants the ride to the airport arranged in advance." },
        { title: "Arriving home", description: "A caregiver arranges a ride home from the airport for someone who uses a wheelchair." },
      ],
    },
    faq: [
      {
        question: "Can I request transportation to or from the airport?",
        answer:
          "Yes. Zenward offers pre-arranged airport transportation. Share the trip and flight timing in your request, and our team will review it and contact you to confirm availability, details and pricing.",
      },
      {
        question: "Can a family member arrange an airport ride for someone else?",
        answer: "Yes. A family member or caregiver can make the request, and Zenward follows up with them.",
      },
      {
        question: "Can I request wheelchair-accessible airport transportation?",
        answer:
          "Yes. Describe the passenger's mobility needs in the request. Zenward offers wheelchair-accessible transportation and reviews the details with you before confirming.",
      },
      {
        question: "How far in advance should I request airport transportation?",
        answer: `As early as practical. Every request is reviewed, and Zenward confirms availability after review. If your trip is soon, call ${PHONE}.`,
      },
    ],
    ctaHeading: "Planning an airport trip?",
    ctaBody: "Send the trip details and Zenward will review your request and contact you.",
    order: ["audience", "coordinate", "considerations", "expect", "scenarios"],
  },
};

/** Stable display order and paths, from the catalogue. */
export const SERVICE_ORDER = CATALOG_ORDER;
export const SERVICE_PATHS = CATALOG_PATHS;
