/**
 * Market / service-area configuration — the ONE place a market name lives
 * (ZW-WEB-04B1).
 *
 * Owner decision (ZW-WEB-04B1): Metro Atlanta, Georgia is Zenward Mobility's
 * confirmed initial operating market. The brand stays "Zenward Mobility"
 * (geography-neutral); the site may say where Zenward currently operates.
 *
 * Model:
 *   - `MARKETS` lists only real, owner-confirmed markets. Do not add
 *     speculative or "coming soon" markets here.
 *   - `DEFAULT_MARKET_SLUG` is the market the homepage and site-wide
 *     surfaces (footer, homepage metadata, Organization JSON-LD) describe.
 *   - A future market is ONE new entry here. Pages that need a market other
 *     than the default must select it explicitly, by route (e.g.
 *     /locations/<slug> calling `getMarket(slug)`) or by campaign landing-page
 *     config. The site never infers a visitor's market from IP address,
 *     browser location or headers.
 *
 * Consumers of the default market: HomeHero (eyebrow + H1), homepage FAQ "Where does
 * Zenward operate?", homepage final CTA, PublicFooter, homepage metadata,
 * homepage Organization JSON-LD `areaServed`.
 *
 * Do not list counties or cities here until the owner confirms them.
 */
import { business } from "@/lib/business";

export interface Market {
  /** URL-safe id, e.g. for a future /locations/<slug> route. */
  slug: string;
  /** Reads naturally after "in" / "Serving", e.g. "Metro Atlanta". */
  name: string;
  /** Full state name, used for structured data. */
  state: string;
  /** Inactive markets are kept out of every public surface. */
  active: boolean;
}

const MARKETS: readonly Market[] = [{ slug: "metro-atlanta", name: "Metro Atlanta", state: "Georgia", active: true }];

const DEFAULT_MARKET_SLUG = "metro-atlanta";

/** An active market by slug, or `undefined` (unknown or inactive). */
export function getMarket(slug: string): Market | undefined {
  return MARKETS.find((market) => market.slug === slug && market.active);
}

/** The market the homepage and site-wide surfaces describe. */
export function getDefaultMarket(): Market {
  const market = getMarket(DEFAULT_MARKET_SLUG);
  if (!market) throw new Error(`Default market "${DEFAULT_MARKET_SLUG}" is missing or inactive.`);
  return market;
}

/** All active markets (e.g. for a future /locations index or sitemap). */
export function getActiveMarkets(): Market[] {
  return MARKETS.filter((market) => market.active);
}

/**
 * Homepage hero H1, split into its three designed lines (ZW-WEB-04B2). The
 * middle line ("Transportation") carries the Arrival Gold accent. Joined with
 * spaces, it reads "Non-Emergency Medical Transportation Across <market>".
 */
export function heroHeadlineLines(market: Market = getDefaultMarket()): {
  lead: string;
  accent: string;
  tailPrefix: string;
  marketName: string;
} {
  return { lead: "Non-Emergency Medical", accent: "Transportation", tailPrefix: "Across", marketName: market.name };
}

/** Short location line, e.g. "Serving Metro Atlanta". */
export function servingLine(market: Market = getDefaultMarket()): string {
  return `Serving ${market.name}`;
}

/** Answer for the homepage FAQ "Where does Zenward operate?". */
export function serviceAreaFaqAnswer(market: Market = getDefaultMarket()): string {
  return `Zenward currently provides non-emergency medical transportation in ${market.name}. Call ${business.phoneDisplay} or request a quote so our team can confirm whether we can provide your specific trip.`;
}

/** Homepage <title> stem and meta description (market named once in each). */
export function homeMetadataCopy(market: Market = getDefaultMarket()): { title: string; description: string } {
  return {
    title: `Non-Emergency Medical Transportation in ${market.name}`,
    description: `Zenward Mobility provides non-emergency medical transportation in ${market.name} for appointments, dialysis, rehabilitation, hospital discharge and recurring care, including wheelchair-accessible trips. Request a quote or call ${business.phoneDisplay}.`,
  };
}

/** schema.org `areaServed` value for the Organization JSON-LD. */
export function areaServedJsonLd(market: Market = getDefaultMarket()) {
  return {
    "@type": "Place",
    name: market.name,
    containedInPlace: { "@type": "State", name: market.state },
  };
}
