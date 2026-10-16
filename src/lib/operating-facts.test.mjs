// ZW-WEB-04I: canonical operating/commercial facts, their public answers,
// future activation, the assistant's commercial answers and claim discipline.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..");
const read = (rel) => readFileSync(path.join(src, rel), "utf8");

const F = await import("./operating-facts.ts");
const R = await import("./assistant/responses.ts");
const S = await import("./assistant/safety.ts");
const { SERVICE_ORDER } = await import("./service-catalog.ts");
const { business } = await import("./business.ts");
const { QUOTE_RESPONSE_LINE } = await import("./trust.ts");

const CTX = { marketName: "Metro Atlanta", summaries: Object.fromEntries(SERVICE_ORDER.map((s) => [s, "x"])) };
const say = (text) => R.respond({ kind: "text", text }, CTX);
const textOf = (r) => [...r.paragraphs, ...(r.steps ?? []), ...r.actions.map((a) => a.label)].join(" ");
const hrefs = (r) => r.actions.filter((a) => a.kind !== "reply").map((a) => a.href);

const publicAnswers = () => [
  ...Object.values(F.CONFIRMED),
  ...Object.keys(F.OPERATING_FACTS).map((k) => F.factAnswer(k)),
  ...Object.values(F.commercialFaq()).flatMap((e) => [e.question, e.answer]),
];

/** Positive commercial claims that are NOT owner-confirmed and must never be published. */
const UNCONFIRMED_CLAIMS = [
  /\b24\s*\/\s*7\b|\balways available\b|\baround the clock\b/i,
  /same[- ]day (is )?(guaranteed|available|service available)|\bguarantee/i,
  /\b(we|zenward) (accept|take|bill)s? (medicaid|medicare|insurance|cards?|credit|cash)\b|\b(medicaid|medicare|insurance) accepted\b/i,
  /\bprivate[- ]pay\b|\bcredit cards?\b|\bcash\b/i,
  /\b(mon|tues|wednes|thurs|fri|satur|sun)day\b|\b\d{1,2}(:\d{2})?\s?(am|pm)\b|\bopening hours\b/i,
  /\b(cancellation|no[- ]show|wait[- ]time|late) fees?\b|\brefunds?\b|\bdeposits?\b/i,
  /\$\s?\d|\bper mile\b|\bstarting (at|from)\b|\bflat rate\b/i,
  /\b(all|entire|whole) (of )?(metro atlanta|georgia)\b|\bstatewide\b|\bcount(y|ies)\b/i,
  /\bportal\b|\bcontract billing\b|\bmonthly invoic|\baccount manager\b|\bSLA\b|\bAPI\b/,
];

// ------------------------------------------------------------- model

test("facts model: confirmed facts are restated from canonical sources; unknowns have explicit internal status", () => {
  assert.equal(F.CONFIRMED.response, QUOTE_RESPONSE_LINE);
  assert.equal(F.CONFIRMED.pricing, "Pricing is confirmed after Zenward reviews the transportation request and trip details.");
  assert.match(F.CONFIRMED.business, /non-emergency medical transportation in Metro Atlanta/);
  assert.match(F.CONFIRMED.notABooking, /isn't a confirmed ride.*reviews availability, trip details and pricing/);
  const expected = {
    workingHours: "unpublished",
    paymentMethods: "unconfirmed",
    coverage: "unconfirmed",
    serviceAreaDetail: "unconfirmed",
    sameDay: "unconfirmed",
    advanceNotice: "unconfirmed",
    cancellation: "needs_review",
    noShow: "needs_review",
    waitTime: "needs_review",
    facilityBilling: "unconfirmed",
  };
  for (const [key, status] of Object.entries(expected)) {
    assert.equal(F.OPERATING_FACTS[key].status, status, key);
    assert.equal(F.OPERATING_FACTS[key].statement, undefined, `${key} must not carry a statement until confirmed`);
  }
});

test("future activation: a confirmed fact's owner statement replaces the hand-off everywhere it is used", () => {
  const facts = structuredClone(F.OPERATING_FACTS);
  facts.workingHours = { ...facts.workingHours, status: "confirmed", statement: "OWNER HOURS STATEMENT" };
  assert.equal(F.factAnswer("workingHours", facts), "OWNER HOURS STATEMENT");
  assert.equal(F.commercialFaq(facts).hours.answer, "OWNER HOURS STATEMENT");
  // A confirmed status without a statement still falls back (never publishes an empty answer).
  facts.coverage = { ...facts.coverage, status: "confirmed" };
  assert.equal(F.factAnswer("coverage", facts), F.OPERATING_FACTS.coverage.fallback);
  // The live facts are unchanged.
  assert.match(F.factAnswer("workingHours"), /aren't published here yet/);
});

test("no internal status or placeholder language reaches the public", () => {
  for (const text of publicAnswers()) {
    assert.doesNotMatch(text, /\b(unconfirmed|unknown|unpublished|needs[_ ]review|owner decision|TBD|to be confirmed|coming soon|placeholder)\b/i, text);
  }
});

test("every public commercial answer avoids unconfirmed claims and offers a next step", () => {
  for (const text of publicAnswers()) for (const re of UNCONFIRMED_CLAIMS) assert.doesNotMatch(text, re, text);
  for (const key of Object.keys(F.OPERATING_FACTS)) {
    const answer = F.factAnswer(key);
    assert.ok(/678-935-5489|request|call|contact|send us/i.test(answer), `${key} has no next step: ${answer}`);
  }
  assert.equal(
    F.factAnswer("workingHours"),
    "Our exact working hours aren't published here yet. Transportation requests received during working hours are reviewed and answered within 2 hours. You can also call 678-935-5489.",
  );
  assert.equal(
    F.factAnswer("coverage"),
    "Payment and coverage options can depend on the transportation arrangement. Please contact Zenward at 678-935-5489 so our team can confirm the options for your request.",
  );
  assert.match(F.factAnswer("serviceAreaDetail"), /^Zenward serves Metro Atlanta\. For a specific pickup or destination, send a transportation request or call our team/);
  assert.match(F.factAnswer("sameDay"), /^Same-day availability must be confirmed by the Zenward team\./);
  assert.match(F.factAnswer("advanceNotice"), /^Availability depends on the trip details and requested time\. Submit your request as early as possible/);
});

// ------------------------------------------------------------- assistant matrix (§28)

test("assistant commercial answers come from the operating facts", () => {
  const cases = [
    ["what are your hours?", "hours", F.factAnswer("workingHours"), true],
    ["do you take Medicaid?", "coverage", F.factAnswer("coverage"), true],
    ["do you take Medicare?", "coverage", F.factAnswer("coverage"), true],
    ["do you accept insurance?", "coverage", F.factAnswer("coverage"), true],
    ["can I pay with a card?", "coverage", F.factAnswer("paymentMethods"), true],
    ["can you pick me up today?", "availability", F.factAnswer("sameDay"), false],
    ["how early should I book?", "availability", F.factAnswer("advanceNotice"), false],
    ["do you serve Marietta?", "area", F.factAnswer("serviceAreaDetail"), false],
    ["do you serve all Georgia?", "area", F.factAnswer("serviceAreaDetail"), false],
    ["how much?", "pricing", F.CONFIRMED.pricing, false],
    ["when will you reply?", "response_time", QUOTE_RESPONSE_LINE, false],
    ["what is your cancellation policy?", "manage", F.factAnswer("cancellation"), true],
  ];
  for (const [text, kind, expected, phoneFirst] of cases) {
    const r = say(text);
    assert.equal(r.kind, kind, text);
    assert.ok(r.paragraphs.includes(expected), `${text}: ${r.paragraphs.join(" | ")}`);
    assert.deepEqual(S.validateReply(r), [], text);
    if (phoneFirst) assert.equal(hrefs(r)[0], business.phoneHref, text);
    assert.ok(hrefs(r).length > 0, `${text} must offer a next step`);
    for (const re of UNCONFIRMED_CLAIMS) assert.doesNotMatch(textOf(r), re, text);
  }
  const confirmed = say("Is my request confirmed?");
  assert.equal(confirmed.kind, "status");
  assert.ok(confirmed.paragraphs.includes(F.CONFIRMED.notABooking));
  assert.doesNotMatch(textOf(say("do you serve all Georgia?")), /statewide|all (of )?georgia/i);
  assert.doesNotMatch(textOf(say("can you pick me up today?")), /same-day (is )?available|not available/i);
});

test("the assistant has no parallel commercial wording", () => {
  const code = read("lib/assistant/responses.ts");
  assert.match(code, /from "\.\.\/operating-facts\.ts"/);
  assert.match(code, /export const HOURS_TEXT = factAnswer\("workingHours"\)/);
  assert.match(code, /export const PRICING_TEXT = CONFIRMED\.pricing/);
  assert.doesNotMatch(code, /working hours aren't published|Payment and coverage options|Same-day availability|as early as possible/);
});

// ------------------------------------------------------------- pages

test("pages read commercial answers from the shared source (no copies)", () => {
  for (const rel of ["app/page.tsx", "app/locations/[market]/page.tsx", "app/request-transportation/page.tsx", "app/contact/page.tsx", "app/healthcare-providers/page.tsx"]) {
    const code = read(rel);
    assert.match(code, /commercialFaq\(\)/, rel);
    assert.doesNotMatch(code, /working hours aren't published|Payment and coverage options|Same-day availability/, rel);
  }
  const request = read("app/request-transportation/page.tsx");
  assert.ok(request.indexOf("<RequestTransportationForm") < request.indexOf("Before you request"), "FAQ below the form");
  assert.doesNotMatch(read("lib/service-area.ts"), /export function serviceAreaFaqAnswer/);
});

test("structured data adds no unconfirmed commercial facts", () => {
  for (const rel of ["app/page.tsx", "lib/service-pages.ts", "app/locations/[market]/page.tsx", "lib/service-area.ts"]) {
    assert.doesNotMatch(read(rel), /openingHours|paymentAccepted|priceRange|currenciesAccepted|hasOfferCatalog|aggregateRating/, rel);
  }
});

test("operating facts never touch the intake or the network", () => {
  const code = read("lib/operating-facts.ts");
  assert.doesNotMatch(code, /fetch\(|request-intake|nemryn|localStorage|process\.env/i);
});
