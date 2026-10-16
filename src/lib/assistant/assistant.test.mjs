// ZW-WEB-04H: Zenward Transportation Assistant V1. Deterministic engine,
// safety rules, canonical routing, privacy and wording.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../..");
const read = (rel) => readFileSync(path.join(src, rel), "utf8");
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const R = await import("./responses.ts");
const S = await import("./safety.ts");
const K = await import("./knowledge.ts");
const P = await import("./provider.ts");
const { SERVICE_CATALOG, SERVICE_ORDER } = await import("../service-catalog.ts");
const { business } = await import("../business.ts");
const { QUOTE_RESPONSE_LINE } = await import("../trust.ts");

const CTX = {
  marketName: "Metro Atlanta",
  summaries: Object.fromEntries(SERVICE_ORDER.map((slug) => [slug, `Summary for ${slug}.`])),
};
const say = (text) => R.respond({ kind: "text", text }, CTX);
const tap = (id) => R.respond({ kind: "quick", id }, CTX);
const textOf = (r) => [...r.paragraphs, ...(r.steps ?? []), ...r.actions.map((a) => a.label)].join("\n");
const hrefs = (r) => r.actions.filter((a) => a.kind !== "reply").map((a) => a.href);

const ASSISTANT_FILES = [
  "lib/assistant/types.ts",
  "lib/assistant/knowledge.ts",
  "lib/assistant/intents.ts",
  "lib/assistant/safety.ts",
  "lib/assistant/responses.ts",
  "lib/assistant/provider.ts",
  "components/public/assistant/AssistantLauncher.tsx",
  "components/public/assistant/AssistantPanel.tsx",
  "components/public/assistant/AssistantMessage.tsx",
  "components/public/assistant/context.ts",
  "components/public/assistant/open-assistant.ts",
  "components/public/assistant/AssistantInlineEntry.tsx",
];

const PHRASES = [
  "ride to my doctor", "dialysis three times a week", "wheelchair ride", "ride from the airport",
  "hospital is discharging my mother", "therapy appointments every week", "senior transportation",
  "I need an ambulance now", "how much?", "where is my request?", "are you insured?", "are you always on time?",
  "I need a ride for dialysis.", "My mum uses a wheelchair.", "I need a ride from the airport.",
  "Can you take my dad to his doctor?", "How fast do you reply?", "How do I book?", "What time are you open?",
  "Do you take Medicaid?", "Can you cancel my ride?", "Is a van available tomorrow?", "Do you serve Atlanta?",
  "I'm a social worker at a clinic", "Should I take my medication before dialysis?", "talk to a person",
  "thanks", "hi", "I need a wheelchair ride to dialysis", "Pick up at 123 Main Street on Oct 23 at 9am, call 404-555-0100",
  "my email is qa@example.com", "asdf qwerty", "", "I need non-emergency transportation", "are your drivers background checked?",
  "do you work 24/7?", "can you do it for free", "I need a ride every Monday",
];
const QUICK = ["start", "request", "find_service", "find_more", "wheelchair", "recurring", "airport", "talk", "process", "trust", "not_emergency", ...SERVICE_ORDER.map((s) => `service:${s}`)];
const ALL_REPLIES = [...PHRASES.map(say), ...QUICK.map(tap), R.welcome()];

// ------------------------------------------------------------- intents (§41)

test("intent routing: representative phrases", () => {
  const svc = (text) => say(text).services ?? [];
  assert.deepEqual(svc("ride to my doctor"), ["medical-appointments"]);
  assert.deepEqual(svc("dialysis three times a week"), ["dialysis-transportation"]);
  assert.match(textOf(say("dialysis three times a week")), /choose Recurring/);
  assert.deepEqual(svc("wheelchair ride"), ["wheelchair-transportation"]);
  assert.deepEqual(svc("ride from the airport"), ["airport-transportation"]);
  assert.deepEqual(svc("hospital is discharging my mother"), ["hospital-discharge-transportation"]);
  assert.deepEqual(svc("therapy appointments every week"), ["rehabilitation-transportation"]);
  assert.match(textOf(say("therapy appointments every week")), /Recurring/);
  assert.deepEqual(svc("senior transportation"), ["senior-medical-transportation"]);
  assert.deepEqual(svc("I need a ride every Monday"), ["recurring-care-transportation"]);
  assert.equal(say("I need an ambulance now").kind, "emergency");
  assert.equal(say("how much?").kind, "pricing");
  assert.equal(say("where is my request?").kind, "status");
  const insured = say("are you insured?");
  assert.equal(insured.kind, "trust");
  assert.match(textOf(insured), /licensed and insured transportation provider/);
  const onTime = say("are you always on time?");
  assert.equal(onTime.kind, "trust");
  assert.match(textOf(onTime), /Punctuality is our standard\. Trips are planned around pickup and appointment times\./);
  assert.doesNotMatch(textOf(onTime), /guarantee|100|always/i);
});

test("service disambiguation: wheelchair + dialysis offers both, wheelchair first", () => {
  const r = say("I need a wheelchair ride to dialysis");
  assert.deepEqual(r.services, ["wheelchair-transportation", "dialysis-transportation"]);
  assert.match(r.paragraphs[0], /both Dialysis Transportation and Wheelchair-Accessible Transportation/);
  assert.deepEqual(hrefs(r).slice(0, 2), ["/request-transportation?service=wheelchair_transportation", "/request-transportation?service=dialysis"]);
});

test("provider enquiries route to Healthcare Providers + contact, not a service", () => {
  const r = say("I'm a social worker at a clinic");
  assert.equal(r.kind, "provider");
  assert.ok(hrefs(r).includes("/healthcare-providers"));
  assert.ok(hrefs(r).includes("/contact"));
});

// ------------------------------------------------------------- handoff + canonical

test("service routes and quote handoff come from the canonical catalogue, passing ONLY ?service=", () => {
  for (const slug of SERVICE_ORDER) {
    const r = tap(`service:${slug}`);
    const entry = SERVICE_CATALOG[slug];
    assert.equal(r.actions[0].href, entry.requestHref);
    assert.match(entry.requestHref, /^\/request-transportation\?service=[a-z_]+$/);
    assert.ok(hrefs(r).includes(entry.path));
    assert.match(r.paragraphs[0], new RegExp(`Zenward provides ${entry.label} in Metro Atlanta\\. Summary for ${slug}\\.`));
  }
  for (const r of ALL_REPLIES) for (const href of hrefs(r)) {
    if (href.startsWith("tel:")) continue;
    assert.ok(S.isAllowedHref(href), href);
  }
  for (const bad of ["/request-transportation?service=dialysis&name=Ann", "/request-transportation?pickup=1%20Main", "/request-transportation?service=dialysis&date=2026-10-23", "/request-transportation?service=other", "/services/made-up", "https://example.com", "/request-transportation?service=dialysis#x"]) {
    assert.equal(S.isAllowedHref(bad), false, bad);
  }
  assert.match(read("lib/assistant/knowledge.ts"), /from "\.\.\/service-catalog\.ts"/);
  assert.match(read("lib/assistant/knowledge.ts"), /from "\.\.\/trust\.ts"/);
  assert.match(read("lib/assistant/knowledge.ts"), /from "\.\.\/business\.ts"/);
  const context = read("components/public/assistant/context.ts");
  assert.match(context, /SERVICES\[slug\]\.summary/);
  assert.match(context, /getDefaultMarket\(\)\.name/);
  assert.match(read("components/layout/PublicLayout.tsx"), /<AssistantLauncher context=\{buildAssistantContext\(\)\} \/>/);
  assert.doesNotMatch(read("components/public/assistant/AssistantPanel.tsx"), /@\/lib\/services/);
});

test("no passenger or trip details ever reach a URL, and replies never echo the visitor", () => {
  const r = say("zebratoken 123 Main Street dialysis on Oct 23 at 9am for Ann, 404-555-0100");
  assert.equal(r.paragraphs[0], R.SENSITIVE_TEXT);
  assert.equal(r.actions[0].label, "Continue to Request a Quote");
  assert.equal(r.actions[0].href, "/request-transportation?service=dialysis");
  for (const reply of [r, ...ALL_REPLIES]) {
    assert.doesNotMatch(textOf(reply), /zebratoken|Main Street|404-555|qa@example|Ann\b/);
    for (const href of hrefs(reply)) assert.doesNotMatch(href, /name|pickup|destination|date|time|phone|email|note/i);
  }
  assert.equal(say("my email is qa@example.com").kind, "sensitive");
});

// ------------------------------------------------------------- safety (§40)

test("emergency wording routes to 911 and stops service qualification", () => {
  for (const text of ["I need an ambulance now", "call 911", "this is an emergency", "my dad has chest pain", "she can't breathe", "he is having a stroke", "medical emergency at home"]) {
    const r = say(text);
    assert.equal(r.kind, "emergency", text);
    assert.equal(r.paragraphs[0], "Zenward provides non-emergency transportation. If this is a medical emergency, call 911 or your local emergency service.");
    assert.ok(r.actions.some((a) => a.kind === "tel" && a.href === "tel:911"));
    assert.ok(!r.actions.some((a) => a.kind === "link"), "no service/quote links in an emergency");
  }
  assert.notEqual(say("I need non-emergency transportation").kind, "emergency");
  assert.notEqual(say("rehab after a stroke").kind, "emergency");
});

test("unknown questions route to human help without guessing", () => {
  const r = say("asdf qwerty");
  assert.equal(r.kind, "unknown");
  assert.equal(r.paragraphs[0], `I don't want to give you the wrong information. You can call Zenward at ${business.phoneDisplay} or send our team a message.`);
  assert.ok(hrefs(r).includes(business.phoneHref));
  assert.ok(hrefs(r).includes("/contact"));
});

test("status, changes, pricing, hours and coverage never fabricate anything", () => {
  assert.deepEqual(say("where is my request?").paragraphs, [`The Transportation Assistant can't view request status yet. Please call Zenward at ${business.phoneDisplay} for help with an existing request.`]);
  assert.equal(say("Was my request accepted?").kind, "status");
  assert.equal(say("Can you cancel my ride?").kind, "manage");
  const price = say("how much?");
  assert.equal(price.paragraphs[0], "Pricing is confirmed after Zenward reviews the transportation request and trip details.");
  assert.ok(price.actions.some((a) => a.kind === "link" && a.quote));
  assert.equal(say("What time are you open?").paragraphs[0], `Our exact working hours aren't published here yet. You can call ${business.phoneDisplay}, and transportation requests received during working hours are answered within 2 hours.`);
  assert.equal(say("do you work 24/7?").kind, "hours");
  assert.equal(say("Do you take Medicaid?").kind, "coverage");
  assert.equal(say("How fast do you reply?").paragraphs[0], QUOTE_RESPONSE_LINE);
  for (const r of ALL_REPLIES) assert.doesNotMatch(textOf(r), /\$\s?\d|\b\d+ (dollars|usd)\b|\bper mile\b/i);
});

test("every reply passes validation: no availability, booking, guarantee, 24/7 or unapproved claims", () => {
  for (const r of ALL_REPLIES) {
    assert.deepEqual(S.validateReply(r), [], `${r.kind}: ${textOf(r)}`);
    assert.ok(r.paragraphs.length >= 1 && r.paragraphs.length <= 3);
  }
  const wheelchair = textOf(tap("wheelchair"));
  assert.doesNotMatch(wheelchair, /ADA|lift|ramp|weight|securement|tie[- ]?down|lifting|transfer|oxygen|stretcher capab/i);
  const airport = textOf(tap("airport"));
  assert.doesNotMatch(airport, /flight tracking|meet[- ]and[- ]greet|baggage|escort|permit|24/i);
  const process = tap("process");
  assert.deepEqual(process.steps, K.PROCESS_STEPS);
  assert.match(process.steps.join(" "), /isn't confirmed until Zenward confirms it/);
  assert.match(process.steps.join(" "), /within 2 hours/);
  // The validator itself catches the claims it must.
  for (const bad of ["Your ride is confirmed.", "Guaranteed on time.", "We are open 24/7.", "We accept Medicaid.", "An agent will join this chat.", "Available slots: 9am.", "Our ADA certified vans.", "Fares start at $25."]) {
    assert.ok(S.validateReply({ kind: "unknown", paragraphs: [bad], actions: [] }).length > 0, bad);
  }
});

test("unconfirmed credentials (CPR, ADA, certification, drug testing) are never affirmed", () => {
  for (const text of ["are drivers CPR certified?", "Are you ADA certified?", "are your drivers drug tested?", "do you have first aid training?"]) {
    const r = say(text);
    assert.equal(r.paragraphs[0], "I can't confirm specific certifications or programs here.", text);
    assert.doesNotMatch(textOf(r), /\bCPR\b|\bADA\b|certified|drug/i, text);
    assert.ok(hrefs(r).includes(business.phoneHref));
  }
});

test("no fake human identity and no AI-centric public wording", () => {
  assert.equal(R.WELCOME, "Hi, I'm Zenward's Transportation Assistant. I can help you choose a transportation service, understand how requests work, or get in touch with our team.");
  assert.equal(K.ASSISTANT_NAME, "Zenward Transportation Assistant");
  assert.match(R.PANEL_NOTE, /can't see or change bookings/);
  const publicText = ALL_REPLIES.map(textOf).join("\n") + R.PANEL_NOTE + K.ASSISTANT_NAME;
  assert.doesNotMatch(publicText, /\bAI\b|artificial intelligence|chat ?bot|\bbot\b|\bagent\b|dispatcher|\bmanager\b|\bAlice\b|\bSarah\b|\bDavid\b|join this chat|typing/i);
  for (const rel of ASSISTANT_FILES.filter((f) => f.startsWith("components"))) {
    const code = stripComments(read(rel));
    assert.doesNotMatch(code, /\bAI\b|chat ?bot|Robot|Sparkle|Magic|headshot|portrait|\.jpe?g|avatar/i, rel);
  }
});

// ------------------------------------------------------------- isolation + privacy

test("no network, no Nemryn, no intake, no external AI call", async () => {
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new Error("network not allowed");
  };
  try {
    for (const text of PHRASES) say(text);
    for (const id of QUICK) tap(id);
    await P.safeRespond(P.deterministicProvider, { kind: "text", text: "dialysis" }, CTX);
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(calls, 0);
  for (const rel of ASSISTANT_FILES) {
    const code = stripComments(read(rel));
    assert.doesNotMatch(code, /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|https?:\/\//, rel);
    assert.doesNotMatch(code, /nemryn|request-intake\/adapter|submitTransportationRequest|"use server"|process\.env|anthropic|openai/i, rel);
  }
});

test("no transcript persistence, storage, cookies or URL state", () => {
  for (const rel of ASSISTANT_FILES) {
    const code = stripComments(read(rel));
    assert.doesNotMatch(code, /localStorage|sessionStorage|indexedDB|document\.cookie|history\.(push|replace)State|router\.(push|replace)/, rel);
  }
});

test("analytics: only two parameter-free events, never message text or service", async () => {
  const code = ASSISTANT_FILES.filter((f) => f.startsWith("components")).map(read).join("\n");
  const calls = code.match(/track\(\{[^}]*\}\)/g) ?? [];
  assert.deepEqual([...new Set(calls)].sort(), [
    'track({ name: "transportation_assistant_opened" })',
    'track({ name: "transportation_assistant_quote_clicked" })',
  ]);
  const { sanitizeEvent } = await import("../analytics/events.ts");
  assert.deepEqual(sanitizeEvent({ name: "transportation_assistant_quote_clicked", serviceType: "dialysis", text: "my mum", url: "/x?y" }), { name: "transportation_assistant_quote_clicked" });
});

test("future provider boundary: invalid or failing provider replies fall back to the deterministic reply", async () => {
  const input = { kind: "text", text: "dialysis" };
  const unsafe = { id: "fake", respond: () => ({ kind: "service", paragraphs: ["Your ride is confirmed."], actions: [{ kind: "link", label: "x", href: "/request-transportation?service=dialysis&name=Ann" }] }) };
  assert.deepEqual(await P.safeRespond(unsafe, input, CTX), R.respond(input, CTX));
  const throwing = { id: "boom", respond: () => { throw new Error("down"); } };
  assert.deepEqual(await P.safeRespond(throwing, input, CTX), R.respond(input, CTX));
  const emergencyInput = { kind: "text", text: "I need an ambulance" };
  const ignoresEmergency = { id: "x", respond: () => R.respond({ kind: "quick", id: "start" }, CTX) };
  assert.equal((await P.safeRespond(ignoresEmergency, emergencyInput, CTX)).kind, "emergency");
});

test("accessibility semantics in launcher and panel", () => {
  const launcher = read("components/public/assistant/AssistantLauncher.tsx");
  assert.match(launcher, /aria-label="Open the Zenward Transportation Assistant"/);
  assert.match(launcher, /aria-haspopup="dialog"/);
  assert.match(launcher, /launcherRef\.current\?\.focus\(\)/);
  assert.match(launcher, /safe-area-inset-bottom/);
  assert.match(launcher, /dynamic\(loadPanel/);
  const panel = read("components/public/assistant/AssistantPanel.tsx");
  assert.match(panel, /role="dialog"/);
  assert.match(panel, /aria-labelledby="assistant-title"/);
  assert.match(panel, /event\.key === "Escape"\) onClose\(\)/);
  assert.match(panel, /document\.addEventListener\("keydown", onKey\)/);
  assert.match(panel, /aria-label="Close the Transportation Assistant"/);
  assert.match(panel, /role="log"/);
  assert.match(panel, /htmlFor="assistant-input"/);
  assert.match(panel, /aria-label="Send message"/);
  assert.match(panel, /max-h-\[80dvh\]/);
  assert.match(read("components/public/assistant/AssistantMessage.tsx"), /min-h-11/);
  assert.match(read("components/layout/PublicLayout.tsx"), /<AssistantLauncher context=/);
});

test("quote page: inline entry below 1024px, compact launcher from 1024px, one shared assistant", () => {
  const page = read("app/request-transportation/page.tsx");
  assert.equal((page.match(/<AssistantInlineEntry\b/g) ?? []).length, 1, "exactly one inline entry, outside the form steps");
  assert.ok(page.indexOf("<AssistantInlineEntry") < page.indexOf("<RequestTransportationForm"), "before the form");
  assert.doesNotMatch(read("components/public/RequestTransportationForm.tsx"), /Assistant/, "not inside any form step");
  const inline = read("components/public/assistant/AssistantInlineEntry.tsx");
  assert.match(inline, /lg:hidden/);
  assert.match(inline, /Need help choosing a service\?/);
  assert.match(inline, /Ask the Transportation Assistant/);
  assert.match(inline, /onClick=\{openTransportationAssistant\}/);
  assert.doesNotMatch(inline, /respond\(|AssistantPanel|lib\/assistant/, "no second engine or panel");
  const launcher = read("components/public/assistant/AssistantLauncher.tsx");
  assert.match(launcher, /usePathname\(\) === "\/request-transportation"/);
  assert.match(launcher, /compact \? "hidden w-12 justify-center lg:inline-flex" : "inline-flex pl-2 pr-4"/);
  assert.match(launcher, /window\.addEventListener\(OPEN_ASSISTANT_EVENT, onOpen\)/);
  assert.equal((launcher.match(/<AssistantPanel\b/g) ?? []).length, 1);
  // One mount point site-wide (campaign pages included, via PublicLayout); one panel import in the codebase.
  assert.equal((read("components/layout/PublicLayout.tsx").match(/<AssistantLauncher\b/g) ?? []).length, 1);
  const opener = read("components/public/assistant/open-assistant.ts");
  assert.match(opener, /new Event\(OPEN_ASSISTANT_EVENT\)/);
  assert.doesNotMatch(opener, /CustomEvent|detail/, "the open signal carries no data");
});
