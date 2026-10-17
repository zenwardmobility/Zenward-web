/**
 * Metadata and structured data for the service pages and /services
 * (ZW-WEB-04C). The market always comes from src/lib/service-area.ts.
 *
 * Structured data is limited to verifiable facts: the service name, the
 * provider (Zenward Mobility), the confirmed operating market and the page
 * URL, plus a BreadcrumbList. No ratings, prices, hours or availability.
 */
import type { Metadata } from "next";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { organizationRef } from "@/lib/organization";
import { areaServedJsonLd, getDefaultMarket } from "@/lib/service-area";
import type { ServiceContent } from "@/lib/services";
import type { CampaignContent } from "@/lib/campaigns";

export function serviceMetadata(service: ServiceContent): Metadata {
  const market = getDefaultMarket();
  return pageMetadata({
    title: `${service.label} in ${market.name}`,
    // ZW-SEO-01: service + market first, so the local qualifier isn't truncated away.
    description: `${service.label} in ${market.name}. ${service.metaDescription}`,
    path: service.path,
  });
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceJsonLd(service: ServiceContent) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.label,
      serviceType: service.label,
      description: service.summary,
      url: absoluteUrl(service.path),
      provider: organizationRef(),
      areaServed: areaServedJsonLd(),
    },
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: service.label, path: service.path },
    ]),
  ];
}

/**
 * Campaign landing pages (ZW-WEB-04D): `noindex, follow`, self-referencing
 * canonical, and excluded from the sitemap. They exist for paid traffic;
 * organic authority stays with /services/* and /locations/<market>. A
 * cross-page canonical is deliberately NOT used, because combining noindex
 * with a canonical to another URL sends search engines conflicting signals.
 */
export function campaignMetadata(campaign: CampaignContent): Metadata {
  const market = getDefaultMarket();
  return {
    ...pageMetadata({
      title: `${campaign.label} in ${market.name}`,
      description: `${campaign.metaDescription} Serving ${market.name}.`,
      path: campaign.path,
    }),
    robots: { index: false, follow: true },
  };
}
