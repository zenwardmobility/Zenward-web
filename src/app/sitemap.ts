import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { SERVICE_PATHS } from "@/lib/service-catalog";
import { getActiveMarkets } from "@/lib/service-area";
import { RESOURCE_PATHS } from "@/lib/resources/catalog";

const ROUTES = [
  "/",
  "/request-transportation",
  "/healthcare-providers",
  "/services",
  ...SERVICE_PATHS,
  // Indexable market hubs (ZW-WEB-04D). Campaign landing pages under
  // /<market>/<campaign> are noindex and deliberately NOT listed here.
  ...getActiveMarkets().map((market) => `/locations/${market.slug}`),
  // Resources hub + the six launch Resources (ZW-WEB-04K).
  "/resources",
  ...RESOURCE_PATHS,
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
