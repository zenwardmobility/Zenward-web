// ZW-SEO-01: initial organic search launch. Indexability, the organic
// sitemap, robots, distinct titles (no homepage/hub cannibalisation), concise
// descriptions that keep the market, one H1, canonicals, local-SEO boundaries
// and the unchanged measurement / intake / policy state.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..");
const root = path.resolve(src, "..");
const read = (rel) => readFileSync(path.join(src, rel), "utf8");
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const { sitemapEntries, SITEMAP_PAGES } = await import("./sitemap-entries.ts");
const { SERVICE_CATALOG, SERVICE_PATHS } = await import("./service-catalog.ts");
const { getActiveMarkets, getDefaultMarket, homeMetadataCopy } = await import("./service-area.ts");
const { RESOURCES } = await import("./resources/catalog.ts");
const { pageMetadata } = await import("./seo.ts");
const { MEASUREMENT_APPROVED } = await import("./analytics/google-ads.ts");
const { CAMPAIGN_ROUTES, CAMPAIGN_MARKET_SLUG } = await import("./campaign-routes.ts");
const CAMPAIGN_PATHS = Object.keys(CAMPAIGN_ROUTES).map((slug) => `/${CAMPAIGN_MARKET_SLUG}/${slug}`);

const market = getDefaultMarket();
const SITE = "https://www.zenwardmobility.com";

// ================================================================ sitemap + robots

test("organic sitemap: the pages that should rank, and nothing else", () => {
  const urls = sitemapEntries(SITE).map((e) => e.url.replace(SITE, ""));
  const expected = [
    "/", "/services", ...SERVICE_PATHS, "/locations/metro-atlanta", "/healthcare-providers", "/resources", "/about", "/contact",
    ...RESOURCES.map((r) => r.path),
  ];
  assert.deepEqual([...urls].sort(), [...expected].sort());
  assert.equal(new Set(urls).size, urls.length, "no duplicate URLs");
  assert.equal(urls.length, 21);
  for (const excluded of ["/request-transportation", "/privacy", "/terms"]) assert.ok(!urls.includes(excluded), excluded);
  assert.ok(!urls.some((u) => /^\/metro-atlanta\//.test(u)), "paid landing pages stay out of the sitemap");
  assert.equal(CAMPAIGN_PATHS.length, 4);
  for (const p of CAMPAIGN_PATHS) assert.ok(!urls.includes(p), p);
  for (const u of urls) assert.ok(!/[?#]|\/$/.test(u.slice(1)), `clean URL ${u}`);
});

test("sitemap lastModified only where a real date exists (Resources); no build timestamps", () => {
  for (const entry of sitemapEntries(SITE)) {
    const resource = RESOURCES.find((r) => `${SITE}${r.path}` === entry.url);
    if (resource) assert.equal(entry.lastModified, resource.updatedDate);
    else assert.equal(entry.lastModified, undefined, entry.url);
  }
  assert.ok(!/new Date\(/.test(read("lib/sitemap-entries.ts") + read("app/sitemap.ts")));
  assert.match(read("app/sitemap.ts"), /return sitemapEntries\(siteUrl\);/);
});

test("robots: everything crawlable (so noindex is seen), sitemap advertised, no staging directives", () => {
  const robots = stripComments(read("app/robots.ts"));
  assert.match(robots, /userAgent: "\*",\s*allow: "\/"/);
  assert.match(robots, /sitemap: `\$\{siteUrl\}\/sitemap\.xml`/);
  assert.ok(!/disallow|noindex|nofollow/i.test(robots));
  const layout = stripComments(read("app/layout.tsx"));
  assert.ok(!/robots\s*:/.test(layout), "no site-wide robots directive");
});

// ================================================================ indexability + canonicals

test("organic pages are indexable and self-canonical; paid landing pages noindex, follow, self-canonical", () => {
  for (const rel of ["app/page.tsx", "app/services/page.tsx", "app/about/page.tsx", "app/contact/page.tsx", "app/healthcare-providers/page.tsx", "app/resources/page.tsx", "app/resources/[slug]/page.tsx", "app/locations/[market]/page.tsx", "lib/service-pages.ts"]) {
    const code = stripComments(read(rel));
    const organic = rel === "lib/service-pages.ts" ? code.slice(0, code.indexOf("export function campaignMetadata")) : code;
    assert.ok(!/robots\s*:|noindex/.test(organic), rel);
  }
  assert.match(read("lib/service-pages.ts"), /export function campaignMetadata[\s\S]*?path: campaign\.path[\s\S]*?robots: \{ index: false, follow: true \}/);
  const m = pageMetadata({ title: "X", description: "Y", path: "/services/dialysis-transportation" });
  assert.equal(m.alternates.canonical, `${m.openGraph.url}`);
  assert.ok(!/[?#]/.test(m.alternates.canonical));
  // The request form canonicalises its ?service= variants to the bare path.
  assert.match(read("app/request-transportation/page.tsx"), /path: "\/request-transportation",/);
});

// ================================================================ titles / descriptions / H1

function titles() {
  const t = {
    "/": homeMetadataCopy().title,
    "/locations/metro-atlanta": `NEMT in ${market.name}: Services & How to Request`,
    "/healthcare-providers": `Healthcare Provider Transportation in ${market.name}`,
  };
  for (const [rel, route] of [["app/services/page.tsx", "/services"], ["app/about/page.tsx", "/about"], ["app/contact/page.tsx", "/contact"], ["app/resources/page.tsx", "/resources"]]) {
    t[route] = read(rel).match(/title: "([^"]+)"/)[1];
  }
  for (const s of Object.values(SERVICE_CATALOG)) t[s.path] = `${s.label} in ${market.name}`;
  for (const r of RESOURCES) t[r.path] = r.seoTitle;
  return t;
}

test("indexable titles are unique; homepage and Metro Atlanta hub no longer compete", () => {
  const t = titles();
  const values = Object.values(t);
  assert.equal(new Set(values).size, values.length, JSON.stringify(t, null, 1));
  assert.equal(t["/"], `Non-Emergency Medical Transportation in ${market.name}`);
  assert.match(read("app/locations/[market]/page.tsx"), /title: `NEMT in \$\{market\.name\}: Services & How to Request`/);
  assert.ok(!t["/locations/metro-atlanta"].includes("Non-Emergency Medical Transportation"), "the hub no longer repeats the homepage head term");
  for (const v of values) assert.ok(!/Zenward Mobility/.test(v), "the layout template adds the brand once");
  for (const v of values) assert.ok(`${v} | Zenward Mobility`.length <= 75, v);
});

test("descriptions: concise, market-led on service pages, no unsupported claims", () => {
  // Service pages: "<label> in <market>. <sentence>", so the market survives truncation.
  assert.match(read("lib/service-pages.ts"), /description: `\$\{service\.label\} in \$\{market\.name\}\. \$\{service\.metaDescription\}`/);
  const services = read("lib/services.ts");
  const metas = [...services.matchAll(/metaDescription:\s*\n\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.equal(metas.length, 8);
  const labels = Object.values(SERVICE_CATALOG).map((s) => s.label);
  for (const label of labels) {
    const i = services.indexOf(`SERVICE_CATALOG["${Object.values(SERVICE_CATALOG).find((s) => s.label === label).slug}"]`);
    const meta = services.slice(i).match(/metaDescription:\s*\n\s*"([^"]+)"/)[1];
    const full = `${label} in ${market.name}. ${meta}`;
    assert.ok(full.length <= 160, `${full.length}: ${full}`);
  }
  const home = homeMetadataCopy().description;
  assert.ok(home.length <= 160, String(home.length));
  const hub = read("app/locations/[market]/page.tsx").match(/description: `(NEMT in [^`]+)`/)[1].replace("${market.name}", market.name);
  assert.ok(hub.length <= 160);
  const svc = read("app/services/page.tsx").match(/description: `(Compare [^`]+)`/)[1].replace("${market.name}", market.name);
  assert.ok(svc.length <= 170);
  for (const d of [home, hub, svc, ...metas]) {
    assert.ok(!/\bbest\b|top[- ]rated|#1|24\s*\/\s*7|always on time|guarantee|same[- ]day|medicaid|medicare|insurance|cheap|lowest|ADA|CPR|certified/i.test(d), d);
  }
});

test("one H1 per organic page template", () => {
  const files = ["components/public/HomeHero.tsx", "components/public/ServicePage.tsx", "components/public/resources/ResourcePage.tsx", "app/locations/[market]/page.tsx", "app/healthcare-providers/page.tsx", "app/services/page.tsx", "app/about/page.tsx", "app/contact/page.tsx", "app/resources/page.tsx", "app/privacy/page.tsx", "app/terms/page.tsx"];
  for (const rel of files) assert.equal((stripComments(read(rel)).match(/<h1[\s>]/g) ?? []).length, 1, rel);
  assert.equal((stripComments(read("app/page.tsx")).match(/<h1[\s>]/g) ?? []).length, 0, "the homepage H1 lives in HomeHero");
});

// ================================================================ links + performance

test("internal links: homepage links to the Metro Atlanta hub; no footer link farm", () => {
  assert.match(read("app/page.tsx"), /href="\/locations\/metro-atlanta"/);
  const footer = stripComments(read("components/public/PublicFooter.tsx"));
  assert.ok((footer.match(/href: "/g) ?? []).length <= 10, "footer stays restrained");
  assert.ok(!/\/services\/(dialysis|wheelchair)/.test(footer), "no service-keyword link block in the footer");
});

test("first-viewport hero images load eagerly on service, provider, hub and home pages", () => {
  assert.match(read("components/public/ServicePage.tsx"), /sizes="\(min-width: 1024px\) 34rem, 100vw"[\s\S]{0,200}priority/);
  assert.match(read("app/healthcare-providers/page.tsx"), /sizes="\(min-width: 1024px\) 30rem, 100vw"\s*priority/);
  assert.match(read("app/locations/[market]/page.tsx"), /priority/);
  assert.match(read("components/public/HomeHero.tsx"), /priority/);
});

// ================================================================ boundaries

test("local-SEO boundary: Metro Atlanta only; no city/county pages or claims", () => {
  assert.deepEqual(getActiveMarkets().map((m) => m.slug), ["metro-atlanta"]);
  const routes = [];
  const walk = (dir) => { for (const n of readdirSync(dir)) { const f = path.join(dir, n); if (statSync(f).isDirectory()) { routes.push(path.relative(path.join(src, "app"), f)); walk(f); } } };
  walk(path.join(src, "app"));
  for (const r of routes) assert.ok(!/marietta|decatur|alpharetta|roswell|sandy|smyrna|fulton|dekalb|cobb|gwinnett|county|zip/i.test(r), r);
  for (const u of SITEMAP_PAGES) assert.ok(!/marietta|decatur|county/i.test(u), u);
});

test("no GBP, review/rating schema, Google Ads activation, GA4/GTM or sink; intake and policies unchanged", () => {
  assert.ok(!/sameAs/.test(stripComments(read("lib/organization.ts"))));
  assert.equal(MEASUREMENT_APPROVED, false);
  const all = [];
  const walk = (dir) => { for (const n of readdirSync(dir)) { const f = path.join(dir, n); if (statSync(f).isDirectory()) walk(f); else if (/\.(ts|tsx)$/.test(n)) all.push(f); } };
  walk(src);
  for (const f of all) {
    const code = stripComments(readFileSync(f, "utf8"));
    assert.ok(!/aggregateRating|reviewCount|"@type": "Review"|googletagmanager|gtag\(|dataLayer\.push/.test(code), f);
    if (!f.endsWith(path.join("analytics", "events.ts"))) assert.ok(!/registerAnalyticsSink\(/.test(code), f);
  }
  // Intake contract untouched by SEO: the mapping still builds the same body and nothing SEO-related reaches it.
  const mapping = stripComments(read("lib/request-intake/nemryn-mapping.ts"));
  assert.ok(!/utm_|gclid|\bseo\b|sitemap/i.test(mapping));
  // Policies keep their 04L/04M statements.
  assert.match(read("app/privacy/page.tsx"), /does not load Google Analytics,\s+Google Tag Manager or Google Ads tags/);
  assert.match(read("app/terms/page.tsx"), /A reply is not a confirmation\./);
});

test("SEO-01 documents exist and fabricate nothing", () => {
  const gsc = readFileSync(path.join(root, "docs/product/google-search-console-launch-checklist.md"), "utf8");
  assert.match(gsc, /Domain property/);
  assert.match(gsc, /\| Date \| Indexed pages \| Impressions \| Clicks \| CTR \| Average position \| Top query \| Top page \| Qualified transportation requests \| Notes\/actions \|/);
  assert.match(gsc, /No verification token is in the repository/);
  for (const doc of ["seo-keyword-map.md", "seo-content-roadmap.md", "seo-competitor-opportunity-map.md", "first-customer-acquisition-plan.md"]) {
    const text = readFileSync(path.join(root, "docs/product", doc), "utf8");
    assert.ok(text.length > 500, doc);
  }
});
