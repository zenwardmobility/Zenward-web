/**
 * Owner-confirmed trust and operating facts (ZW-WEB-04F). This module is the
 * ONLY source of credibility claims on the public site: licensing/insurance,
 * punctuality, driver standards, passenger care and response time. Pages and
 * components read their wording from here; nothing else may state these
 * facts in its own words.
 *
 * Owner-confirmed (2026-10-16): licensed and insured; punctuality is a core
 * operating standard; drivers are professionally trained and vetted, with
 * screening and background checks part of the operating standard;
 * passengers are treated with patience, dignity and compassion;
 * wheelchair-accessible transportation; quote/enquiry replies within 2 hours
 * during working hours.
 *
 * WORDING RULES (also enforced by src/lib/trust.test.mjs):
 *   - Punctuality is a STANDARD, never a guarantee ("On-Time
 *     Transportation", "Punctuality is our standard"). No "guaranteed on
 *     time", "100%", "always".
 *   - The 2-hour promise is a RESPONSE during working hours, never a
 *     confirmed ride, guaranteed availability or a 24/7 service. The
 *     working-hour clock range is not confirmed and is not stated.
 *   - Licensed & insured is stated plainly: no licence authority, number,
 *     certificate, policy or regulatory scheme.
 *   - Not confirmed, so never stated: CPR or any named certification, ADA,
 *     operating hours, 24/7, equipment specifications, fleet size, years in
 *     business, trip counts, ratings, reviews, insurance/Medicaid/Medicare
 *     acceptance.
 *
 * Pure data, relative imports only, safe in node tests and the browser.
 */

export type TrustKey = "licensed" | "onTime" | "drivers" | "response";

export interface TrustPoint {
  key: TrustKey;
  /** Full label (detailed strip). */
  label: string;
  /** Label used alone in compact strips, so it must carry its own qualifier. */
  compactLabel: string;
  /** One short supporting sentence (detailed strip). */
  detail: string;
}

/** The four headline trust points, in display order. */
export const TRUST_POINTS: readonly TrustPoint[] = [
  {
    key: "licensed",
    label: "Licensed & Insured",
    compactLabel: "Licensed & Insured",
    detail: "Professional transportation you can request with confidence.",
  },
  {
    key: "onTime",
    label: "On-Time Transportation",
    compactLabel: "On-Time Transportation",
    detail: "Punctuality is our standard. Trips are planned around pickup and appointment times.",
  },
  {
    key: "drivers",
    label: "Trained & Vetted Drivers",
    compactLabel: "Trained & Vetted Drivers",
    detail: "Professional drivers selected with passenger safety and care in mind.",
  },
  {
    key: "response",
    label: "Response Within 2 Hours",
    compactLabel: "2-Hour Response During Working Hours",
    detail: "Quote requests received during working hours are answered within 2 hours.",
  },
];

/** Request-form expectation (owner committed to the standard, so the firm wording is used). */
export const QUOTE_RESPONSE_LINE = "Requests received during working hours are reviewed and answered within 2 hours.";

/** Contact-page expectation. */
export const CONTACT_RESPONSE_LINE = "We reply within 2 hours during working hours.";

/** Keeps the 2-hour promise from reading as a booking or availability promise. */
export const RESPONSE_IS_NOT_CONFIRMATION =
  "A reply isn't a confirmed ride: Zenward confirms availability and details with you before any trip is arranged.";

export type OperatingStandardKey = "punctuality" | "drivers" | "care" | "readiness" | "communication" | "licensed" | "wheelchair";

export interface OperatingStandard {
  key: OperatingStandardKey;
  /** Short category name (About-page cards). */
  category: string;
  /** Heading where the standard is a statement (homepage "Why Zenward", providers, hub). */
  title: string;
  description: string;
}

/** How Zenward operates: the longer-form version of the trust points. */
export const OPERATING_STANDARDS: Record<OperatingStandardKey, OperatingStandard> = {
  punctuality: {
    key: "punctuality",
    category: "Punctuality",
    title: "On-time transportation",
    description:
      "Medical appointments run on schedules. Zenward plans each trip around the pickup and appointment time, with punctuality treated as a core operating standard.",
  },
  drivers: {
    key: "drivers",
    category: "Driver standards",
    title: "Trained and vetted drivers",
    description:
      "Passengers are transported by professional drivers selected and prepared for the responsibility of non-emergency medical transportation. Driver screening, including background checks, is part of our operating standard.",
  },
  care: {
    key: "care",
    category: "Passenger care",
    title: "Patience, dignity and compassion",
    description:
      "Every passenger is treated with patience, dignity and compassion, whether it's a first appointment or a regular trip.",
  },
  readiness: {
    key: "readiness",
    category: "Transportation readiness",
    title: "Transportation prepared for the trip",
    description:
      "Before a trip is confirmed, our team reviews the passenger's mobility and assistance needs, including whether wheelchair-accessible transportation is needed.",
  },
  communication: {
    key: "communication",
    category: "Communication",
    title: "Clear follow-up",
    description:
      "Transportation requests received during working hours are reviewed and answered within 2 hours. Zenward then confirms availability and details with you before any trip is arranged.",
  },
  licensed: {
    key: "licensed",
    category: "Licensed & insured",
    title: "Licensed and insured",
    description: "Zenward Mobility is a licensed and insured transportation provider.",
  },
  // ZW-WEB-04L: owner-confirmed wheelchair-accessible transportation, stated as
  // availability reviewed per trip (no equipment specifications).
  wheelchair: {
    key: "wheelchair",
    category: "Wheelchair-accessible",
    title: "Wheelchair-accessible transportation",
    description:
      "Wheelchair-accessible transportation is available for scheduled, non-emergency trips. Our team reviews the passenger's mobility needs before confirming the arrangement.",
  },
};

/**
 * The trust facts a care team sees on /healthcare-providers (ZW-WEB-04L), in
 * order. All owner-confirmed; the descriptions come from OPERATING_STANDARDS.
 */
export const PROVIDER_TRUST_ORDER: OperatingStandardKey[] = ["licensed", "drivers", "punctuality", "wheelchair", "care", "communication"];
