// ZW-WEB-04F: owner-confirmed trust and operating claims. Checks the approved
// wording in src/lib/trust.ts, where it is wired, and that public copy carries
// no guarantee, invented hours, 24/7, fake social proof or software language.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..");
const read = (rel) => readFileSync(path.join(src, rel), "utf8");

const trust = await import("./trust.ts");
const { TRUST_POINTS, QUOTE_RESPONSE_LINE, CONTACT_RESPONSE_LINE, RESPONSE_IS_NOT_CONFIRMATION, OPERATING_STANDARDS } = trust;
const { resolveServiceParam, isPublicServiceType } = await import("./request-intake/service-types.ts");

/** Every file that renders public copy: pages, public components and copy modules. */
function publicCopyFiles() {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(tsx|ts)$/.test(name) && !/\.test\./.test(name)) files.push(full);
    }
  };
  walk(path.join(src, "app"));
  walk(path.join(src, "components/public"));
  for (const rel of ["lib/trust.ts", "lib/services.ts", "lib/campaigns.ts", "lib/service-area.ts", "lib/business.ts"]) {
    files.push(path.join(src, rel));
  }
  return files.map((file) => ({ file: path.relative(src, file), text: stripComments(readFileSync(file, "utf8")) }));
}

/** Removes JS/JSX comments, which document the banned wording rather than publish it. */
function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

/** All user-facing trust strings in trust.ts. */
function trustStrings() {
  return [
    ...TRUST_POINTS.flatMap((p) => [`${p.label}: ${p.detail}`, p.compactLabel, p.detail]),
    QUOTE_RESPONSE_LINE,
    CONTACT_RESPONSE_LINE,
    RESPONSE_IS_NOT_CONFIRMATION,
    ...Object.values(OPERATING_STANDARDS).flatMap((s) => [s.category, s.title, s.description]),
  ];
}

function assertNoMatch(pattern, label) {
  const hits = publicCopyFiles().filter(({ text }) => pattern.test(text)).map(({ file }) => file);
  assert.deepEqual(hits, [], `${label} found in: ${hits.join(", ")}`);
}

test("the four approved trust labels, in order", () => {
  assert.deepEqual(
    TRUST_POINTS.map((p) => p.label),
    ["Licensed & Insured", "On-Time Transportation", "Trained & Vetted Drivers", "Response Within 2 Hours"],
  );
  assert.deepEqual(
    TRUST_POINTS.map((p) => p.compactLabel),
    ["Licensed & Insured", "On-Time Transportation", "Trained & Vetted Drivers", "2-Hour Response During Working Hours"],
  );
});

test("2-hour wording is a response during working hours, never a confirmed ride", () => {
  assert.equal(QUOTE_RESPONSE_LINE, "Requests received during working hours are reviewed and answered within 2 hours.");
  assert.equal(CONTACT_RESPONSE_LINE, "We reply within 2 hours during working hours.");
  const twoHour = trustStrings().filter((s) => /2[- ]hours?/i.test(s));
  assert.ok(twoHour.length >= 4);
  for (const s of twoHour) {
    assert.match(s, /working hours/i, `missing working-hours qualifier: ${s}`);
    assert.doesNotMatch(s, /confirm(ed)?\s+(within|in)\s+2|booked within|ride within/i, s);
  }
  assert.match(RESPONSE_IS_NOT_CONFIRMATION, /isn't a confirmed ride/);
});

test("punctuality is a standard, not a guarantee", () => {
  assert.ok(trustStrings().some((s) => /Punctuality is our standard/.test(s)));
  for (const s of trustStrings()) assert.doesNotMatch(s, /guarantee|100\s?%|\balways\b/i, s);
  assertNoMatch(/guaranteed on[- ]time|on[- ]time guarantee|always on time|100\s?%\s*(on[- ]time|guarantee|punctual|reliable)|we guarantee|guaranteed (arrival|pickup|punctuality)/i, "guarantee wording");
});

test("no invented operating hours or 24/7 wording", () => {
  assertNoMatch(/\b\d{1,2}(:\d{2})?\s?(a\.?m\.?|p\.?m\.?)(?![a-z])|\bMon(day)?\s*(–|-|to|through)\s*(Fri|Sat|Sun)|seven days a week|7 days a week|open daily/i, "operating hours");
  assertNoMatch(/24\s*\/\s*7|24 hours a day|around the clock|instant (response|reply|confirmation)|immediate confirmation/i, "24/7 or instant wording");
});

test("no fake ratings, reviews, testimonials or counts", () => {
  assertNoMatch(/aggregateRating|ratingValue|reviewCount|testimonial|★|\b[1-5](\.\d)?\s?stars?\b|\b\d[\d,]*\+?\s+(trips|rides|reviews|passengers|vehicles)\b|years in business/i, "social proof");
});

test("no unconfirmed credentials in trust copy or public pages", () => {
  for (const s of trustStrings()) assert.doesNotMatch(s, /\bCPR\b|\bADA\b|certif|licen[cs]e (number|no\.)|#\s?\d{4,}/i, s);
  assertNoMatch(/\bCPR\b|\bADA\b/, "CPR/ADA");
});

test("trust copy reads as a transportation company, not software", () => {
  const files = ["lib/trust.ts", "components/public/TrustStrip.tsx"];
  for (const rel of files) {
    assert.doesNotMatch(read(rel), /Nemryn|\bCRM\b|AI-powered|\bplatform\b|operating system|\bsmart\b|intelligent|optimi[sz]ation|automation/i, rel);
  }
});

test("trust layer is wired into the approved pages", () => {
  assert.match(read("app/page.tsx"), /<TrustStrip\b/);
  assert.match(read("app/page.tsx"), /OPERATING_STANDARDS\.punctuality/);
  assert.match(read("components/public/ServicePage.tsx"), /<TrustStrip variant="compact"/);
  assert.match(read("components/public/CampaignPage.tsx"), /<TrustStrip variant="compact" tone="dark"/);
  assert.match(read("app/locations/[market]/page.tsx"), /<TrustStrip variant="compact" tone="dark"/);
  assert.match(read("app/request-transportation/page.tsx"), /\{QUOTE_RESPONSE_LINE\}/);
  assert.match(read("app/contact/page.tsx"), /\{CONTACT_RESPONSE_LINE\}/);
  assert.match(read("app/about/page.tsx"), /OPERATING_STANDARDS\[key\]/);
  // ZW-WEB-04L: the provider page renders PROVIDER_TRUST_ORDER, which includes the communication standard.
  assert.match(read("app/healthcare-providers/page.tsx"), /PROVIDER_TRUST_ORDER\.map\(\(key\) => \{\s*const standard = OPERATING_STANDARDS\[key\];/);
  assert.match(read("lib/trust.ts"), /PROVIDER_TRUST_ORDER: OperatingStandardKey\[\] = \[[^\]]*"communication"/);
  // The request page keeps its not-a-booking statement next to the 2-hour line.
  assert.match(read("app/request-transportation/page.tsx"), /a request, not a confirmed booking/);
});

test("campaign indexing is unchanged", () => {
  assert.match(read("lib/service-pages.ts"), /export function campaignMetadata[\s\S]*?robots: \{ index: false, follow: true \}/);
  assert.doesNotMatch(read("app/sitemap.ts"), /CAMPAIGN|metro-atlanta\//);
});

test("airport and Nemryn intake are untouched by the trust layer", () => {
  assert.equal(resolveServiceParam("airport_transportation"), "airport_transportation");
  assert.equal(isPublicServiceType("airport_transportation"), true);
  for (const rel of ["lib/request-intake/adapter.ts", "lib/request-intake/nemryn-mapping.ts", "app/request-transportation/actions.ts"]) {
    assert.doesNotMatch(read(rel), /lib\/trust|TrustStrip|TRUST_POINTS|OPERATING_STANDARDS/, `${rel} must not depend on the trust layer`);
  }
  assert.doesNotMatch(read("lib/trust.ts"), /^import /m, "trust.ts stays dependency-free");
});
