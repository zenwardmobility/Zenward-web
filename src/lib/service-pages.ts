/**
 * Metadata and structured data for the service pages and /services
 * (ZW-WEB-04C). The market always comes from src/lib/service-area.ts.
 *
 * Structured data is limited to verifiable facts: the service name, the
 * provider (Zenward Mobility), the confirmed operating market and the page
 * URL, plus a BreadcrumbList. No ratings, prices, hours or availability.
 */
import type { Metadata } from "next";
import { absoluteUrl, pageMetadata, siteName, siteUrl } from "@/lib/seo";
import { areaServedJsonLd, getDefaultMarket } from "@/lib/service-area";
import type { ServiceContent } from "@/lib/services";

export function serviceMetadata(service: ServiceContent): Metadata {
  const market = getDefaultMarket();
  return pageMetadata({
    title: `${service.label} in ${market.name}`,
    description: `${service.metaDescription} Serving ${market.name}.`,
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
      provider: { "@type": "Organization", name: siteName, url: siteUrl },
      areaServed: areaServedJsonLd(),
    },
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
      { name: service.label, path: service.path },
    ]),
  ];
}
