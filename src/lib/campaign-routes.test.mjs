// ZW-WEB-04D: campaign landing-page routes, preselection, indexing and sitemap.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..");
const { CAMPAIGN_ROUTES, CAMPAIGN_SLUGS, CAMPAIGN_MARKET_SLUG, campaignForPath } = await import("./campaign-routes.ts");

test("exactly four launch campaigns under the current market", () => {
  assert.deepEqual([...CAMPAIGN_SLUGS].sort(), [
    "dialysis-transportation",
    "medical-appointment-transportation",
    "non-emergency-medical-transportation",
    "wheelchair-transportation",
  ]);
  for (const slug of CAMPAIGN_SLUGS) assert.equal(CAMPAIGN_ROUTES[slug].path, `/metro-atlanta/${slug}`);
});

test("campaign market slug matches the default market config", () => {
  const area = readFileSync(path.join(src, "lib/service-area.ts"), "utf8");
  assert.match(area, /const DEFAULT_MARKET_SLUG = "metro-atlanta";/);
  assert.equal(CAMPAIGN_MARKET_SLUG, "metro-atlanta");
  assert.ok(existsSync(path.join(src, "app", CAMPAIGN_MARKET_SLUG, "[campaign]", "page.tsx")));
});

test("Request a Quote preselection per campaign", () => {
  assert.equal(CAMPAIGN_ROUTES["wheelchair-transportation"].requestHref, "/request-transportation?service=wheelchair_transportation");
  assert.equal(CAMPAIGN_ROUTES["dialysis-transportation"].requestHref, "/request-transportation?service=dialysis");
  assert.equal(CAMPAIGN_ROUTES["medical-appointment-transportation"].requestHref, "/request-transportation?service=medical_appointment");
  assert.equal(CAMPAIGN_ROUTES["non-emergency-medical-transportation"].requestHref, "/request-transportation");
});

test("no airport campaign and no airport preselection", () => {
  for (const slug of CAMPAIGN_SLUGS) {
    assert.equal(/airport/.test(slug), false);
    assert.equal(/airport/.test(CAMPAIGN_ROUTES[slug].requestHref), false);
  }
});

test("campaign pages are noindex,follow with a self canonical, and not in the sitemap", () => {
  const pages = readFileSync(path.join(src, "lib/service-pages.ts"), "utf8");
  assert.match(pages, /export function campaignMetadata[\s\S]*?path: campaign\.path[\s\S]*?robots: \{ index: false, follow: true \}/);
  const sitemap = readFileSync(path.join(src, "app/sitemap.ts"), "utf8");
  assert.equal(/campaign/i.test(sitemap.replace(/\/\/.*$/gm, "")), false);
  assert.match(sitemap, /`\/locations\/\$\{market\.slug\}`/);
  const robots = readFileSync(path.join(src, "app/robots.ts"), "utf8");
  assert.equal(/disallow/i.test(robots), false);
});

test("the header recognises campaign paths only", () => {
  assert.equal(campaignForPath("/metro-atlanta/dialysis-transportation")?.slug, "dialysis-transportation");
  assert.equal(campaignForPath("/metro-atlanta/dialysis-transportation/")?.slug, "dialysis-transportation");
  for (const p of ["/", "/services", "/locations/metro-atlanta", "/metro-atlanta/airport-transportation", undefined]) {
    assert.equal(campaignForPath(p), undefined, String(p));
  }
});
