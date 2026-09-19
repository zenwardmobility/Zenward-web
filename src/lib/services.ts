/**
 * Content for the dedicated service landing pages (ZW-WEB-03A). One typed
 * config per approved service, rendered by `ServicePage`. Kept in a single
 * module so `/services`, the landing pages, the sitemap and cross-links all
 * read the same slugs, titles and descriptions.
 *
 * CLAIM DISCIPLINE (docs/product/marketing-scope.md): copy here describes only
 * what Zenward does today — non-emergency transportation, reviewed by a person,
 * confirmed by Zenward after the request. It must not claim wheelchair,
 * stretcher, ambulance, oxygen, Medicaid/insurance, certification, licensing,
 * same-day availability, guaranteed punctuality, door-through-door assistance,
 * standing-order automation, or any geography.
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
} from "@phosphor-icons/react/dist/ssr";
import type { FaqItem } from "@/components/public/FaqAccordion";
import { business } from "@/lib/business";

const PHONE = business.phoneDisplay;

export type ServiceSectionKey = "audience" | "coordinate" | "expect" | "scenarios";

export interface ServiceLink {
  href: string;
  label: string;
  blurb: string;
}

export interface ServiceContent {
  slug: ServiceSlug;
  path: string;
  /** Card title on /services and label in cross-links. */
  cardTitle: string;
  /** Short card description on /services. */
  cardDescription: string;
  /** Bare page title — the root layout appends " | Zenward Mobility". */
  metaTitle: string;
  metaDescription: string;
  icon: Icon;
  eyebrow: string;
  h1: string;
  lede: string;
  glance: { heading: string; items: string[] };
  audience: { heading: string; intro: string; points: string[] };
  coordinate: { heading: string; items: { icon: Icon; title: string; description: string }[] };
  expect: { heading: string; intro: string; steps: { title: string; description: string }[] };
  scenarios: { heading: string; items: { title: string; description: string; link?: { href: string; label: string } }[] };
  faq: FaqItem[];
  /** At most two contextual links — not an SEO link grid. */
  related: ServiceLink[];
  ctaHeading: string;
  ctaBody: string;
  /** Section order between the hero and the FAQ. Restrained variation between pages. */
  order: ServiceSectionKey[];
}

export type ServiceSlug =
  | "medical-appointments"
  | "dialysis-transportation"
  | "rehabilitation-transportation"
  | "hospital-discharge-transportation"
  | "recurring-care-transportation"
  | "senior-medical-transportation";

const path = (slug: ServiceSlug) => `/services/${slug}` as const;

export const SERVICES: Record<ServiceSlug, ServiceContent> = {
  "medical-appointments": {
    slug: "medical-appointments",
    path: path("medical-appointments"),
    cardTitle: "Medical Appointments",
    cardDescription: "Routine checkups, specialist visits, and follow-up appointments, on schedule.",
    metaTitle: "Transportation to Medical Appointments",
    metaDescription:
      "Request non-emergency transportation to routine, specialist, and follow-up medical appointments. Zenward reviews each request and contacts you to confirm next steps.",
    icon: Stethoscope,
    eyebrow: "Medical Appointments",
    h1: "Transportation to your medical appointments",
    lede: "Request non-emergency transportation for routine visits, specialist appointments, and follow-ups. Zenward coordinates the trip around your appointment, from request to arrival.",
    glance: {
      heading: "A good fit for",
      items: ["Routine checkups", "Specialist visits", "Follow-up appointments", "Other scheduled medical care"],
    },
    audience: {
      heading: "Who this transportation is for",
      intro: "Anyone with a scheduled medical appointment who needs a dependable way to get there and, if needed, back.",
      points: [
        "Adults who don't drive, or prefer not to drive to a medical visit",
        "Family members arranging a trip for a parent, spouse, or relative",
        "Caregivers keeping track of appointments for someone else",
        "People whose usual ride isn't available for a particular visit",
      ],
    },
    coordinate: {
      heading: "What Zenward helps coordinate",
      items: [
        {
          icon: MapPin,
          title: "Pickup and destination",
          description: "Where the passenger is starting from, and the office, clinic, or facility they're going to.",
        },
        {
          icon: Clock,
          title: "Timing around the appointment",
          description: "Your preferred date and time, so the trip is planned around when the appointment is.",
        },
        {
          icon: ArrowUUpLeft,
          title: "A return trip",
          description: "If the passenger needs a ride back, say so in the request and it's reviewed with the rest of the trip.",
        },
        {
          icon: ChatCircleText,
          title: "Who we follow up with",
          description: "The passenger, a family member, or a caregiver can be the requester. Zenward contacts them directly.",
        },
      ],
    },
    expect: {
      heading: "What to expect",
      intro: "A request is not a confirmed ride. Here is how it works from your side.",
      steps: [
        { title: "Send a request", description: "Share the passenger, pickup, destination, and preferred date and time through the request form." },
        { title: "Zenward reviews it", description: "A member of the team looks over the trip details and any assistance notes you added." },
        { title: "Zenward contacts you", description: "We reach out to the requester with any questions and to talk through the trip." },
        { title: "Availability is confirmed", description: "The trip is confirmed only once Zenward confirms availability and next steps with you." },
      ],
    },
    scenarios: {
      heading: "Trips people request",
      items: [
        {
          title: "A routine checkup",
          description: "A parent has a regular appointment and the family can't take time off to drive.",
        },
        {
          title: "A new specialist visit",
          description: "An appointment somewhere unfamiliar, where the passenger wants a clear plan for getting there and back.",
        },
        {
          title: "A follow-up visit",
          description: "A follow-up booked a few weeks out, when the usual ride isn't available.",
        },
      ],
    },
    faq: [
      {
        question: "How do I request transportation for an appointment?",
        answer: `Use the Request Transportation form and include the passenger's name, pickup location, destination, and preferred date and time. If you'd rather talk it through, call ${PHONE}.`,
      },
      {
        question: "Does submitting a request confirm my ride?",
        answer:
          "No. A request tells Zenward what you need. Zenward reviews it and contacts you, and the trip is only confirmed once we've confirmed availability and next steps with you.",
      },
      {
        question: "Can a family member arrange transportation for someone else?",
        answer:
          "Yes. The form asks for your relationship to the passenger, so a family member or caregiver can request the trip and Zenward follows up with them.",
      },
      {
        question: "Can I ask for a return trip?",
        answer:
          "Yes. The form asks whether a return trip is needed. Zenward reviews it with the rest of the request and talks through the details when we contact you.",
      },
      {
        question: "Does Zenward provide medical care during the trip?",
        answer:
          "No. Zenward provides non-emergency transportation only. It does not provide medical treatment or care.",
      },
    ],
    related: [],
    ctaHeading: "Need a ride to an appointment?",
    ctaBody: "Send the details and Zenward will review your request and contact you.",
    order: ["audience", "coordinate", "expect", "scenarios"],
  },

  "dialysis-transportation": {
    slug: "dialysis-transportation",
    path: path("dialysis-transportation"),
    cardTitle: "Dialysis Visits",
    cardDescription: "Dependable, recurring transportation for ongoing dialysis treatment.",
    metaTitle: "Dialysis Transportation",
    metaDescription:
      "Non-emergency transportation coordinated around dialysis treatment schedules. Describe your repeating appointments and Zenward reviews and confirms what it can arrange.",
    icon: Heartbeat,
    eyebrow: "Dialysis Transportation",
    h1: "Transportation for dialysis treatment schedules",
    lede: "Dialysis means getting to the same place again and again. Tell Zenward the schedule you need and we'll review it, coordinate around your treatment times, and confirm what can be arranged.",
    glance: {
      heading: "Built around",
      items: ["Repeating treatment schedules", "Coordination around treatment times", "Fewer trips to arrange from scratch"],
    },
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
        {
          icon: Repeat,
          title: "Your treatment schedule",
          description: "The days and times you're expected, described in your request so Zenward looks at the pattern and not only one trip.",
        },
        {
          icon: Clock,
          title: "Timing around treatment",
          description: "When you need to arrive and when you'd like to be picked up afterwards. Treatment lengths can vary, so tell us what you know.",
        },
        {
          icon: MapPin,
          title: "A consistent pickup and destination",
          description: "The same pickup location and treatment center, described once in your request.",
        },
        {
          icon: ArrowsClockwise,
          title: "Changes to the schedule",
          description: "If treatment days or times change, let Zenward know and we'll talk through what it means for your trips.",
        },
      ],
    },
    expect: {
      heading: "What to expect",
      intro: "The goal is to reduce how often you have to arrange every trip from scratch. Nothing is confirmed until Zenward confirms it with you.",
      steps: [
        { title: "Describe the schedule", description: "Fill in the request form for the first trip, and describe the repeating days and times in the notes." },
        { title: "Zenward reviews it", description: "The team looks at the pattern, the pickup and destination, and any assistance notes." },
        { title: "Zenward contacts you", description: "We reach out to the requester to talk through the schedule and ask about return-trip timing." },
        { title: "The arrangement is confirmed", description: "Zenward confirms what it can arrange and the next steps. Until then, the request is not a booking." },
      ],
    },
    scenarios: {
      heading: "Situations we hear about",
      items: [
        {
          title: "Treatment several days a week",
          description: "Same pickup, same destination, repeating days. Describe the pattern in one request and Zenward reviews the whole schedule with you.",
          link: { href: path("recurring-care-transportation"), label: "How recurring care transportation works" },
        },
        {
          title: "A family member coordinating",
          description: "A daughter arranges trips for a parent who can't drive to treatment. She is the requester, and Zenward follows up with her.",
        },
        {
          title: "A regular ride becomes unavailable",
          description: "A neighbor or relative who usually drives can't for a while, and the passenger needs another way to get to treatment.",
        },
      ],
    },
    faq: [
      {
        question: "Can I request recurring dialysis trips?",
        answer:
          "You can describe your repeating schedule in the request. Zenward reviews it and confirms with you what it can arrange. The request form doesn't set up trips on its own.",
      },
      {
        question: "Will my trips be scheduled automatically after I submit once?",
        answer:
          "No. Submitting a request is not a confirmed booking, and the form does not create automatic repeat trips. Zenward contacts you to talk through the schedule and confirm next steps.",
      },
      {
        question: "What about the ride home after treatment?",
        answer:
          "Tell us on the request that a return trip is needed. Treatment end times can vary, so Zenward will talk through return-trip timing with you when we follow up.",
      },
      {
        question: "Can a family member or caregiver arrange it?",
        answer:
          "Yes. The form asks for your relationship to the passenger, and Zenward follows up with the requester.",
      },
      {
        question: "How do I request transportation?",
        answer: `Use the Request Transportation form, or call ${PHONE} and our team can take the details by phone.`,
      },
    ],
    related: [
      {
        href: path("recurring-care-transportation"),
        label: "Recurring Care Transportation",
        blurb: "Regular trips for dialysis and other ongoing care.",
      },
    ],
    ctaHeading: "Request transportation for treatment",
    ctaBody: "Send your first trip and describe your schedule. Zenward will review it and contact you.",
    order: ["coordinate", "audience", "expect", "scenarios"],
  },

  "rehabilitation-transportation": {
    slug: "rehabilitation-transportation",
    path: path("rehabilitation-transportation"),
    cardTitle: "Rehabilitation Appointments",
    cardDescription: "Consistent transportation for physical therapy and recovery-focused visits.",
    metaTitle: "Rehabilitation Transportation",
    metaDescription:
      "Non-emergency transportation to rehabilitation, physical therapy, and other scheduled therapy appointments. Send a request and Zenward will contact you to confirm next steps.",
    icon: FirstAidKit,
    eyebrow: "Rehabilitation Transportation",
    h1: "Transportation to rehabilitation and therapy appointments",
    lede: "Rehabilitation appointments often repeat over weeks. Zenward coordinates non-emergency transportation to those visits, so getting there is one less thing to plan.",
    glance: {
      heading: "A good fit for",
      items: ["Rehabilitation appointments", "Physical therapy visits", "Other scheduled therapy-related care"],
    },
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
        {
          icon: Clock,
          title: "Appointment day and time",
          description: "Your preferred date and time, planned around when the visit is scheduled.",
        },
        {
          icon: MapPin,
          title: "Pickup and clinic",
          description: "Where the passenger is starting from and the rehabilitation or therapy location.",
        },
        {
          icon: ArrowUUpLeft,
          title: "A return trip",
          description: "If a ride back is needed, note it in the request so it is reviewed with the rest of the trip.",
        },
        {
          icon: Repeat,
          title: "A series of visits",
          description: "If you have several visits planned, describe them in the notes and Zenward looks at the whole schedule with you.",
        },
      ],
    },
    expect: {
      heading: "What to expect",
      intro: "Zenward coordinates the transportation. A request is not a confirmed ride.",
      steps: [
        { title: "Send a request", description: "Give us the passenger, pickup, therapy location, and the date and time of the visit." },
        { title: "Zenward reviews it", description: "The team checks the details and any notes about the trip." },
        { title: "Zenward contacts you", description: "We call the requester with questions and to talk through timing, including any repeat visits." },
        { title: "Next steps are confirmed", description: "Availability is confirmed by Zenward before the trip is treated as arranged." },
      ],
    },
    scenarios: {
      heading: "Trips people request",
      items: [
        {
          title: "A series of therapy visits",
          description: "Several appointments over the coming weeks, all to the same location.",
          link: { href: path("recurring-care-transportation"), label: "Recurring care transportation" },
        },
        {
          title: "Not able to drive for a while",
          description: "Someone who normally drives themselves needs help getting to appointments during a stretch of recovery.",
        },
        {
          title: "A caregiver with a full schedule",
          description: "A family member can't drive to every visit and needs another way for the passenger to get there.",
        },
      ],
    },
    faq: [
      {
        question: "Can I request trips for a series of therapy visits?",
        answer:
          "You can describe the visits you have planned in the request. Zenward reviews them and confirms with you what it can arrange.",
      },
      {
        question: "Does Zenward provide therapy or care during the trip?",
        answer:
          "No. Zenward provides non-emergency transportation only. It does not provide therapy, treatment, or medical care.",
      },
      {
        question: "What if the passenger has mobility or assistance needs?",
        answer:
          "Describe them in the optional assistance field on the request. Zenward reviews the request and confirms what it can accommodate when we contact you.",
      },
      {
        question: "Does submitting a request confirm my ride?",
        answer:
          "No. Zenward reviews your request, contacts you, and confirms availability and next steps. Until then it is not a booking.",
      },
      {
        question: "How do I request transportation?",
        answer: `Use the Request Transportation form, or call ${PHONE} and our team can take the details by phone.`,
      },
    ],
    related: [
      {
        href: path("recurring-care-transportation"),
        label: "Recurring Care Transportation",
        blurb: "For visits that repeat on a schedule.",
      },
    ],
    ctaHeading: "Need a ride to therapy?",
    ctaBody: "Tell us about the visit and Zenward will review your request and contact you.",
    order: ["audience", "coordinate", "expect", "scenarios"],
  },

  "hospital-discharge-transportation": {
    slug: "hospital-discharge-transportation",
    path: path("hospital-discharge-transportation"),
    cardTitle: "Hospital Discharge Transportation",
    cardDescription: "Coordinated transportation following a hospital stay.",
    metaTitle: "Hospital Discharge Transportation",
    metaDescription:
      "Planned non-emergency transportation after a hospital stay, coordinated with family, caregivers, or the care team. Request transportation to the passenger's next destination.",
    icon: Hospital,
    eyebrow: "Hospital Discharge Transportation",
    h1: "Planned transportation after a hospital discharge",
    lede: "When a hospital stay ends, the trip to the next place shouldn't be left to the last minute. Zenward coordinates non-emergency transportation to wherever the passenger is going next, working with family, caregivers, and care teams.",
    glance: {
      heading: "Built around",
      items: ["A planned discharge", "Family, caregiver, or provider coordination", "Wherever the passenger is going next"],
    },
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
        {
          icon: MapPin,
          title: "The next destination",
          description: "It may be home, a relative's address, or another facility. Tell us where, and Zenward reviews the trip.",
        },
        {
          icon: Clock,
          title: "Discharge timing",
          description: "Share the expected date and time. Discharge timing can shift, so let Zenward know if it changes.",
        },
        {
          icon: UsersThree,
          title: "Who is arranging it",
          description: "A family member, caregiver, or care team member can be the requester, so Zenward has one contact to follow up with.",
        },
        {
          icon: ClipboardText,
          title: "Pickup details",
          description: "The hospital name and, if you know it, where the passenger will be picked up.",
        },
      ],
    },
    expect: {
      heading: "What to expect",
      intro: "Because discharge plans can move quickly, send the request as early as you can. Nothing is confirmed until Zenward confirms it with you.",
      steps: [
        { title: "Share the discharge details", description: "Send the hospital, the passenger's next destination, and the expected date and time." },
        { title: "Zenward reviews it", description: "The team looks over the trip details and any notes about assistance needs." },
        { title: "Zenward contacts the requester", description: "We reach out to confirm details and talk through timing." },
        { title: "Availability is confirmed", description: "Zenward confirms availability and next steps before the trip is considered arranged." },
      ],
    },
    scenarios: {
      heading: "Situations we coordinate",
      items: [
        {
          title: "A family arranging the trip",
          description: "A daughter learns her father will be discharged later this week and needs a plan for getting him to where he'll be staying.",
          link: { href: path("senior-medical-transportation"), label: "Senior medical transportation" },
        },
        {
          title: "A discharge team arranging for a patient",
          description: "A case manager wants transportation coordinated so the ride isn't what holds up the discharge.",
        },
        {
          title: "Going somewhere other than home",
          description: "The passenger is moving on to another care setting or a relative's address, and the request names that destination.",
        },
      ],
    },
    faq: [
      {
        question: "Who can request discharge transportation?",
        answer:
          "A family member, caregiver, or member of the care team can submit a request. The form asks for your relationship to the passenger so Zenward knows who to follow up with.",
      },
      {
        question: "Does the trip have to end at the passenger's home?",
        answer:
          "No. Give us the passenger's next destination in the request. Zenward reviews it and confirms availability with you.",
      },
      {
        question: "Can Zenward arrange ambulance or stretcher transportation?",
        answer:
          "No. Zenward provides non-emergency medical transportation only. If the care team says a patient needs ambulance or stretcher transport, that has to be arranged separately.",
      },
      {
        question: "What if the discharge time changes?",
        answer: `Tell Zenward as soon as you know. Call ${PHONE} and the team will talk it through. A changed time is confirmed by Zenward, not assumed.`,
      },
      {
        question: "Does submitting a request confirm the trip?",
        answer:
          "No. Zenward reviews the request and contacts you, and the trip is confirmed only when we've confirmed availability and next steps.",
      },
    ],
    related: [
      {
        href: path("senior-medical-transportation"),
        label: "Senior Medical Transportation",
        blurb: "For older adults travelling to scheduled care.",
      },
    ],
    ctaHeading: "Planning a discharge trip?",
    ctaBody: "Send the discharge details and Zenward will review your request and contact you.",
    order: ["audience", "expect", "coordinate", "scenarios"],
  },

  "recurring-care-transportation": {
    slug: "recurring-care-transportation",
    path: path("recurring-care-transportation"),
    cardTitle: "Recurring Scheduled Care",
    cardDescription: "Regular transportation arranged around a recurring treatment or care schedule.",
    metaTitle: "Recurring Care Transportation",
    metaDescription:
      "Regular non-emergency transportation for ongoing medical appointments such as dialysis or rehabilitation. Describe your schedule and Zenward will review it with you.",
    icon: CalendarCheck,
    eyebrow: "Recurring Care Transportation",
    h1: "Regular transportation for ongoing care",
    lede: "For appointments that repeat, such as dialysis, rehabilitation, or other ongoing care, Zenward works with you to establish a regular transportation arrangement, so you aren't starting over with every trip.",
    glance: {
      heading: "Built around",
      items: ["Repeating appointments", "Dialysis, rehabilitation, and other ongoing care", "A regular arrangement with Zenward"],
    },
    audience: {
      heading: "Who this is for",
      intro: "People whose care means the same trip, again and again, and those who help them get there.",
      points: [
        "Patients with ongoing treatment or therapy appointments",
        "Family members and caregivers who manage a regular schedule",
        "People who want one conversation about their schedule instead of arranging each trip separately",
      ],
    },
    coordinate: {
      heading: "What Zenward helps coordinate",
      items: [
        {
          icon: Repeat,
          title: "The pattern",
          description: "Which days and times you travel, when it starts, and how long you expect it to continue, if you know.",
        },
        {
          icon: MapPin,
          title: "The same pickup and destination",
          description: "Where the passenger is picked up and the location they're going to, described once.",
        },
        {
          icon: ArrowUUpLeft,
          title: "Return trips",
          description: "Whether the passenger needs a ride back each time, and roughly when.",
        },
        {
          icon: ArrowsClockwise,
          title: "Changes along the way",
          description: "If days or times change, or a visit is paused, tell Zenward and we'll talk through what it means for your trips.",
        },
      ],
    },
    expect: {
      heading: "How a regular arrangement starts",
      intro: "The request form is the starting point. A request is not a booking, and it doesn't set up trips automatically.",
      steps: [
        { title: "Tell us about the schedule", description: "Fill in the request form for the first trip and describe the repeating days and times in the notes." },
        { title: "Zenward reviews it", description: "The team looks at the pattern, not only the first trip." },
        { title: "Zenward contacts you", description: "We reach out to the requester to talk through what a regular arrangement could look like." },
        { title: "The arrangement is confirmed", description: "Zenward confirms what it can arrange and the next steps. Until then, nothing is confirmed." },
      ],
    },
    scenarios: {
      heading: "Common recurring needs",
      items: [
        {
          title: "Dialysis",
          description: "Repeating treatment days, with timing built around treatment.",
          link: { href: path("dialysis-transportation"), label: "Dialysis transportation" },
        },
        {
          title: "Rehabilitation",
          description: "A series of therapy visits over several weeks.",
          link: { href: path("rehabilitation-transportation"), label: "Rehabilitation transportation" },
        },
        {
          title: "Other ongoing care",
          description: "Regular specialist visits or another scheduled treatment that brings you to the same place on a routine.",
        },
      ],
    },
    faq: [
      {
        question: "What counts as recurring care transportation?",
        answer:
          "Trips to appointments that repeat on a schedule, such as dialysis or rehabilitation, or other ongoing care. Describe your schedule and Zenward reviews it with you.",
      },
      {
        question: "Can I request recurring trips through the form?",
        answer:
          "Yes, but the form has no dedicated recurring-trip setting. Fill it in for your first trip and describe the repeating days and times in the notes. Zenward follows up to talk through the rest.",
      },
      {
        question: "Will trips be booked automatically?",
        answer:
          "No. Submitting a request is not a confirmed booking. Zenward reviews it, contacts you, and confirms what it can arrange and the next steps.",
      },
      {
        question: "Can a family member arrange recurring trips for someone else?",
        answer:
          "Yes. The form asks for your relationship to the passenger, and Zenward follows up with the requester.",
      },
      {
        question: "What if the schedule changes?",
        answer: `Let Zenward know as soon as you can by calling ${PHONE}. Changes are confirmed with the Zenward team, not assumed.`,
      },
    ],
    related: [],
    ctaHeading: "Start a regular transportation arrangement",
    ctaBody: "Send your first trip and describe your schedule. Zenward will review it and contact you.",
    order: ["audience", "coordinate", "scenarios", "expect"],
  },

  "senior-medical-transportation": {
    slug: "senior-medical-transportation",
    path: path("senior-medical-transportation"),
    cardTitle: "Senior Medical Transportation",
    cardDescription: "Transportation for older adults attending medical appointments and care visits.",
    metaTitle: "Senior Medical Transportation",
    metaDescription:
      "Non-emergency transportation for older adults travelling to scheduled medical care, arranged with family members and caregivers. Send a request and Zenward will contact you.",
    icon: HandHeart,
    eyebrow: "Senior Medical Transportation",
    h1: "Medical transportation for older adults",
    lede: "Zenward coordinates non-emergency transportation for older adults travelling to scheduled medical care, with clear communication for the passenger and for the family members or caregivers who help arrange it.",
    glance: {
      heading: "Built around",
      items: ["Older adults going to scheduled care", "Family and caregiver involvement", "Clear, respectful communication"],
    },
    audience: {
      heading: "Who this transportation is for",
      intro: "Older adults with scheduled medical care, and the family and caregivers who arrange the trip with them.",
      points: [
        "Older adults who no longer drive, or who'd rather not drive to appointments",
        "Adult children arranging rides for a parent",
        "Caregivers managing several appointments for someone",
        "Senior care organizations arranging trips for the people they support",
      ],
    },
    coordinate: {
      heading: "What Zenward helps coordinate",
      items: [
        {
          icon: UsersThree,
          title: "The requester and the passenger",
          description: "They can be different people. Give both names, and Zenward follows up with the requester.",
        },
        {
          icon: Clock,
          title: "The appointment",
          description: "Pickup, destination, and your preferred date and time.",
        },
        {
          icon: ArrowUUpLeft,
          title: "A return trip",
          description: "If the passenger needs a ride back, say so in the request.",
        },
        {
          icon: ChatCircleText,
          title: "Mobility or assistance notes",
          description: "The form has an optional field for anything Zenward should know. We review it and confirm what we can accommodate before anything is confirmed.",
        },
      ],
    },
    expect: {
      heading: "What to expect",
      intro: "A request is not a confirmed ride. Zenward contacts the requester to talk it through.",
      steps: [
        { title: "Send a request", description: "For yourself, a parent, a spouse, or someone you care for." },
        { title: "Zenward reviews it", description: "A person on the team reads the details and any notes you added." },
        { title: "Zenward contacts the requester", description: "We ask anything we need to and talk through the trip." },
        { title: "Availability is confirmed", description: "The trip is confirmed once Zenward confirms availability and next steps with you." },
      ],
    },
    scenarios: {
      heading: "Trips people request",
      items: [
        {
          title: "An adult child arranging for a parent",
          description: "A son lives far from his mother and wants to book her ride to a specialist visit himself.",
        },
        {
          title: "Regular appointments",
          description: "A caregiver manages a run of visits and wants to set up a regular arrangement.",
          link: { href: path("recurring-care-transportation"), label: "Recurring care transportation" },
        },
        {
          title: "After a hospital stay",
          description: "An older adult is leaving the hospital and needs planned transportation to their next destination.",
          link: { href: path("hospital-discharge-transportation"), label: "Hospital discharge transportation" },
        },
      ],
    },
    faq: [
      {
        question: "Can my adult child or caregiver arrange the ride for me?",
        answer:
          "Yes. The form asks for the requester's relationship to the passenger, and Zenward follows up with the requester.",
      },
      {
        question: "Can I tell Zenward about mobility or assistance needs?",
        answer:
          "Yes. Use the optional assistance field on the request. Zenward reviews it and confirms what it can accommodate when we contact you, so please don't assume any particular level of assistance before then.",
      },
      {
        question: "Does submitting a request confirm the ride?",
        answer:
          "No. Zenward reviews the request, contacts the requester, and confirms availability and next steps. Until then it is not a booking.",
      },
      {
        question: "Can I arrange regular trips to appointments?",
        answer:
          "You can describe a repeating schedule in the request notes. Zenward reviews it and confirms with you what it can arrange.",
      },
      {
        question: "How do I request transportation?",
        answer: `Use the Request Transportation form, or call ${PHONE} and our team can take the details by phone.`,
      },
    ],
    related: [
      {
        href: path("recurring-care-transportation"),
        label: "Recurring Care Transportation",
        blurb: "For appointments that repeat on a schedule.",
      },
      {
        href: path("hospital-discharge-transportation"),
        label: "Hospital Discharge Transportation",
        blurb: "Planned transportation after a hospital stay.",
      },
    ],
    ctaHeading: "Arranging a ride for an older adult?",
    ctaBody: "Send the details and Zenward will review your request and contact you.",
    order: ["audience", "coordinate", "expect", "scenarios"],
  },
};

/** Stable display order, matching /services. */
export const SERVICE_ORDER: ServiceSlug[] = [
  "medical-appointments",
  "dialysis-transportation",
  "rehabilitation-transportation",
  "hospital-discharge-transportation",
  "recurring-care-transportation",
  "senior-medical-transportation",
];

export const SERVICE_PATHS = SERVICE_ORDER.map((slug) => SERVICES[slug].path);
