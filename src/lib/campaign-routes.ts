/**
 * Paid-search campaign landing pages (ZW-WEB-04D): routes and quote links
 * only. Pure data with relative imports, so node tests and the client header
 * can use it. Page content lives in src/lib/campaigns.ts.
 *
 * Deliberately small: four launch pages for the current market. No city
 * pages, no Airport page (its intake is contract-gated; see
 * src/lib/request-intake/service-types.ts), and no rehabilitation, discharge,
 * senior or recurring pages yet.
 *
 * Indexing: campaign pages are `noindex, follow` and excluded from the
 * sitemap. Organic authority stays with /services/* and /locations/<market>.
 */
import { SERVICE_CATALOG } from "./service-catalog.ts";

/** Must equal the default market's slug in src/lib/service-area.ts (test-enforced). */
export const CAMPAIGN_MARKET_SLUG = "metro-atlanta";

export type CampaignSlug =
  | "non-emergency-medical-transportation"
  | "wheelchair-transportation"
  | "dialysis-transportation"
  | "medical-appointment-transportation";

export interface CampaignRoute {
  slug: CampaignSlug;
  path: string;
  /** Request a Quote destination: preselected for live services, plain for the broad page. */
  requestHref: string;
  /** The organic page that owns this topic (linked from the campaign page). */
  organicPath: string;
}

const route = (slug: CampaignSlug, requestHref: string, organicPath: string): CampaignRoute => ({
  slug,
  path: `/${CAMPAIGN_MARKET_SLUG}/${slug}`,
  requestHref,
  organicPath,
});

export const CAMPAIGN_ROUTES: Record<CampaignSlug, CampaignRoute> = {
  "non-emergency-medical-transportation": route(
    "non-emergency-medical-transportation",
    "/request-transportation",
    `/locations/${CAMPAIGN_MARKET_SLUG}`,
  ),
  "wheelchair-transportation": route(
    "wheelchair-transportation",
    SERVICE_CATALOG["wheelchair-transportation"].requestHref,
    SERVICE_CATALOG["wheelchair-transportation"].path,
  ),
  "dialysis-transportation": route(
    "dialysis-transportation",
    SERVICE_CATALOG["dialysis-transportation"].requestHref,
    SERVICE_CATALOG["dialysis-transportation"].path,
  ),
  "medical-appointment-transportation": route(
    "medical-appointment-transportation",
    SERVICE_CATALOG["medical-appointments"].requestHref,
    SERVICE_CATALOG["medical-appointments"].path,
  ),
};

export const CAMPAIGN_SLUGS = Object.keys(CAMPAIGN_ROUTES) as CampaignSlug[];

/** The campaign whose path matches `pathname`, if any (used by the header). */
export function campaignForPath(pathname: string | null | undefined): CampaignRoute | undefined {
  if (!pathname) return undefined;
  const clean = pathname.replace(/\/+$/, "");
  return CAMPAIGN_SLUGS.map((slug) => CAMPAIGN_ROUTES[slug]).find((c) => c.path === clean);
}
