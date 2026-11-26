/**
 * Resource slugs and canonical paths only (ZW-WEB-04K). The Transportation
 * Assistant imports this tiny module, not the catalogue, so its lazy-loaded
 * bundle carries link targets and nothing else (no titles, descriptions or
 * article text). Pure data, node-testable.
 */
export const RESOURCE_SLUGS = [
  "what-is-non-emergency-medical-transportation",
  "how-to-arrange-nemt-in-metro-atlanta",
  "dialysis-transportation-guide",
  "wheelchair-accessible-transportation-guide",
  "hospital-discharge-transportation-checklist",
  "medical-transportation-trip-checklist",
  // ZW-SEO-KW-01 Guide 1 (owner-approved REV 2; local implementation 2026-11-26).
  "no-ride-home-from-the-hospital",
] as const;

export type ResourceSlug = (typeof RESOURCE_SLUGS)[number];

export function resourcePath(slug: ResourceSlug): string {
  return `/resources/${slug}`;
}
