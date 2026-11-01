// ZENWARD-WEB-SERVICE-WHEELCHAIR-01: the wheelchair-accessible transportation
// page. Checks the owner-approved structure and copy, the four photographs
// (paths, alt text, which one is illustrative), CTAs, SEO and the claim
// boundary (real features only; no capacities, standards or guarantees).
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..");
const root = path.resolve(src, "..");
const read = (rel) => readFileSync(path.join(src, rel), "utf8");
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const { WHEELCHAIR_PAGE: PAGE, WHEELCHAIR_SEO } = await import("./wheelchair-page.ts");
const { SERVICE_CATALOG } = await import("./service-catalog.ts");
const { getDefaultMarket } = await import("./service-area.ts");

const PAGE_FILE = "components/public/WheelchairServicePage.tsx";
const page = () => stripComments(read(PAGE_FILE));

/** All public copy on the page. */
function allText() {
  const parts = [PAGE.hero.eyebrow, PAGE.hero.heading, ...PAGE.hero.paragraphs, PAGE.hero.caption, PAGE.requestLabel];
  parts.push(PAGE.vehicle.heading, ...PAGE.vehicle.paragraphs, PAGE.vehicle.exterior.caption);
  for (const f of PAGE.vehicle.features) parts.push(f.heading, f.text, f.caption);
  parts.push(PAGE.audience.heading, ...PAGE.audience.paragraphs, ...PAGE.audience.cards);
  parts.push(PAGE.trips.heading, PAGE.trips.intro, ...PAGE.trips.items, PAGE.trips.note);
  parts.push(PAGE.expect.heading, ...PAGE.expect.paragraphs, PAGE.expect.seating.heading, PAGE.expect.seating.text, PAGE.expect.seating.caption);
  parts.push(PAGE.steps.heading, ...PAGE.steps.items.flatMap((s) => [s.title, s.description]));
  parts.push(PAGE.area.heading, ...PAGE.area.paragraphs, ...PAGE.area.linked.map((p) => (typeof p === "string" ? p : p.label)));
  parts.push(PAGE.faqHeading, ...PAGE.faq.flatMap((f) => [f.question, f.answer]), PAGE.closing.heading, PAGE.closing.body);
  return parts.join("\n");
}

test("route renders the dedicated page with the owner-approved metadata", () => {
  const route = stripComments(read("app/services/wheelchair-transportation/page.tsx"));
  assert.match(route, /<WheelchairServicePage service=\{service\} \/>/);
  assert.match(route, /pageMetadata\(\{ title: WHEELCHAIR_SEO\.title, description: WHEELCHAIR_SEO\.description, path: service\.path \}\)/);
  assert.ok(!/robots|noindex/.test(route), "indexable");
  assert.equal(SERVICE_CATALOG["wheelchair-transportation"].path, "/services/wheelchair-transportation");
  assert.equal(`${WHEELCHAIR_SEO.title} | Zenward Mobility`, "Wheelchair Transportation in Metro Atlanta, GA | Zenward Mobility");
  assert.equal(
    WHEELCHAIR_SEO.description,
    "Need wheelchair-accessible transportation in Metro Atlanta? Zenward Mobility helps arrange scheduled medical rides. Request a quote or call 678-935-5489.",
  );
  assert.ok(WHEELCHAIR_SEO.description.length <= 160);
  assert.equal(getDefaultMarket().name, "Metro Atlanta", "the copy names the one active market");
});

test("page structure: one H1, the approved H2 order, and no FAQ schema", () => {
  const code = page();
  assert.equal((code.match(/<h1[\s>]/g) ?? []).length, 1);
  const order = [
    "PAGE.hero.heading",
    "PAGE.vehicle.heading",
    "PAGE.audience.heading",
    "PAGE.trips.heading",
    "PAGE.expect.heading",
    "<AssistanceLevelExplainer",
    "PAGE.steps.heading",
    "PAGE.area.heading",
    "PAGE.faqHeading",
    "<ClosingCta",
  ];
  const positions = order.map((needle) => code.indexOf(needle));
  for (const [i, p] of positions.entries()) assert.ok(p > 0, order[i]);
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, "sections in the approved order");
  assert.equal(PAGE.hero.heading, "Wheelchair-Accessible Transportation in Metro Atlanta");
  assert.equal(PAGE.audience.heading, "Wheelchair Transportation That Starts With Your Needs");
  assert.equal(PAGE.trips.heading, "Wheelchair-Accessible Rides for Medical Appointments and Treatments");
  assert.equal(PAGE.expect.heading, "Know What to Expect Before You Travel");
  assert.equal(PAGE.steps.heading, "Arranging Your Ride Is Straightforward");
  assert.equal(PAGE.area.heading, "Wheelchair Transportation in Metro Atlanta, Georgia");
  assert.equal(PAGE.closing.heading, "Need Wheelchair-Accessible Transportation in Metro Atlanta?");
  assert.ok(!/FAQPage/.test(code + read("lib/service-pages.ts")));
  assert.match(code, /serviceJsonLd\(service\)/, "one Service + BreadcrumbList block, shared with the other service pages");
  assert.equal(PAGE.faq.length, 7);
  assert.equal(
    PAGE.faq.find((f) => f.question === "Can I arrange transportation for a family member?").answer,
    "Yes. Family members and caregivers can submit transportation requests on behalf of a passenger. Our team may contact you to clarify the passenger's needs and any additional information required before confirming transportation.",
  );
  assert.equal(PAGE.audience.cards.length, 4);
  assert.equal(PAGE.trips.items.length, 6);
  assert.deepEqual(PAGE.steps.items.map((s) => s.title), ["Tell Us About the Trip", "We Review Your Request", "Confirm the Details", "Finalize Transportation"]);
});

test("photographs: real files, exact alt text, the illustrative hero flagged as such", () => {
  const images = read("lib/images.ts");
  const files = {
    wheelchairAssistanceHero: "public/images/zenward/wheelchair-transportation/zenward-wheelchair-assistance-hero.webp",
    wheelchairRamp: "public/images/zenward/wheelchair-transportation/zenward-wheelchair-accessible-ramp.webp",
    wheelchairSecurementArea: "public/images/zenward/wheelchair-transportation/zenward-wheelchair-securement-area.webp",
    passengerSeating: "public/images/zenward/wheelchair-transportation/zenward-passenger-seating.webp",
    officialVehicleWheelchair: "public/images/zenward-official-nemt-vehicle.webp",
  };
  for (const file of Object.values(files)) assert.ok(existsSync(path.join(root, file)), file);
  for (const file of Object.values(files)) assert.ok(images.includes(`"../../${file}"`), file);
  // The exterior reuses the article's file: no duplicate asset.
  assert.equal((images.match(/zenward-official-nemt-vehicle\.webp/g) ?? []).length, 1);

  const alts = {
    wheelchairAssistanceHero:
      "Illustrative scene of a Zenward Mobility assistant helping a wheelchair passenger board a wheelchair-accessible vehicle using a rear ramp.",
    officialVehicleWheelchair: "White Zenward Mobility wheelchair-accessible vehicle showing the company's branding.",
    wheelchairRamp: "Rear-entry BraunAbility wheelchair ramp deployed on Zenward Mobility's vehicle.",
    wheelchairSecurementArea: "Wheelchair accommodation area with floor securement fittings inside Zenward Mobility's vehicle.",
    passengerSeating: "Passenger seating inside Zenward Mobility's wheelchair-accessible vehicle.",
  };
  for (const [key, alt] of Object.entries(alts)) assert.match(images, new RegExp(`${key}: \\{\\s*src: \\w+,\\s*alt: "${alt.replace(/[.?()]/g, "\\$&")}"`), key);

  assert.equal(PAGE.hero.image, "wheelchairAssistanceHero");
  assert.equal(PAGE.vehicle.exterior.image, "officialVehicleWheelchair");
  assert.deepEqual(PAGE.vehicle.features.map((f) => f.image), ["wheelchairRamp", "wheelchairSecurementArea"]);
  assert.equal(PAGE.expect.seating.image, "passengerSeating");
  assert.deepEqual(
    [PAGE.vehicle.exterior.caption, ...PAGE.vehicle.features.map((f) => f.caption), PAGE.expect.seating.caption],
    [
      "Zenward Mobility's actual wheelchair-accessible transportation vehicle serving Metro Atlanta.",
      "Rear-entry BraunAbility wheelchair ramp on Zenward Mobility's accessible vehicle.",
      "Wheelchair accommodation space and securement fittings inside Zenward's vehicle.",
      "Passenger seating inside Zenward Mobility's transportation vehicle.",
    ],
  );
  // The generated hero carries a visible disclosure caption beneath it.
  assert.equal(PAGE.hero.caption, "Illustrative scene. Actual Zenward vehicle and accessibility features shown below.");
  assert.match(page(), /<figcaption[^>]*>\{PAGE\.hero\.caption\}<\/figcaption>/);
  assert.ok(!existsSync(path.join(root, "public/images/zenward-wheelchair-assistance-hero.webp")), "the unused duplicate hero stays removed");
  // Only the generated hero is ever called illustrative; the real photos are never called illustrative and the hero never "actual".
  assert.ok(!/actual|authentic|real/i.test(alts.wheelchairAssistanceHero));
});

test("images: only the hero loads eagerly; portrait photos keep 3:4, the exterior 4:3; captions are visible", () => {
  const code = page();
  assert.equal((code.match(/\bpriority\b/g) ?? []).length, 1, "priority on the hero only");
  assert.match(code, /aspectClass="aspect-\[16\/10\] lg:aspect-\[4\/3\]"[\s\S]{0,120}priority/);
  assert.equal((code.match(/aspectClass="aspect-3\/4"/g) ?? []).length, 2, "ramp/securement card + seating");
  assert.match(code, /aspectClass="aspect-4\/3"/);
  assert.match(code, /<figcaption/);
  assert.match(code, /md:grid-cols-2/, "ramp and securement side by side from md, stacked below");
  assert.ok(!/title=/.test(code), "no image title attributes");
});

test("CTAs: existing quote form with ?service=, tel link from business.ts, approved labels", () => {
  const code = page();
  assert.equal(SERVICE_CATALOG["wheelchair-transportation"].requestHref, "/request-transportation?service=wheelchair_transportation");
  assert.equal(PAGE.requestLabel, "Request Transportation");
  assert.match(code, /<TrackedLinkButton href=\{service\.requestHref\}/);
  assert.match(code, /requestHref=\{service\.requestHref\}\s*requestLabel=\{PAGE\.requestLabel\}\s*callLabel=\{CALL_LABEL\}/);
  assert.match(code, /const CALL_LABEL = `Call \$\{business\.phoneDisplay\}`/);
  assert.match(read("lib/business.ts"), /phoneHref: `tel:\+1\$\{PHONE_DIGITS\}`/);
  assert.match(read("lib/business.ts"), /PHONE_DIGITS = "6789355489"/);
  assert.ok(!/<form|RequestTransportationForm/.test(code), "no second intake form");
  // In-site links only, to existing routes.
  const links = PAGE.area.linked.filter((p) => typeof p !== "string").map((p) => p.href);
  assert.deepEqual(links, ["/locations/metro-atlanta", "/contact"]);
  for (const route of ["app/locations/[market]/page.tsx", "app/contact/page.tsx", "app/request-transportation/page.tsx"]) assert.ok(existsSync(path.join(src, route)), route);
});

test("claim boundary: only the photographed features; no capacities, standards, certifications or guarantees", () => {
  const text = allText();
  assert.match(text, /rear-entry ramp/);
  assert.match(text, /securement fittings/);
  const banned = [
    /\bADA\b|\bcertif|\bcompliant\b|\bFMVSS\b|\bWC1[89]\b|\bSAE\b|\bcrash[- ]tested\b/i,
    /\bguarantee|\balways (available|on time)\b|\bevery wheelchair\b|\bany wheelchair\b|\ball wheelchairs\b/i,
    /\b\d+\s?(lb|lbs|pounds|kg|inches|in\.|passengers?|seats?|wheelchairs?)\b/i,
    /\bweight (limit|capacity)\b|\bcapacity of\b|\bseats? up to\b|\bup to \d/i,
    /\b(we|zenward) (provide|provides|offer|offers) (stretcher|ambulance)\b/i,
    /\b(lift|lifting|carry|carrying|transfer)\b/i,
    /\bsame[- ]day\b|\b24\s*\/\s*7\b|\$\s?\d|\bfree\b/i,
    /\b(5|five)[- ]star\b|\b(customer|client|google|online) reviews?\b|\btestimonial|\brated\b/i,
  ];
  for (const re of banned) assert.ok(!re.test(text), `matches ${re}`);
  // Request ≠ booking: confirmation always follows review.
  assert.match(text, /before confirming/);
  assert.match(text, /Once the arrangements are agreed upon, the trip can be confirmed\./);
  assert.match(text, /call 911/i);
});
