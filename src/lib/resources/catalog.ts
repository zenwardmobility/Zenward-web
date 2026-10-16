/**
 * Zenward Resources catalogue (ZW-WEB-04K): the typed, version-controlled list
 * of launch Resources. METADATA ONLY (slugs, titles, SEO, dates, categories,
 * related services/resources). Article bodies live in content.ts and are
 * rendered on the server, so the Transportation Assistant and tests can use
 * this compact catalogue without shipping article text to the browser.
 *
 * Pure data, relative imports only (node-testable).
 */
import { SERVICE_CATALOG, type ServiceSlug } from "../service-catalog.ts";
import type { ResourceSlug } from "./slugs.ts";

export type { ResourceSlug };

export type ResourceCategory = "riders-families" | "providers" | "tools";

export const RESOURCE_CATEGORIES: Record<ResourceCategory, { label: string; blurb: string }> = {
  "riders-families": {
    label: "For Riders & Families",
    blurb: "Understanding non-emergency medical transportation and planning a trip for yourself or someone you care for.",
  },
  providers: {
    label: "For Healthcare Providers",
    blurb: "Practical checklists for care teams, discharge planners and coordinators arranging transportation for patients.",
  },
  tools: {
    label: "Planning Tools",
    blurb: "Simple tools to get the details together before you request transportation.",
  },
};

export interface ResourceMeta {
  slug: ResourceSlug;
  path: string;
  title: string;
  /** Card / intro summary. */
  description: string;
  /** Primary hub section (and the page eyebrow). */
  category: ResourceCategory;
  /** Further hub sections that list the SAME Resource (same URL, no duplicate article). */
  alsoIn?: ResourceCategory[];
  /** Who it is written for (shown as plain text, never colour-only). */
  audience: string;
  /** "guide" renders Article schema; "tool" is interactive (Breadcrumb only). */
  kind: "guide" | "checklist" | "tool";
  publishedDate: string;
  updatedDate: string;
  featured?: boolean;
  /** Canonical service catalogue slugs this Resource helps with (first = primary CTA unless genericRequest). */
  relatedServices: ServiceSlug[];
  /** CTAs use the generic /request-transportation with no service preselected (owner decision for R1, R2 and the tool). */
  genericRequest?: boolean;
  relatedResources: ResourceSlug[];
  seoTitle: string;
  seoDescription: string;
  /** Card action label. */
  cardAction: "Read guide" | "View checklist";
}

const PUBLISHED = "2026-10-16";

const r = (meta: Omit<ResourceMeta, "path" | "publishedDate" | "updatedDate">): ResourceMeta => ({
  ...meta,
  path: `/resources/${meta.slug}`,
  publishedDate: PUBLISHED,
  updatedDate: PUBLISHED,
});

export const RESOURCES: readonly ResourceMeta[] = [
  r({
    slug: "how-to-arrange-nemt-in-metro-atlanta",
    title: "How to Arrange Non-Emergency Medical Transportation in Metro Atlanta",
    description:
      "A step-by-step guide to requesting a ride to medical care in Metro Atlanta: what to prepare, how to plan the timing, and what happens after you ask.",
    category: "riders-families",
    audience: "Riders, families and caregivers",
    kind: "guide",
    featured: true,
    relatedServices: ["medical-appointments", "recurring-care-transportation"],
    genericRequest: true,
    relatedResources: ["medical-transportation-trip-checklist", "what-is-non-emergency-medical-transportation", "wheelchair-accessible-transportation-guide"],
    seoTitle: "How to Arrange NEMT in Metro Atlanta",
    seoDescription:
      "How to request non-emergency medical transportation in Metro Atlanta: details to prepare, timing, mobility needs, return trips and what happens next.",
    cardAction: "Read guide",
  }),
  r({
    slug: "what-is-non-emergency-medical-transportation",
    title: "What Is Non-Emergency Medical Transportation?",
    description:
      "What NEMT is, who it helps, the kinds of trips it covers, and how it differs from an ambulance.",
    category: "riders-families",
    audience: "Riders, families and caregivers",
    kind: "guide",
    relatedServices: ["medical-appointments", "wheelchair-transportation"],
    genericRequest: true,
    relatedResources: ["how-to-arrange-nemt-in-metro-atlanta", "medical-transportation-trip-checklist"],
    seoTitle: "What Is Non-Emergency Medical Transportation?",
    seoDescription:
      "A plain-language guide to non-emergency medical transportation (NEMT): who it is for, common trips, how it differs from an ambulance and how to request it.",
    cardAction: "Read guide",
  }),
  r({
    slug: "dialysis-transportation-guide",
    title: "Recurring Dialysis Transportation: A Guide for Riders and Families",
    description:
      "How to plan reliable transportation for a repeating treatment schedule: pickup details, timing, the ride home and what to tell the transportation team.",
    category: "riders-families",
    audience: "Riders, families and caregivers",
    kind: "guide",
    relatedServices: ["dialysis-transportation", "recurring-care-transportation"],
    relatedResources: ["medical-transportation-trip-checklist", "how-to-arrange-nemt-in-metro-atlanta"],
    seoTitle: "Recurring Dialysis Transportation Guide",
    seoDescription:
      "Planning transportation for a recurring dialysis schedule: days and times to share, pickup details, return trips and how a recurring request is reviewed.",
    cardAction: "Read guide",
  }),
  r({
    slug: "wheelchair-accessible-transportation-guide",
    title: "Wheelchair-Accessible Transportation: What to Know Before Your Ride",
    description:
      "What to share about mobility, pickup and destination access so a wheelchair-accessible trip can be planned properly.",
    category: "riders-families",
    audience: "Riders, families and caregivers",
    kind: "guide",
    relatedServices: ["wheelchair-transportation"],
    relatedResources: ["medical-transportation-trip-checklist", "hospital-discharge-transportation-checklist"],
    seoTitle: "Wheelchair-Accessible Transportation Guide",
    seoDescription:
      "How to prepare for wheelchair-accessible medical transportation: mobility details to share, pickup and destination access, and how a request is confirmed.",
    cardAction: "Read guide",
  }),
  r({
    slug: "hospital-discharge-transportation-checklist",
    title: "Hospital Discharge Transportation Checklist",
    description:
      "The details families and care coordinators should gather to arrange a ride home or onward after a hospital stay, including why timing can change.",
    category: "providers",
    alsoIn: ["riders-families"],
    audience: "Families, caregivers and care coordinators",
    kind: "checklist",
    relatedServices: ["hospital-discharge-transportation", "wheelchair-transportation"],
    relatedResources: ["medical-transportation-trip-checklist", "wheelchair-accessible-transportation-guide"],
    seoTitle: "Hospital Discharge Transportation Checklist",
    seoDescription:
      "A checklist for arranging transportation after a hospital discharge: locations, timing, contacts, mobility needs and pickup instructions.",
    cardAction: "View checklist",
  }),
  r({
    slug: "medical-transportation-trip-checklist",
    title: "Medical Transportation Trip Checklist",
    description:
      "A simple, printable list of the details to have ready before you request a ride to medical care.",
    category: "tools",
    audience: "Anyone arranging a medical trip",
    kind: "tool",
    relatedServices: ["medical-appointments"],
    genericRequest: true,
    relatedResources: ["how-to-arrange-nemt-in-metro-atlanta", "hospital-discharge-transportation-checklist"],
    seoTitle: "Medical Transportation Trip Checklist",
    seoDescription:
      "A printable checklist of details to prepare before requesting non-emergency medical transportation: locations, dates, times, return trip and mobility needs.",
    cardAction: "View checklist",
  }),
];

export const RESOURCE_PATHS = RESOURCES.map((resource) => resource.path);

export function getResource(slug: string): ResourceMeta | undefined {
  return RESOURCES.find((resource) => resource.slug === slug);
}

/** Resources that help with a given service page ("Helpful resources"). */
export function resourcesForService(service: ServiceSlug): ResourceMeta[] {
  // Resources whose primary service this is come first (e.g. the wheelchair guide on the wheelchair page).
  const related = RESOURCES.filter((resource) => resource.relatedServices.includes(service));
  return [...related.filter((r) => r.relatedServices[0] === service), ...related.filter((r) => r.relatedServices[0] !== service)];
}

/** The primary service for a Resource (canonical quote link with ?service=). */
export function primaryServiceFor(resource: ResourceMeta) {
  return SERVICE_CATALOG[resource.relatedServices[0]];
}

/** Hub sections a Resource appears in: its primary category first, then `alsoIn`. */
export function categoriesOf(resource: ResourceMeta): ResourceCategory[] {
  return [resource.category, ...(resource.alsoIn ?? [])];
}

export interface ResourceRequestCta {
  href: string;
  label: string;
  /** Secondary link beside the request button. */
  about: { href: string; label: string };
}

/**
 * The request CTA for a Resource: the canonical service quote link
 * (?service= only), or the generic quote form when `genericRequest` is set.
 */
export function requestCtaFor(resource: ResourceMeta): ResourceRequestCta {
  if (resource.genericRequest) {
    return { href: "/request-transportation", label: "Request a Quote", about: { href: "/services", label: "View transportation services" } };
  }
  const service = primaryServiceFor(resource);
  return { href: service.requestHref, label: `Request ${service.label}`, about: { href: service.path, label: `About ${service.label}` } };
}
