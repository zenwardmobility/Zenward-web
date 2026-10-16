// ZW-WEB-04M: Google Ads conversion measurement — READY BUT DISABLED.
// Proves the default-off gate, that nothing Google-facing exists in the app,
// that the conversion payload is minimal (no service, URL, personal or trip
// data), the conversion classification, once-only counting and failure
// isolation, and that Privacy, intake and GBP state are unchanged.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../..");
const root = path.resolve(src, "..");
const read = (rel) => readFileSync(path.join(src, rel), "utf8");
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const G = await import("./google-ads.ts");
const C = await import("./conversions.ts");
const { track, registerAnalyticsSink, sanitizeEvent } = await import("./events.ts");
const { once, isDeliveredConversion } = await import("../quote-form/model.ts");

const FULL_ENV = {
  GOOGLE_ADS_CONVERSIONS_ENABLED: "true",
  GOOGLE_ADS_CUSTOMER_ID: "123-456-7890",
  GOOGLE_ADS_QUOTE_CONVERSION_ACTION_ID: "111111111",
  GOOGLE_ADS_PROVIDER_CONVERSION_ACTION_ID: "222222222",
};
const CLICK = { type: "gclid", value: "Cj0KCQjwTEST_click-id_0123456789" };
const AT = new Date("2026-10-16T14:05:09Z");

function sourceFiles() {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(ts|tsx|js|mjs)$/.test(name) && !name.endsWith(".test.mjs")) out.push(full);
    }
  };
  walk(src);
  return out.map((f) => ({ file: path.relative(src, f), text: readFileSync(f, "utf8") }));
}

// ================================================================ default OFF

test("Google measurement is disabled by default and cannot be activated by env alone", () => {
  assert.equal(G.MEASUREMENT_APPROVED, false, "code-level gate stays false until the owner/legal gate");
  const empty = G.readGoogleAdsConfig({});
  assert.equal(empty.enabled, false);
  assert.equal(G.isGoogleAdsMeasurementActive(empty), false);
  const full = G.readGoogleAdsConfig(FULL_ENV);
  assert.equal(full.enabled, true);
  assert.equal(full.customerId, "1234567890");
  assert.equal(G.isGoogleAdsMeasurementActive(full), false, "env alone never activates");
  // Only the literal "true" enables; anything else (including .env.example's "false") is off.
  for (const v of ["false", "1", "TRUE", "yes", "", undefined]) {
    assert.equal(G.readGoogleAdsConfig({ ...FULL_ENV, GOOGLE_ADS_CONVERSIONS_ENABLED: v }).enabled, false, String(v));
  }
  // Malformed IDs are dropped, so an "enabled" config without a valid primary action stays inactive.
  const bad = G.readGoogleAdsConfig({ ...FULL_ENV, GOOGLE_ADS_QUOTE_CONVERSION_ACTION_ID: "AW-123/abc" });
  assert.equal(bad.actions.quote_submitted, undefined);
  assert.equal(G.isGoogleAdsMeasurementActive(bad, true), false);
  // While disabled: no payload and no sink to register.
  assert.equal(G.buildClickConversion({ name: "transportation_quote_submitted" }, CLICK, AT, full), null);
  assert.equal(G.createConversionSink(full, () => {}), null);
});

test("disabled = no Google script, network request, cookie, global or queue anywhere", () => {
  const gads = stripComments(read("lib/analytics/google-ads.ts")) + stripComments(read("lib/analytics/conversions.ts"));
  assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|https?:\/\/|<script|createElement|document\.|window\.|globalThis|localStorage|sessionStorage|indexedDB|cookie|dataLayer|gtag|import\(/.test(gads));
  // Nothing in the app imports the boundary yet, so it is unreachable and tree-shaken.
  for (const { file, text } of sourceFiles()) {
    if (file.startsWith("lib/analytics/")) continue;
    assert.ok(!/analytics\/google-ads|analytics\/conversions/.test(text), file);
  }
  // No sink is registered anywhere (only events.ts defines registerAnalyticsSink).
  for (const { file, text } of sourceFiles()) {
    if (file === path.join("lib", "analytics", "events.ts")) continue;
    assert.ok(!/registerAnalyticsSink\(/.test(text), file);
  }
});

test("no GA4, GTM, Google tag, Enhanced Conversions, remarketing or audience code", () => {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  assert.ok(!deps.some((d) => /gtag|google-analytics|react-ga|@next\/third-parties|tagmanager|google-ads-api|googleapis/i.test(d)), deps.join(","));
  for (const { file, text } of sourceFiles()) {
    const code = stripComments(text);
    assert.ok(!/googletagmanager\.com|google-analytics\.com|googleadservices\.com|googlesyndication|doubleclick\.net|gtag\(|\bGTM-[A-Z0-9]+|\bAW-\d+|\bG-[A-Z0-9]{8,}\b|from "next\/script"/.test(code), file);
    assert.ok(!/userIdentifiers|hashedEmail|hashedPhoneNumber|hashed_?email|sha256|enhanced_?conversions|user_data/i.test(code), `${file}: enhanced conversions`);
    assert.ok(!/remarketing|userList|user_list|customerMatch|customer_match|\b(ad|remarketing|custom|similar|in-market|affinity) audiences?\b|audience_?id|allow_ad_personalization_signals: true/i.test(code), `${file}: remarketing/audience`);
  }
  assert.ok(!/<Script\b/.test(read("app/layout.tsx")));
});

// ================================================================ classification

test("conversion classification: one primary, two secondary, the rest diagnostic", () => {
  assert.deepEqual(
    Object.entries(C.CONVERSION_TIERS).filter(([, t]) => t === "primary").map(([n]) => n),
    ["transportation_quote_submitted"],
  );
  assert.deepEqual(
    Object.entries(C.CONVERSION_TIERS).filter(([, t]) => t === "secondary").map(([n]) => n).sort(),
    ["phone_cta_clicked", "provider_enquiry_submitted"],
  );
  for (const name of ["transportation_quote_started", "request_transportation_clicked", "provider_cta_clicked", "contact_started", "transportation_assistant_opened", "transportation_assistant_quote_clicked"]) {
    assert.equal(C.CONVERSION_TIERS[name], "diagnostic", name);
    assert.equal(C.conversionKeyFor({ name }), null, name);
  }
  assert.deepEqual(C.CONVERSION_ACTION_NAMES, {
    quote_submitted: "Transportation Quote Submitted",
    phone_click: "Phone Click",
    provider_enquiry: "Provider Enquiry",
  });
});

test("form start is never a conversion; phone stays a click; provider enquiry stays distinct", () => {
  const full = G.readGoogleAdsConfig(FULL_ENV);
  assert.equal(G.buildClickConversion({ name: "transportation_quote_started" }, CLICK, AT, full, true), null);
  // Phone clicks are intent, not calls: never uploaded as a conversion.
  assert.ok(!G.SERVER_UPLOAD_KEYS.includes("phone_click"));
  assert.equal(G.buildClickConversion({ name: "phone_cta_clicked" }, CLICK, AT, full, true), null);
  // Provider enquiries use their own action, never the passenger-request action.
  const provider = G.buildClickConversion({ name: "provider_enquiry_submitted" }, CLICK, AT, full, true);
  const quote = G.buildClickConversion({ name: "transportation_quote_submitted" }, CLICK, AT, full, true);
  assert.equal(provider.conversionAction, "customers/1234567890/conversionActions/222222222");
  assert.equal(quote.conversionAction, "customers/1234567890/conversionActions/111111111");
  // No provider action configured -> nothing (never falls back to the quote action).
  const noProvider = G.readGoogleAdsConfig({ ...FULL_ENV, GOOGLE_ADS_PROVIDER_CONVERSION_ACTION_ID: "" });
  assert.equal(G.buildClickConversion({ name: "provider_enquiry_submitted" }, CLICK, AT, noProvider, true), null);
  // The tel: link event still carries only its closed surface.
  assert.deepEqual(sanitizeEvent({ name: "phone_cta_clicked", surface: "provider_page", answered: true }), { name: "phone_cta_clicked", surface: "provider_page" });
});

// ================================================================ payload

const FORBIDDEN_EVENT_FIELDS = {
  serviceType: "dialysis", service: "wheelchair_transportation", serviceLabel: "Dialysis Transportation", slug: "dialysis-transportation",
  passengerName: "Jane", requesterName: "John", requesterRelationship: "family", requesterPhone: "4045550100", requesterEmail: "a@b.c",
  pickupDescription: "1 Main St", destinationDescription: "Clinic", preferredDate: "2026-11-01", preferredTime: "09:00",
  returnTripNeeded: "yes", recurringSchedule: { daysOfWeek: ["monday"] }, assistanceLevel: "door_to_door", assistanceNotes: "walker",
  additionalNotes: "flight DL123", integrationExternalId: "int", idempotencyKey: "uuid", organizationId: "o", tenantId: "t",
  requestId: "r", passengerId: "p", tripId: "tr", page_location: "https://x/services/dialysis-transportation?service=dialysis",
  page_path: "/services/dialysis-transportation", url: "/request-transportation?service=dialysis", referrer: "https://x/services/wheelchair-transportation", title: "Dialysis Transportation",
};

test("Google-facing payload is minimal: no service, URL, title, referrer, personal or trip data", () => {
  const full = G.readGoogleAdsConfig(FULL_ENV);
  const upload = G.buildClickConversion({ name: "transportation_quote_submitted", ...FORBIDDEN_EVENT_FIELDS }, CLICK, AT, full, true);
  assert.deepEqual(upload, {
    conversionAction: "customers/1234567890/conversionActions/111111111",
    conversionDateTime: "2026-10-16 14:05:09+00:00",
    gclid: CLICK.value,
  });
  const json = JSON.stringify(upload);
  for (const value of ["dialysis", "wheelchair", "senior", "service", "Jane", "John", "Main St", "walker", "door_to_door", "uuid", "http", "/services", "?"]) {
    assert.ok(!json.includes(value), value);
  }
  // No ad click -> nothing to attribute, nothing sent.
  assert.equal(G.buildClickConversion({ name: "transportation_quote_submitted" }, null, AT, full, true), null);
});

test("click-ID parsing: only gclid/gbraid/wbraid, strict format; ?service= and UTMs never returned", () => {
  assert.deepEqual(G.parseClickId("?service=dialysis&gclid=Cj0KCQjwTEST_click-id_0123456789&utm_campaign=dialysis"), CLICK);
  assert.deepEqual(G.parseClickId("gbraid=0AAAAAbcdefghij"), { type: "gbraid", value: "0AAAAAbcdefghij" });
  assert.deepEqual(G.parseClickId("wbraid=CkQKCAjwabc123xyz"), { type: "wbraid", value: "CkQKCAjwabc123xyz" });
  for (const bad of ["?service=dialysis", "?utm_source=google&utm_campaign=wheelchair", "?gclid=short", "?gclid=<script>alert(1)</script>xx", "?gclid=has spaces in it 123", ""]) {
    assert.equal(G.parseClickId(bad), null, bad);
  }
  // The parser is not wired anywhere: no capture or persistence exists yet.
  for (const { file, text } of sourceFiles()) {
    if (file.startsWith("lib/analytics/")) continue;
    assert.ok(!/\b(gclid|gbraid|wbraid)\b/.test(stripComments(text)), `${file} handles click IDs`);
  }
});

test("click IDs and campaign parameters never reach intake, Nemryn, notes or the assistant", () => {
  for (const rel of ["lib/request-intake/nemryn-mapping.ts", "lib/request-intake/adapter.ts", "lib/request-intake/types.ts", "app/request-transportation/actions.ts", "lib/quote-form/model.ts", "lib/assistant/responses.ts", "lib/assistant/intents.ts", "components/public/assistant/AssistantPanel.tsx", "lib/contact-intake/adapter.ts"]) {
    assert.ok(!/gclid|gbraid|wbraid|utm_|conversions?\.ts|google-ads/i.test(stripComments(read(rel))), rel);
  }
});

// ================================================================ once-only + isolation

test("the primary conversion fires once per successful browser submission", () => {
  // Form: delivered-only, through a once() held in a ref for the mount (one submissionId).
  const form = stripComments(read("components/public/RequestTransportationForm.tsx"));
  assert.match(form, /const markSubmitted = useRef\(once\(\(\) => track\(\{ name: "transportation_quote_submitted" \}\)\)\);/);
  assert.match(form, /if \(isDeliveredConversion\(result\)\) markSubmitted\.current\(\);/);
  assert.equal((form.match(/transportation_quote_submitted/g) ?? []).length, 1);
  // Double-click within one frame can't submit twice.
  assert.match(form, /if \(status === "submitting" \|\| inFlight\.current\) return;\s*inFlight\.current = true;/);
  assert.equal(isDeliveredConversion({ ok: true, delivered: false }), false);
  let n = 0;
  const fire = once(() => n++);
  fire(); fire(); fire();
  assert.equal(n, 1);
  // Contact form: in-flight guard and a once-per-mount provider enquiry.
  const contact = stripComments(read("components/public/ContactForm.tsx"));
  assert.match(contact, /if \(inFlight\.current\) return;\s*inFlight\.current = true;/);
  assert.match(contact, /!enquiryCounted\.current/);
  // Boundary sink: the primary conversion at most once per page lifetime; secondaries pass through.
  const delivered = [];
  const sink = G.createConversionSink(G.readGoogleAdsConfig(FULL_ENV), (k) => delivered.push(k), true);
  for (const name of ["transportation_quote_submitted", "transportation_quote_submitted", "transportation_quote_started", "provider_enquiry_submitted", "transportation_quote_submitted"]) sink({ name });
  assert.deepEqual(delivered, ["quote_submitted", "provider_enquiry"]);
});

test("measurement failures can never block the visitor's action", () => {
  const throwing = G.createConversionSink(G.readGoogleAdsConfig(FULL_ENV), () => { throw new Error("blocked by ad blocker"); }, true);
  assert.doesNotThrow(() => throwing({ name: "transportation_quote_submitted" }));
  const unregister = registerAnalyticsSink(() => { throw new Error("vendor down"); });
  try {
    assert.doesNotThrow(() => track({ name: "transportation_quote_submitted" }));
    assert.doesNotThrow(() => track({ name: "phone_cta_clicked", surface: "header" }));
  } finally {
    unregister();
  }
});

// ================================================================ policy + regression

test("Privacy remains truthful while disabled; activation wording is internal only", () => {
  const privacy = read("app/privacy/page.tsx");
  assert.match(privacy, /does not load Google Analytics,\s+Google Tag Manager or Google Ads tags/);
  assert.match(privacy, /If this changes, we will update this\s+policy first\./);
  assert.ok(!/Google Ads (conversion|measurement) is (active|enabled)|we use Google Ads to measure/i.test(privacy));
  const checklist = readFileSync(path.join(root, "docs/product/google-ads-conversion-activation-checklist.md"), "utf8");
  assert.match(checklist, /DRAFT: NOT PUBLISHED/);
  assert.match(checklist, /SAME production release/);
  assert.match(checklist, /Enhanced Conversions[^\n]*OFF/);
  assert.match(checklist, /remarketing[^\n]*OFF/i);
});

test("Terms, intake contract, GBP and campaign indexing are unchanged by measurement", () => {
  assert.ok(!/google|gclid|conversion/i.test(stripComments(read("app/terms/page.tsx"))));
  assert.ok(!/sameAs/.test(stripComments(read("lib/organization.ts"))), "no Google Business Profile link");
  assert.match(readFileSync(path.join(root, "docs/product/google-business-profile-launch-checklist.md"), "utf8"), /No profile is known to exist yet/);
  assert.match(read("lib/service-pages.ts"), /robots: \{ index: false, follow: true \}/);
  const mapping = stripComments(read("lib/request-intake/nemryn-mapping.ts"));
  for (const key of ["integrationExternalId", "idempotencyKey", "serviceType", "assistanceNotes"]) assert.ok(mapping.includes(key), key);
  assert.ok(!/analytics/.test(stripComments(read("app/request-transportation/actions.ts"))), "the Server Action has no measurement hook yet");
});

test(".env.example documents the switch as false, server-only, with no IDs", () => {
  const env = readFileSync(path.join(root, ".env.example"), "utf8");
  assert.match(env, /^GOOGLE_ADS_CONVERSIONS_ENABLED=false$/m);
  assert.match(env, /^GOOGLE_ADS_CUSTOMER_ID=\s/m);
  assert.ok(!/NEXT_PUBLIC_GOOGLE/.test(env), "nothing Google-related in the browser bundle");
  assert.ok(!/^GOOGLE_ADS_[A-Z_]+=\s*\d/m.test(env), "no IDs committed");
});
