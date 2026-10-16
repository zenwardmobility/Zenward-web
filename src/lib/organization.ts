/**
 * The ONE Organization structured-data block for Zenward Mobility
 * (ZW-WEB-04L). Truthful, owner-confirmed fields only: name, URL, logo,
 * description, slogan, telephone and the confirmed operating market.
 *
 * Deliberately absent (not owner-confirmed for publication): street address,
 * geo coordinates, opening hours, reviews, ratings, price range, founding
 * date, employee count, sameAs profiles. It is NOT a LocalBusiness: that
 * type expects an address and hours, which Zenward has not published.
 *
 * Other schema (Service, Article publisher/author) points at this entity by
 * `@id` rather than restating it.
 *
 * Relative imports only (node-testable).
 */
import { absoluteUrl, siteDescription, siteName, siteTagline, siteUrl } from "./seo.ts";
import { business } from "./business.ts";
import { areaServedJsonLd } from "./service-area.ts";

export const ORGANIZATION_ID = `${siteUrl}/#organization`;

/** A reference to the Organization for use inside other schema (provider, publisher). */
export function organizationRef() {
  return { "@type": "Organization", "@id": ORGANIZATION_ID, name: siteName, url: siteUrl };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteName,
    slogan: siteTagline,
    description: siteDescription,
    url: siteUrl,
    logo: absoluteUrl("/images/zenward-mobility-logo.png"),
    telephone: business.phoneHref.replace("tel:", ""),
    areaServed: areaServedJsonLd(),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: business.phoneHref.replace("tel:", ""),
      contactType: "customer service",
      availableLanguage: "English",
      areaServed: areaServedJsonLd(),
    },
  };
}
