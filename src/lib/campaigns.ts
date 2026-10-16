/**
 * Content for the four paid-search landing pages (ZW-WEB-04D), rendered by
 * CampaignPage. Routes and quote links come from src/lib/campaign-routes.ts;
 * service labels from the catalogue; the market from src/lib/service-area.ts.
 *
 * The three service campaigns reuse the approved considerations and FAQ from
 * their 04C service pages (src/lib/services.ts), so claims stay identical to
 * the reviewed copy. Campaign pages are noindex, so this doesn't create
 * organic duplication.
 *
 * Claim discipline as in services.ts: no ADA, securement, ramp/lift,
 * transfers/lifting, stretcher, door-through-door, oxygen, monitoring,
 * punctuality guarantees, automatic recurring booking, insurance/Medicaid,
 * pricing or availability promises.
 */
import type { FaqItem } from "@/components/public/FaqAccordion";
import { business } from "@/lib/business";
import { brandImages, type BrandImageAsset } from "@/lib/images";
import { CAMPAIGN_ROUTES, type CampaignRoute, type CampaignSlug } from "@/lib/campaign-routes";
import { SERVICE_CATALOG, type ServiceSlug } from "@/lib/service-catalog";
import { SERVICES } from "@/lib/services";

export interface CampaignContent extends CampaignRoute {
  /** Service name; the H1 is "<label> in <market>". */
  label: string;
  eyebrow: string;
  lede: string;
  image: { asset: BrandImageAsset; objectPosition: string };
  /** Three quick answers shown directly under the hero. */
  glance: string[];
  useCases: { heading: string; intro: string; items: { title: string; description: string }[] };
  /** Broad page only: the NEMT service family, linked to its service pages. */
  serviceFamily?: ServiceSlug[];
  considerations: { heading: string; items: { title: string; description: string }[] };
  faq: FaqItem[];
  /** The organic page that owns this topic, linked as "Learn more". */
  organicLinkLabel: string;
  ctaHeading: string;
  ctaBody: string;
  metaDescription: string;
}

const PHONE = business.phoneDisplay;

export const CAMPAIGNS: Record<CampaignSlug, CampaignContent> = {
  "non-emergency-medical-transportation": {
    ...CAMPAIGN_ROUTES["non-emergency-medical-transportation"],
    label: "Non-Emergency Medical Transportation",
    eyebrow: "Scheduled · Non-Emergency",
    lede: "Rides to medical appointments, dialysis, rehabilitation, hospital discharge and recurring care, including wheelchair-accessible transportation. Request a quote or call, and our team will take it from there.",
    image: { asset: brandImages.vanWalkerAssist, objectPosition: "70% 55%" },
    glance: ["Scheduled, non-emergency medical trips", "One-time and recurring requests", "Every request reviewed by a person"],
    useCases: {
      heading: "Who we help get to care",
      intro: "Passengers with scheduled medical care, and the family members, caregivers and care teams who arrange it.",
      items: [
        { title: "Patients", description: "Adults who don't drive, or would rather not drive, to a medical visit or treatment." },
        { title: "Families", description: "Adult children and relatives arranging a ride for a parent, spouse or relative." },
        { title: "Caregivers", description: "Caregivers coordinating one-time trips or a regular schedule for someone in their care." },
        { title: "Care teams", description: "Clinics, dialysis centers and discharge teams arranging transportation for a patient." },
      ],
    },
    serviceFamily: [
      "medical-appointments",
      "dialysis-transportation",
      "rehabilitation-transportation",
      "hospital-discharge-transportation",
      "recurring-care-transportation",
      "senior-medical-transportation",
      "wheelchair-transportation",
    ],
    considerations: {
      heading: "Good to know",
      items: [
        { title: "Non-emergency only", description: "Zenward doesn't provide ambulance, stretcher or emergency transportation. In a medical emergency, call 911." },
        { title: "Reviewed, then confirmed", description: "A request isn't a confirmed ride. Our team reviews it and contacts you to confirm availability, next steps and pricing." },
        { title: "Mobility needs", description: "Describe any mobility or assistance needs in the request so they're part of the review." },
      ],
    },
    faq: [
      {
        question: "Is submitting a request a confirmed ride?",
        answer: "No. A request tells Zenward what you need. Our team reviews it and contacts you, and the trip is confirmed only once we've confirmed availability and details with you.",
      },
      {
        question: "Can I arrange transportation for someone else?",
        answer: "Yes. Family members, caregivers and care teams can make the request. The form asks for your relationship to the passenger, and Zenward follows up with you.",
      },
      {
        question: "Do you offer wheelchair-accessible transportation?",
        answer: "Yes. Zenward offers wheelchair-accessible transportation for scheduled, non-emergency medical trips. Describe the passenger's mobility needs in the request.",
      },
      {
        question: "Can I request recurring trips?",
        answer: "Yes. Choose Recurring on the request form and describe the schedule. Zenward reviews it and confirms what it can arrange; nothing is booked automatically.",
      },
      {
        question: "How do I reach someone?",
        answer: `Call ${PHONE}, or request a quote online and our team will contact you.`,
      },
    ],
    organicLinkLabel: "Zenward in Metro Atlanta",
    ctaHeading: "Need medical transportation?",
    ctaBody: "Request a quote or call. Zenward reviews every request and follows up to confirm availability and details.",
    metaDescription:
      "Scheduled, non-emergency medical transportation for appointments, dialysis, rehabilitation, hospital discharge and recurring care, including wheelchair-accessible trips. Request a quote or call Zenward Mobility.",
  },

  "wheelchair-transportation": {
    ...CAMPAIGN_ROUTES["wheelchair-transportation"],
    label: SERVICE_CATALOG["wheelchair-transportation"].label,
    eyebrow: "Scheduled · Non-Emergency",
    lede: "Wheelchair-accessible transportation for scheduled, non-emergency medical trips. Tell us about the passenger's mobility needs, and we'll review the trip and confirm the arrangement with you.",
    image: { asset: brandImages.heroDesktop, objectPosition: "72% 45%" },
    glance: ["Wheelchair-accessible transportation", "Scheduled, non-emergency medical trips", "Mobility needs reviewed before confirming"],
    useCases: {
      heading: "Who this is for",
      intro: "Passengers who use a wheelchair and have scheduled medical care to get to, and the people who arrange the trip.",
      items: [
        { title: "Medical appointments", description: "A planned round trip to a doctor or specialist visit." },
        { title: "Treatment and therapy", description: "Dialysis or rehabilitation visits, one-time or on a repeating schedule." },
        { title: "After a hospital stay", description: "Planned transportation to the passenger's next destination." },
        { title: "Arranged by family or care teams", description: "A family member, caregiver or care coordinator can make the request." },
      ],
    },
    considerations: SERVICES["wheelchair-transportation"].considerations,
    faq: SERVICES["wheelchair-transportation"].faq,
    organicLinkLabel: "About wheelchair-accessible transportation",
    ctaHeading: "Need wheelchair-accessible transportation?",
    ctaBody: "Send the trip and mobility details, and Zenward will review your request and contact you.",
    metaDescription:
      "Wheelchair-accessible transportation for scheduled, non-emergency medical trips. Share the passenger's mobility details and Zenward will review the trip and contact you.",
  },

  "dialysis-transportation": {
    ...CAMPAIGN_ROUTES["dialysis-transportation"],
    label: SERVICE_CATALOG["dialysis-transportation"].label,
    eyebrow: "Scheduled · Non-Emergency",
    lede: "Transportation to and from dialysis, coordinated around your treatment schedule. Describe the days you're expected once, and we'll review the whole pattern with you.",
    image: { asset: brandImages.vanWalkerAssist, objectPosition: "82% 55%" },
    glance: ["Repeating treatment schedules", "Outbound and return-trip requests", "Schedules reviewed with you, not automated"],
    useCases: {
      heading: "Built around treatment",
      intro: "For people who travel to dialysis on a repeating schedule, and the family and caregivers who help.",
      items: [
        { title: "Your treatment schedule", description: "Choose Recurring on the request and give the days, start date and appointment time." },
        { title: "The ride there", description: "Planned around when you need to arrive for treatment." },
        { title: "The ride home", description: "Request a return trip; timing is talked through because treatment end times vary." },
        { title: "Schedule changes", description: `If treatment days or times change, call ${PHONE} and we'll talk it through.` },
      ],
    },
    considerations: SERVICES["dialysis-transportation"].considerations,
    faq: SERVICES["dialysis-transportation"].faq,
    organicLinkLabel: "About dialysis transportation",
    ctaHeading: "Request transportation for treatment",
    ctaBody: "Describe your treatment schedule. Zenward will review it and contact you.",
    metaDescription:
      "Transportation to and from dialysis, coordinated around repeating treatment schedules, including return-trip requests. Request a quote and Zenward will review your schedule with you.",
  },

  "medical-appointment-transportation": {
    ...CAMPAIGN_ROUTES["medical-appointment-transportation"],
    label: SERVICE_CATALOG["medical-appointments"].label,
    eyebrow: "Scheduled · Non-Emergency",
    lede: "Rides to physician, specialist, outpatient, diagnostic and follow-up appointments, planned around your appointment time.",
    image: { asset: brandImages.vanWalkerAssist, objectPosition: "66% 55%" },
    glance: ["Physician and specialist visits", "Outpatient and diagnostic appointments", "Return trips on request"],
    useCases: {
      heading: "Appointments people request rides to",
      intro: "Scheduled, non-emergency medical care. Zenward provides the transportation, not medical care.",
      items: [
        { title: "Physician visits", description: "Routine checkups and visits with your doctor." },
        { title: "Specialist visits", description: "Appointments somewhere unfamiliar, with a clear plan for getting there and back." },
        { title: "Outpatient and diagnostic", description: "Outpatient procedures, scans and tests booked in advance." },
        { title: "Follow-ups", description: "Follow-up appointments when your usual ride isn't available." },
      ],
    },
    considerations: SERVICES["medical-appointments"].considerations,
    faq: SERVICES["medical-appointments"].faq,
    organicLinkLabel: "About medical appointment transportation",
    ctaHeading: "Need a ride to an appointment?",
    ctaBody: "Send the trip details and Zenward will review your request and contact you.",
    metaDescription:
      "Rides to physician, specialist, outpatient, diagnostic and follow-up appointments. Request a quote and Zenward will review your trip and contact you.",
  },
};
