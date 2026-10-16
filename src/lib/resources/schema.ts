import { absoluteUrl, siteName, siteUrl } from "../seo.ts";
import type { ResourceMeta } from "./catalog.ts";

/**
 * Truthful structured data for Resources (ZW-WEB-04K). Guides and checklists
 * get Article with only verifiable properties (headline, description, dates,
 * publisher, mainEntityOfPage). The author is the ORGANIZATION (owner
 * decision, matching the visible "Published by Zenward Mobility"): never an
 * individual person, reviewer, rating or review count. The interactive tool
 * gets BreadcrumbList only.
 */
export function resourceArticleJsonLd(resource: ResourceMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: resource.title,
    description: resource.seoDescription,
    datePublished: resource.publishedDate,
    dateModified: resource.updatedDate,
    author: { "@type": "Organization", name: siteName, url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: { "@type": "ImageObject", url: absoluteUrl("/images/zenward-mobility-logo.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(resource.path) },
  };
}
