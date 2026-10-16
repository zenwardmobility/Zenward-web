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
] as const;

export type ResourceSlug = (typeof RESOURCE_SLUGS)[number];

export function resourcePath(slug: ResourceSlug): string {
  return `/resources/${slug}`;
}
