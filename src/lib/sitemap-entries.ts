/**
 * The organic sitemap (reviewed in ZW-SEO-01): pages that should rank, and
 * nothing else. Node-loadable (relative imports) so tests check the real list.
 *
 * Deliberately NOT listed (all remain crawlable and linked):
 *   - paid landing pages /<market>/<slug>: noindex, follow (ZW-WEB-04D)
 *   - /request-transportation: the conversion form, reached from every page;
 *     its ?service= variants canonicalise to it
 *   - /privacy, /terms: legal utility pages
 *
 * `lastModified` is given only where a real date exists (Resources). A build
 * timestamp on every URL would claim every page changed on every deploy, which
 * search engines learn to ignore.
 */
import { SERVICE_PATHS } from "./service-catalog.ts";
import { getActiveMarkets } from "./service-area.ts";
import { RESOURCES } from "./resources/catalog.ts";

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
}

export const SITEMAP_PAGES: readonly string[] = [
  "/",
  "/services",
  ...SERVICE_PATHS,
  ...getActiveMarkets().map((market) => `/locations/${market.slug}`),
  "/healthcare-providers",
  "/resources",
  "/about",
  "/contact",
];

export function sitemapEntries(siteUrl: string): SitemapEntry[] {
  return [
    ...SITEMAP_PAGES.map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : 0.6,
    })),
    // The six Resources (ZW-WEB-04K), with their real updated dates.
    ...RESOURCES.map((resource) => ({
      url: `${siteUrl}${resource.path}`,
      lastModified: resource.updatedDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
