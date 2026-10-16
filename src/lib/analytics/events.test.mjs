// ZW-WEB-04D: privacy-safe conversion event foundation.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../..");
const { sanitizeEvent, track, registerAnalyticsSink, ANALYTICS_SURFACES } = await import("./events.ts");

const FORBIDDEN = {
  passengerName: "Jane Doe",
  requesterName: "John Doe",
  requesterRelationship: "family",
  requesterPhone: "404-555-0100",
  phone: "404-555-0100",
  requesterEmail: "a@b.c",
  email: "a@b.c",
  pickupDescription: "123 Main St",
  destinationDescription: "Dialysis Center",
  preferredDate: "2026-11-01",
  preferredTime: "09:00",
  assistanceNotes: "uses a wheelchair",
  additionalNotes: "notes",
  recurringSchedule: { daysOfWeek: ["monday"] },
  integrationExternalId: "int-1",
  idempotencyKey: "uuid",
  organizationId: "org",
  tenantId: "tenant",
  passengerId: "p",
  tripId: "t",
  serviceType: "dialysis",
  url: "/services/dialysis-transportation?x=1",
  hasReturnTrip: true,
};

const SAMPLE = {
  phone_cta_clicked: { surface: "hero" },
  transportation_quote_started: {},
  transportation_quote_submitted: {},
  provider_enquiry_submitted: {},
  request_transportation_clicked: { source: "campaign_page" },
  provider_cta_clicked: { source: "homepage" },
  contact_started: { topic: "general" },
};

test("forbidden passenger/trip/identifier fields are dropped from every event", () => {
  for (const [name, allowed] of Object.entries(SAMPLE)) {
    const clean = sanitizeEvent({ name, ...allowed, ...FORBIDDEN });
    assert.deepEqual(clean, { name, ...allowed }, name);
  }
});

test("serviceType can never be an event parameter", () => {
  for (const [name, allowed] of Object.entries(SAMPLE)) {
    const clean = sanitizeEvent({ name, ...allowed, serviceType: "wheelchair_transportation" });
    assert.equal("serviceType" in clean, false, name);
  }
});

test("phone_cta_clicked accepts only an allow-listed surface", () => {
  assert.deepEqual(sanitizeEvent({ name: "phone_cta_clicked", surface: "campaign_page" }), {
    name: "phone_cta_clicked",
    surface: "campaign_page",
  });
  for (const bad of [undefined, "", "dialysis", "/services/dialysis-transportation", "wheelchair_transportation", 42, { a: 1 }]) {
    assert.equal(sanitizeEvent({ name: "phone_cta_clicked", surface: bad }), null, String(bad));
  }
  assert.ok(ANALYTICS_SURFACES.includes("campaign_page"));
  assert.equal(ANALYTICS_SURFACES.some((s) => /dialysis|wheelchair|airport|medical|senior/.test(s)), false);
});

test("unknown events are rejected", () => {
  assert.equal(sanitizeEvent({ name: "request_form_submitted", hasReturnTrip: true }), null);
  assert.equal(sanitizeEvent({ name: "anything" }), null);
  assert.equal(sanitizeEvent(null), null);
});

test("track delivers only sanitised events, and a failing sink cannot block anything", () => {
  const received = [];
  const offBad = registerAnalyticsSink(() => {
    throw new Error("vendor down");
  });
  const offGood = registerAnalyticsSink((e) => received.push(e));
  assert.doesNotThrow(() => track({ name: "phone_cta_clicked", surface: "header", ...FORBIDDEN }));
  assert.doesNotThrow(() => track({ name: "not_an_event" }));
  offBad();
  offGood();
  assert.deepEqual(received, [{ name: "phone_cta_clicked", surface: "header" }]);
});

test("transportation_quote_submitted fires only in the delivered success branch", () => {
  const form = readFileSync(path.join(src, "components/public/RequestTransportationForm.tsx"), "utf8");
  assert.equal(form.match(/transportation_quote_submitted/g).length, 1);
  const ok = form.indexOf("if (result.ok) {");
  const delivered = form.indexOf("if (result.delivered) {", ok);
  const fire = form.indexOf('track({ name: "transportation_quote_submitted" })');
  const elseBranch = form.indexOf("} else {", ok);
  assert.ok(ok > 0 && delivered > ok && fire > delivered && fire < elseBranch);
  assert.equal(/request_form_submitted|hasReturnTrip/.test(form), false);
});

test("transportation_quote_started fires once per mount, without form values", () => {
  const form = readFileSync(path.join(src, "components/public/RequestTransportationForm.tsx"), "utf8");
  assert.match(form, /if \(!hasStarted\.current\) \{\s*hasStarted\.current = true;[\s\S]*?track\(\{ name: "transportation_quote_started" \}\)/);
});

test("provider_enquiry_submitted fires only for a delivered provider-topic message", () => {
  const contact = readFileSync(path.join(src, "components/public/ContactForm.tsx"), "utf8");
  assert.match(contact, /if \(result\.delivered && input\.topic === "provider"\) \{\s*track\(\{ name: "provider_enquiry_submitted" \}\);/);
});

test("no analytics vendor, tag, dataLayer or external network client exists", () => {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".test.mjs")) files.push(full);
    }
  };
  walk(src);
  const banned = /googletagmanager\.com|google-analytics\.com|googleadservices\.com|gtag\(|window\.dataLayer|dataLayer\.push|from "next\/script"|@next\/third-parties|posthog|plausible\.io/;
  for (const file of files) assert.equal(banned.test(readFileSync(file, "utf8")), false, file);

  const events = readFileSync(path.join(src, "lib/analytics/events.ts"), "utf8");
  assert.equal(/fetch\(|XMLHttpRequest|sendBeacon|https?:\/\//.test(events), false);

  // No sink is registered anywhere in the app.
  const registrations = files.filter((f) => !f.endsWith(path.join("analytics", "events.ts")) && /registerAnalyticsSink\(/.test(readFileSync(f, "utf8")));
  assert.deepEqual(registrations, []);
});

test("phone links never block the call: the tracked tel link doesn't preventDefault", () => {
  const link = readFileSync(path.join(src, "components/public/TrackedPhoneLink.tsx"), "utf8");
  const code = link.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  assert.equal(/preventDefault/.test(code), false);
  assert.match(link, /href=\{business\.phoneHref\}/);
});
