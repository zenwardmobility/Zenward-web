import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { sitemapEntries } from "@/lib/sitemap-entries";

// The organic sitemap; the list and its exclusions live in src/lib/sitemap-entries.ts (ZW-SEO-01).
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(siteUrl);
}
