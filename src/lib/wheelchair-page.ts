/**
 * Wheelchair-Accessible Transportation page (ZENWARD-WEB-SERVICE-WHEELCHAIR-01).
 * Owner-approved copy, verbatim: do not reword. Rendered by
 * src/components/public/WheelchairServicePage.tsx; identity (label, path,
 * request link, related services) still comes from the service catalogue.
 *
 * Unlike src/lib/services.ts, this copy names the market (Metro Atlanta,
 * Georgia) because the owner approved it that way; Metro Atlanta is the one
 * active market in src/lib/service-area.ts.
 *
 * VEHICLE CLAIMS: owner-confirmed and shown in the authentic photographs only:
 * a rear-entry BraunAbility ramp, a wheelchair accommodation area with floor
 * securement fittings, and passenger seating. No capacities, dimensions,
 * weight limits, restraint standards, certifications (incl. ADA) or
 * compatibility promises.
 *
 * Pure data, relative imports only (node-testable).
 */
import type { brandImages } from "./images.ts";

type ImageKey = keyof typeof brandImages;
export type InlineLink = { href: string; label: string };

export const WHEELCHAIR_SEO = {
  /** The layout template appends " | Zenward Mobility". */
  title: "Wheelchair Transportation in Metro Atlanta, GA",
  description:
    "Need wheelchair-accessible transportation in Metro Atlanta? Zenward Mobility helps arrange scheduled medical rides. Request a quote or call 678-935-5489.",
} as const;

export const WHEELCHAIR_PAGE = {
  hero: {
    eyebrow: "Zenward Mobility | Metro Atlanta, Georgia",
    heading: "Wheelchair-Accessible Transportation in Metro Atlanta",
    paragraphs: [
      "When someone you care about uses a wheelchair, arranging a ride isn't always as simple as calling a taxi.",
      "At Zenward Mobility, we help individuals, families, and caregivers arrange wheelchair-accessible transportation for scheduled medical appointments and treatments across Metro Atlanta.",
      "Tell us about the passenger's needs, and we'll review the trip, confirm what we can accommodate, and explain the arrangements before booking.",
    ],
    image: "wheelchairAssistanceHero" satisfies ImageKey,
    /** Visible disclosure: the hero is AI-generated; the real vehicle follows. */
    caption: "Illustrative scene. Actual Zenward vehicle and accessibility features shown below.",
  },

  vehicle: {
    heading: "Meet Our Wheelchair-Accessible Vehicle",
    paragraphs: [
      "Zenward Mobility uses a branded wheelchair-accessible vehicle for suitable scheduled medical transportation trips in Metro Atlanta.",
      "We know passengers and families want to understand the vehicle they're booking. That's why we're showing you our actual vehicle and its accessibility features.",
      "Before confirming a ride, we'll review the passenger's mobility needs and the transportation arrangements required.",
    ],
    exterior: {
      image: "officialVehicleWheelchair" satisfies ImageKey,
      caption: "Zenward Mobility's actual wheelchair-accessible transportation vehicle serving Metro Atlanta.",
    },
    features: [
      {
        heading: "Wheelchair Access Through a Rear-Entry Ramp",
        text: "Our wheelchair-accessible vehicle is equipped with a rear-entry ramp. Before confirming transportation, we'll review the passenger's wheelchair and mobility requirements to determine whether the available arrangements are suitable.",
        image: "wheelchairRamp" satisfies ImageKey,
        caption: "Rear-entry BraunAbility wheelchair ramp on Zenward Mobility's accessible vehicle.",
      },
      {
        heading: "Space Designed for Wheelchair Transportation",
        text: "The vehicle includes a dedicated wheelchair accommodation area with securement fittings. We'll ask about the passenger's wheelchair and requirements before confirming whether the vehicle can accommodate the trip.",
        image: "wheelchairSecurementArea" satisfies ImageKey,
        caption: "Wheelchair accommodation space and securement fittings inside Zenward's vehicle.",
      },
    ],
  },

  audience: {
    heading: "Wheelchair Transportation That Starts With Your Needs",
    paragraphs: [
      "Every passenger's situation is different.",
      "Some people need transportation to regular medical appointments. Others may be recovering from treatment, attending rehabilitation or relying on family members to coordinate their care.",
      "Choosing transportation for someone who uses a wheelchair involves more than finding an available vehicle.",
      "You want to know whether the vehicle is suitable, what assistance can be arranged and how the journey will work from pickup to arrival.",
      "At Zenward Mobility, we review those details before confirming transportation so you have a clearer understanding of what to expect.",
    ],
    cards: [
      "Wheelchair users attending medical appointments",
      "Families arranging transportation for loved ones",
      "Patients attending recurring treatments",
      "Healthcare coordinators organizing suitable transportation",
    ],
  },

  trips: {
    heading: "Wheelchair-Accessible Rides for Medical Appointments and Treatments",
    intro:
      "Whether the appointment is routine or part of ongoing treatment, having appropriate transportation arrangements can make the day easier to manage.",
    items: [
      "Doctor and specialist appointments",
      "Dialysis treatments",
      "Rehabilitation and physical therapy",
      "Outpatient appointments",
      "Medical tests and follow-up visits",
      "Suitable non-emergency hospital discharge trips",
    ],
    note: "All trips remain subject to capability, passenger suitability and scheduling availability.",
  },

  expect: {
    heading: "Know What to Expect Before You Travel",
    paragraphs: [
      "We want passengers and families to understand the transportation arrangements before the appointment day.",
      "When you contact Zenward Mobility, we'll ask about the pickup location, destination, appointment time, wheelchair requirements and any assistance the passenger may need.",
      "We'll also review return-trip arrangements where applicable.",
      "Once we've reviewed the request, we'll explain availability, appropriate arrangements and pricing before confirming the booking.",
    ],
    seating: {
      heading: "A Comfortable Space for the Journey",
      text: "Our vehicle also includes passenger seating. When arranging transportation, let us know who will be traveling and whether additional assistance is needed so we can review the appropriate arrangements.",
      image: "passengerSeating" satisfies ImageKey,
      caption: "Passenger seating inside Zenward Mobility's transportation vehicle.",
    },
  },

  steps: {
    heading: "Arranging Your Ride Is Straightforward",
    items: [
      {
        title: "Tell Us About the Trip",
        description: "Provide pickup and destination details, appointment information and passenger mobility requirements.",
      },
      { title: "We Review Your Request", description: "Our team reviews the trip and available transportation arrangements." },
      {
        title: "Confirm the Details",
        description: "We clarify wheelchair accommodation, assistance requirements, timing, availability and pricing.",
      },
      { title: "Finalize Transportation", description: "Once the arrangements are agreed upon, the trip can be confirmed." },
    ],
  },

  area: {
    heading: "Wheelchair Transportation in Metro Atlanta, Georgia",
    paragraphs: [
      "Finding suitable wheelchair transportation in Metro Atlanta can require some planning, especially when appointments involve treatment schedules, family commitments or mobility requirements.",
      "Zenward Mobility provides scheduled wheelchair-accessible transportation for suitable non-emergency medical trips within its confirmed Metro Atlanta service area.",
      "Whether you're arranging an appointment for yourself or coordinating transportation for someone you care about, our team can review the trip details and explain the arrangements available.",
    ],
    /** The closing sentence, with its two in-site links. */
    linked: [
      "Learn more about our ",
      { href: "/locations/metro-atlanta", label: "Metro Atlanta service area" },
      " or ",
      { href: "/contact", label: "contact us" },
      " to discuss your transportation needs.",
    ] as (string | InlineLink)[],
  },

  faqHeading: "Frequently Asked Questions",
  faq: [
    {
      question: "Do you provide wheelchair-accessible transportation in Metro Atlanta?",
      answer: "Yes. Zenward has wheelchair-accessible transportation available for suitable scheduled trips, subject to review and availability.",
    },
    {
      question: "Can passengers remain in their wheelchairs during transportation?",
      answer:
        "Suitability depends on wheelchair dimensions, vehicle configuration and securement requirements. These details must be reviewed before confirmation.",
    },
    {
      question: "Can I arrange transportation for a family member?",
      answer:
        "Yes. Family members and caregivers can submit transportation requests on behalf of a passenger. Our team may contact you to clarify the passenger's needs and any additional information required before confirming transportation.",
    },
    {
      question: "Can I schedule recurring medical trips?",
      answer: "Recurring transportation requests can be reviewed based on scheduling and vehicle availability.",
    },
    {
      question: "Can you arrange return transportation?",
      answer: "Return-trip arrangements can be discussed and confirmed during booking.",
    },
    {
      question: "How much does wheelchair transportation cost?",
      answer: "Pricing depends on the trip and transportation requirements. Zenward reviews the details and provides pricing before confirmation.",
    },
    {
      question: "Is Zenward an ambulance service?",
      answer:
        "No. Zenward provides non-emergency medical transportation, not emergency ambulance services. For medical emergencies, call 911.",
    },
  ],

  closing: {
    heading: "Need Wheelchair-Accessible Transportation in Metro Atlanta?",
    body: "Tell us about the trip and the passenger's mobility needs. Our team will review the details, explain available arrangements and help you understand the next steps.",
  },

  /** CTA labels (hero and closing). The phone number itself comes from business.ts. */
  requestLabel: "Request Transportation",
} as const;
