// ZW-WEB-04G3: Pickup & assistance level + request-received experience.
// Canonical model, form validation/Review, the temporary assistanceNotes
// compatibility encoding (wire contract unchanged), the success gate and
// copy, Resources, explainer placement and Zenny. No network: the adapter
// test uses a mocked fetch.
//
//   npm test

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..");
const read = (rel) => readFileSync(path.join(src, rel), "utf8");
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const A = await import("./assistance-level.ts");
const model = await import("./quote-form/model.ts");
const success = await import("./quote-form/success.ts");
const { buildNemrynIntakeBody } = await import("./request-intake/nemryn-mapping.ts");
const { createRequestIntakeAdapter } = await import("./request-intake/adapter.ts");
const { PUBLIC_SERVICE_TYPES, SERVICE_TYPES } = await import("./request-intake/service-types.ts");
const { SERVICE_CATALOG } = await import("./service-catalog.ts");
const { QUOTE_RESPONSE_LINE } = await import("./trust.ts");
const { business } = await import("./business.ts");
const { respond } = await import("./assistant/responses.ts");
const { validateReply } = await import("./assistant/safety.ts");
const { RESOURCE_BODIES } = await import("./resources/content.ts");
const { RESOURCES, RESOURCE_PATHS } = await import("./resources/catalog.ts");

const TODAY = "2026-10-16";
const { quoteFormReducer, initialState, buildRequestInput, validateStep, reviewSections } = model;
const run = (state, actions) => actions.reduce((s, a) => quoteFormReducer(s, a), state);
const set = (field, value) => ({ type: "set", field, value });
const next = { type: "next", today: TODAY };

const WIRE_KEYS = [
  "integrationExternalId", "idempotencyKey", "requesterName", "requesterRelationship", "requesterPhone", "requesterEmail",
  "passengerName", "pickupDescription", "destinationDescription", "preferredDate", "preferredTime", "returnTripNeeded",
  "assistanceNotes", "additionalNotes", "serviceType", "recurringSchedule",
];
const KEY = "6f1c6c1e-1b1a-4c5e-9d1e-1a2b3c4d5e6f";

/** A visitor completing every step. */
function filled(service = "dialysis", { level = "door_to_door", notes = "Uses a walker.", recurring = false } = {}) {
  const schedule = recurring
    ? [set("frequency", "recurring"), set("recurringDays", ["monday", "wednesday"]), set("recurringStartDate", "2026-10-19"), set("recurringReturnExpected", "yes")]
    : [set("preferredDate", "2026-10-23"), set("preferredTime", "09:15"), set("returnTripNeeded", "yes")];
  return run(initialState(service), [
    set("pickupDescription", "QA Pickup"), set("destinationDescription", "QA Clinic"), next,
    ...schedule, next,
    set("passengerName", "QA Passenger"), ...(level ? [set("assistanceLevel", level)] : []), set("assistanceNotes", notes), next,
    set("requesterRelationship", "family"), set("requesterName", "QA Requester"), set("requesterPhone", "404-555-0142"), next,
  ]);
}

// ================================================================ canonical model

test("exactly four canonical assistance values, labels and owner-approved descriptions", () => {
  assert.deepEqual([...A.ASSISTANCE_LEVEL_VALUES], ["curb_to_curb", "door_to_door", "door_through_door", "unsure"]);
  assert.deepEqual(A.ASSISTANCE_LEVELS.map((l) => [l.value, l.label]), [
    ["curb_to_curb", "Curb-to-curb"], ["door_to_door", "Door-to-door"], ["door_through_door", "Door-through-door"], ["unsure", "Not sure"],
  ]);
  assert.deepEqual(A.ASSISTANCE_LEVELS.map((l) => l.description), [
    "Pickup and drop-off at the curb. Best when the passenger can get between the building and vehicle without driver escort.",
    "The driver meets the passenger at the building entrance and assists between the entrance and vehicle.",
    "Additional escort beyond the building entrance when arranged with Zenward.",
    "Tell us what help is needed and Zenward will review the request with you.",
  ]);
  assert.equal(A.ASSISTANCE_LEVEL_LABEL, "Pickup & assistance level");
  assert.equal(A.ASSISTANCE_LEVEL_REQUIRED, "Choose the assistance level that best fits the trip, or select Not sure.");
  assert.equal(A.ASSISTANCE_REVIEW_NOTE, "Specific assistance is reviewed and confirmed before the trip.");
  assert.ok(A.isAssistanceLevel("unsure") && !A.isAssistanceLevel("door-to-door") && !A.isAssistanceLevel(""));
});

test("no lifting, carrying, transfer, clinical, oxygen or stretcher claims in any assistance wording", () => {
  const all = A.ASSISTANCE_LEVELS.flatMap((l) => [l.label, l.description, l.short, l.wireLabel]).join(" ")
    + A.ASSISTANCE_REVIEW_NOTE + A.ASSISTANCE_UNSURE_GUIDANCE;
  assert.ok(!/\blift|\bcarr(y|ies|ying)\b|\btransfer|\bstair|\bclinical|\bmonitor|\boxygen|\bstretcher|\bspecial needs|\bpatient handling|\bfull assistance|\binside (the|a|your) (home|residence)/i.test(all));
});

test("assistance level is NOT a service: never a serviceType, catalogue entry or service URL", () => {
  for (const value of A.ASSISTANCE_LEVEL_VALUES) {
    assert.ok(!SERVICE_TYPES.includes(value) && !PUBLIC_SERVICE_TYPES.includes(value), value);
    assert.ok(!Object.values(SERVICE_CATALOG).some((s) => s.path.includes(value.replace(/_/g, "-")) || s.requestHref.includes(value)));
  }
  // Orthogonal: any service with any level, and the level never changes the service.
  for (const [service, level] of [["dialysis", "door_to_door"], ["wheelchair_transportation", "curb_to_curb"], ["airport_transportation", "unsure"]]) {
    const input = buildRequestInput(filled(service, { level }).values);
    assert.equal(input.serviceType, service);
    assert.equal(input.assistanceLevel, level);
  }
});

// ================================================================ form

test("assistance level is required on the Passenger step; Not sure is accepted", () => {
  const noLevel = filled("dialysis", { level: "" });
  assert.equal(model.STEPS[noLevel.step].id, "passenger", "blocked on the Passenger step");
  assert.equal(noLevel.errors.assistanceLevel, A.ASSISTANCE_LEVEL_REQUIRED);
  assert.equal(validateStep("passenger", { ...initialState().values, passengerName: "A", assistanceLevel: "unsure" }, TODAY).assistanceLevel, undefined);
  const unsure = filled("dialysis", { level: "unsure" });
  assert.equal(model.STEPS[unsure.step].id, "review");
  // Choosing a level clears its error.
  const cleared = quoteFormReducer(noLevel, set("assistanceLevel", "curb_to_curb"));
  assert.equal(cleared.errors.assistanceLevel, undefined);
});

test("the selected level survives Back/Next and Edit from Review", () => {
  const ready = filled("dialysis", { level: "door_through_door" });
  const back = run(ready, [{ type: "back" }, { type: "back" }, next, next]);
  assert.equal(back.values.assistanceLevel, "door_through_door");
  const edited = run(ready, [{ type: "goto", step: 2 }, next, next]);
  assert.equal(edited.values.assistanceLevel, "door_through_door");
  assert.equal(model.STEPS[edited.step].id, "review");
});

test("Review shows the level as its own structured field, never the encoded string", () => {
  const passenger = reviewSections(filled("dialysis", { level: "door_to_door", notes: "Uses a walker." }).values).find((s) => s.title === "Passenger");
  assert.deepEqual(passenger.rows.slice(0, 3), [
    { label: "Passenger", value: "QA Passenger" },
    { label: "Pickup & assistance level", value: "Door-to-door" },
    { label: "Mobility or assistance needs", value: "Uses a walker." },
  ]);
  assert.ok(!JSON.stringify(passenger).includes("Assistance level:"));
  const form = read("components/public/RequestTransportationForm.tsx");
  // Field order on the Passenger step: name, level, notes, anything else.
  const order = ["name=\"passengerName\"", "<AssistanceLevelField", "name=\"assistanceNotes\"", "name=\"additionalNotes\""].map((m) => form.indexOf(m));
  assert.ok(order.every((i, n) => i > 0 && (n === 0 || i > order[n - 1])), "Passenger step order");
});

test("the payload carries the structured level and the visitor's text unchanged (no encoding client-side)", () => {
  const input = buildRequestInput(filled("dialysis", { level: "door_to_door", notes: "Uses a walker." }).values);
  assert.equal(input.assistanceLevel, "door_to_door");
  assert.equal(input.assistanceNotes, "Uses a walker.");
  assert.ok(!/Assistance level:/.test(JSON.stringify(input)));
});

test("radio cards: native radios in a fieldset/legend, descriptions connected, error on the group, no dropdown", () => {
  const field = stripComments(read("components/public/quote-form/AssistanceLevelField.tsx"));
  assert.match(field, /<fieldset[\s\S]*aria-invalid=\{Boolean\(error\) \|\| undefined\}/);
  assert.match(field, /<legend[\s\S]*\{ASSISTANCE_LEVEL_LABEL\}/);
  assert.match(field, /type="radio"/);
  assert.match(field, /aria-describedby=\{descriptionId\}/);
  assert.match(field, /aria-describedby=\{cn\(noteId, error && errorId\)\}/);
  assert.match(field, /min-h-11/);
  assert.match(field, /sm:grid-cols-2/);
  assert.match(field, /has-\[:checked\]:border-brand-care-navy/, "selected state is a border change plus the native filled radio, not colour alone");
  assert.ok(!/<select|<Select/.test(field));
  assert.match(field, /ASSISTANCE_LEVELS\.map/, "options come from the canonical source");
});

// ================================================================ intake compatibility

test("encoding: stable prefix, free text preserved, no duplicate prefix, empty text handled, deterministic", () => {
  assert.equal(A.encodeAssistanceNotes("curb_to_curb"), "Assistance level: Curb-to-curb");
  assert.equal(A.encodeAssistanceNotes("unsure", "   "), "Assistance level: Not sure");
  const text = "Passenger uses a walker and may need extra time at pickup.";
  const encoded = A.encodeAssistanceNotes("door_to_door", text);
  assert.equal(encoded, `Assistance level: Door-to-door\n\nAdditional assistance:\n${text}`);
  assert.equal(A.encodeAssistanceNotes("door_to_door", text), encoded, "retry produces the same value");
  assert.equal(A.encodeAssistanceNotes("door_to_door", encoded), encoded, "re-encoding never duplicates the prefix");
  assert.equal(A.encodeAssistanceNotes("door_through_door", encoded), `Assistance level: Door-through-door\n\nAdditional assistance:\n${text}`);
  assert.equal((A.encodeAssistanceNotes("unsure", encoded).match(/Assistance level:/g) ?? []).length, 1);
  // Typed text is never cut: max free text + longest overhead fits the 2,000-character field.
  const longest = "x".repeat(A.ASSISTANCE_NOTES_MAX_LENGTH);
  for (const level of A.ASSISTANCE_LEVEL_VALUES) {
    const out = A.encodeAssistanceNotes(level, longest);
    assert.ok(out.length <= 2000, `${level} ${out.length}`);
    assert.ok(out.endsWith(longest));
  }
});

test("wire body: level encoded into assistanceNotes; key set, serviceType and idempotency unchanged", () => {
  for (const [service, recurring] of [["dialysis", false], ["airport_transportation", false], ["recurring_care", true]]) {
    const input = buildRequestInput(filled(service, { level: "door_to_door", notes: "Uses a walker.", recurring }).values);
    const body = buildNemrynIntakeBody(input, "int-test", KEY);
    for (const key of Object.keys(body)) assert.ok(WIRE_KEYS.includes(key), `unexpected wire key ${key}`);
    assert.equal("assistanceLevel" in body, false, "no new wire key");
    assert.equal(body.serviceType, service);
    assert.equal(body.idempotencyKey, KEY);
    assert.equal(body.assistanceNotes, "Assistance level: Door-to-door\n\nAdditional assistance:\nUses a walker.");
    assert.equal(body.additionalNotes, undefined, "never carried in additionalNotes");
    assert.equal(Boolean(body.recurringSchedule), recurring);
  }
  const noText = buildNemrynIntakeBody(buildRequestInput(filled("dialysis", { level: "unsure", notes: "" }).values), "int-test", KEY);
  assert.equal(noText.assistanceNotes, "Assistance level: Not sure");
  // Pre-04G3 inputs (no level) map exactly as before.
  const legacy = buildNemrynIntakeBody({ ...buildRequestInput(filled().values), assistanceLevel: undefined }, "int-test", KEY);
  assert.equal(legacy.assistanceNotes, "Uses a walker.");
});

test("Server Action: level validated and required server-side; notes capped so encoding fits", () => {
  const action = stripComments(read("app/request-transportation/actions.ts"));
  assert.match(action, /if \(isAssistanceLevel\(src\.assistanceLevel\)\) clean\.assistanceLevel = src\.assistanceLevel;/);
  assert.match(action, /!clean\.assistanceLevel \|\|/);
  assert.match(action, /assistanceNotes: cleanString\(src\.assistanceNotes, ASSISTANCE_NOTES_MAX_LENGTH\)/);
  const form = read("components/public/RequestTransportationForm.tsx");
  assert.match(form, /maxLength=\{ASSISTANCE_NOTES_MAX_LENGTH\}/);
  // The encoding lives only in the server-side mapping.
  for (const file of ["components/public/RequestTransportationForm.tsx", "lib/quote-form/model.ts", "app/request-transportation/actions.ts"]) {
    assert.ok(!/encodeAssistanceNotes/.test(read(file)), file);
  }
  assert.match(read("lib/request-intake/nemryn-mapping.ts"), /encodeAssistanceNotes\(input\.assistanceLevel, input\.assistanceNotes\)/);
});

test("adapter end-to-end (mocked fetch): one attempt, encoded notes, same key on retry, fail-closed unchanged", async () => {
  const saved = { ...process.env };
  const realFetch = globalThis.fetch;
  after(() => { globalThis.fetch = realFetch; for (const k of ["REQUEST_INTAKE_MODE", "PLATFORM_INTAKE_URL", "PLATFORM_INTAKE_INTEGRATION_ID"]) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } });
  process.env.REQUEST_INTAKE_MODE = "platform";
  process.env.PLATFORM_INTAKE_URL = "https://intake.example/api";
  process.env.PLATFORM_INTAKE_INTEGRATION_ID = "int-test";
  const bodies = [];
  let status = 503;
  globalThis.fetch = async (_url, init) => { bodies.push(JSON.parse(init.body)); return new Response(JSON.stringify(status === 200 ? { ok: true } : { ok: false }), { status }); };
  const input = buildRequestInput(filled("wheelchair_transportation", { level: "curb_to_curb", notes: "Power chair." }).values);
  const adapter = createRequestIntakeAdapter();
  const failed = await adapter.submit(input, { submissionId: KEY });
  assert.deepEqual([failed.ok, failed.delivered], [false, false]);
  status = 200;
  const ok = await adapter.submit(input, { submissionId: KEY });
  assert.deepEqual([ok.ok, ok.delivered], [true, true]);
  assert.equal(bodies.length, 2, "one HTTP attempt per submit");
  assert.deepEqual(bodies[0], bodies[1], "a retry sends the identical body, including the same idempotencyKey and encoded notes");
  assert.equal(bodies[0].assistanceNotes, "Assistance level: Curb-to-curb\n\nAdditional assistance:\nPower chair.");
  assert.equal(bodies[0].serviceType, "wheelchair_transportation");
});

// ================================================================ success experience

test("success renders ONLY for delivered:true; every other outcome stays on the form with values kept", () => {
  const ready = filled();
  const ok = run(ready, [{ type: "submitStart" }, { type: "submitResult", result: { ok: true, delivered: true } }]);
  assert.equal(ok.status, "success");
  for (const result of [
    { ok: true, delivered: false },
    { ok: false, delivered: false, error: "We couldn't submit your request. Please check the form and try again, or call us to arrange transportation." },
    { ok: false, delivered: false, error: "Online requests are temporarily unavailable right now. Please call us to arrange transportation." },
    { ok: false, delivered: false },
  ]) {
    const s = run(ready, [{ type: "submitStart" }, { type: "submitResult", result }]);
    assert.equal(s.status, "error", JSON.stringify(result));
    assert.deepEqual(s.values, ready.values);
    assert.ok(s.submitError);
  }
  const threw = run(ready, [{ type: "submitStart" }, { type: "submitFailed", message: "x" }]);
  assert.equal(threw.status, "error");
  const form = stripComments(read("components/public/RequestTransportationForm.tsx"));
  assert.match(form, /if \(status === "success"\) return <RequestSuccess ref=\{successRef\} \/>;/);
  assert.match(stripComments(read("lib/quote-form/model.ts")), /if \(isDeliveredConversion\(action\.result\)\) return \{ \.\.\.state, status: "success", delivered: true \};/);
});

test("success copy: received, not confirmed, What happens next, exact 2-hour wording", () => {
  assert.equal(success.SUCCESS_HEADING, "Request received");
  assert.equal(success.SUCCESS_RECEIVED, "Zenward has received your transportation request.");
  assert.equal(success.SUCCESS_NOT_CONFIRMED, "This is not a confirmed ride yet.");
  assert.equal(success.SUCCESS_NEXT_HEADING, "What happens next");
  assert.deepEqual(success.SUCCESS_STEPS, [
    { title: "Request received", text: "Your transportation request has reached Zenward." },
    { title: "Review", text: "Our team reviews availability, trip details and pricing." },
    { title: "Follow-up", text: "Requests received during working hours are reviewed and answered within 2 hours." },
    { title: "Confirmation", text: "Transportation is arranged only after Zenward confirms the details with you." },
  ]);
  assert.equal(success.SUCCESS_STEPS[2].text, QUOTE_RESPONSE_LINE);
  const all = JSON.stringify(success);
  assert.ok(!/30 minutes|24\/7|around the clock|guarantee/i.test(all));
});

test("What happens next is explanatory, not a live status tracker", () => {
  const ui = stripComments(read("components/public/quote-form/RequestSuccess.tsx"));
  const copy = JSON.stringify(success);
  for (const re of [/reviewing now/i, /in progress/i, /driver assigned/i, /vehicle assigned/i, /\bcurrent\b/i, /\bpending\b/i, /\bcompleted?\b/i, /your request status/i]) {
    assert.ok(!re.test(copy), `copy ${re}`);
  }
  assert.ok(!/aria-current|role="progressbar"|<progress|animate-|aria-live|role="status"|isComplete|isActive|\bactive\b/.test(ui), "no status semantics or animation");
  assert.match(ui, /<ol/);
  assert.match(ui, /SUCCESS_STEPS\.map/);
  // All four steps are styled identically (one class string inside the map).
  assert.equal((ui.match(/rounded-full border border-border-strong/g) ?? []).length, 1);
});

test("success: heading takes focus, phone uses canonical business data, restrained actions, no IDs or reference", () => {
  const ui = stripComments(read("components/public/quote-form/RequestSuccess.tsx"));
  assert.match(ui, /<h2 ref=\{headingRef\} tabIndex=\{-1\}/);
  const form = read("components/public/RequestTransportationForm.tsx");
  assert.match(form, /successRef\.current\?\.closest\("\[data-request-success\]"\)\?\.scrollIntoView\(\{ block: "start" \}\);\s*successRef\.current\?\.focus\(\{ preventScroll: true \}\);/);
  // A failed Continue focuses the radio inside an invalid fieldset, not the fieldset itself.
  assert.match(form, /invalid\?\.tagName === "FIELDSET"/);
  assert.match(ui, /<TrackedPhoneLink[\s\S]*?Call Zenward \{business\.phoneDisplay\}/);
  assert.ok(!ui.includes(business.phoneDisplay) && !/678|tel:/.test(ui), "no hard-coded phone");
  assert.equal(success.SUCCESS_HELP_HEADING, "Questions about your request?");
  assert.deepEqual(success.SUCCESS_ACTIONS.map((a) => a.href), ["/services", "/"]);
  const both = ui + JSON.stringify(success) + read("components/public/RequestTransportationForm.tsx");
  assert.ok(!/request another|another trip/i.test(both), "no Request another trip");
  assert.ok(!/referenceId|Reference:|idempotency|integrationExternalId|submissionId\}|tenant|organization_id/i.test(ui));
  assert.ok(!/referenceId/.test(read("lib/quote-form/model.ts")), "the form no longer carries a reference");
  assert.ok(!/referenceId|Reference:/.test(read("components/public/RequestTransportationForm.tsx")));
});

test("no persistence added: form and success keep nothing in storage, cookies or the URL", () => {
  for (const file of ["components/public/RequestTransportationForm.tsx", "components/public/quote-form/RequestSuccess.tsx", "components/public/quote-form/AssistanceLevelField.tsx", "lib/quote-form/model.ts", "lib/quote-form/success.ts", "lib/assistance-level.ts"]) {
    const code = stripComments(read(file));
    assert.ok(!/localStorage|sessionStorage|indexedDB|document\.cookie|history\.(push|replace)State|router\.(push|replace)|searchParams\.set/.test(code), file);
  }
});

// ================================================================ explainer + Resources

test("explainer: canonical source, full on wheelchair, compact on senior/medical/services; not on every service page", () => {
  const ex = stripComments(read("components/public/AssistanceLevelExplainer.tsx"));
  assert.match(ex, /ASSISTANCE_LEVELS\.map/);
  assert.match(ex, /Choose the level of assistance that fits the trip/);
  assert.ok(!/Curb-to-curb|Door-to-door/.test(ex), "labels are never retyped");
  const page = read("components/public/ServicePage.tsx");
  assert.match(page, /"wheelchair-transportation": "full",\s*"senior-medical-transportation": "compact",\s*"medical-appointments": "compact",\s*\};/);
  assert.match(read("app/services/page.tsx"), /<AssistanceLevelExplainer variant="compact" \/>/);
  for (const slug of ["dialysis-transportation", "airport-transportation", "hospital-discharge-transportation", "rehabilitation-transportation", "recurring-care-transportation"]) {
    assert.ok(!new RegExp(`"${slug}": "(full|compact)"`).test(page), slug);
  }
});

test("Resources: wheelchair guide has all four levels; checklist item; no new Resource or URL; 04K SEO intact", () => {
  const r4 = RESOURCE_BODIES["wheelchair-accessible-transportation-guide"];
  const defs = r4.blocks.find((b) => b.type === "definitions");
  assert.deepEqual(defs.items.map((i) => i.term), ["Curb-to-curb", "Door-to-door", "Door-through-door", "Not sure"]);
  assert.ok(RESOURCE_BODIES["medical-transportation-trip-checklist"].tool.some((i) => i.label === "Pickup & assistance level"));
  assert.equal(RESOURCES.length, 6);
  assert.ok(!RESOURCE_PATHS.some((p) => /curb|door|assistance/.test(p)));
  const sitemap = read("app/sitemap.ts");
  assert.match(sitemap, /"\/resources",\s*\.\.\.RESOURCE_PATHS/);
  assert.match(read("lib/resources/schema.ts"), /author: \{ "@type": "Organization", name: siteName, url: siteUrl \}/);
});

// ================================================================ Zenny

const ctx = { marketName: "Metro Atlanta", summaries: Object.fromEntries(Object.keys(SERVICE_CATALOG).map((s) => [s, "Summary."])) };
const ask = (text) => respond({ kind: "text", text }, ctx);
const words = (r) => [...r.paragraphs, ...r.actions.map((a) => a.label)].join(" ");
const UNSUPPORTED = /\blift|\bcarr(y|ies|ying)\b|\btransfer|\bstair|\boxygen|\bstretcher|\bclinical|\bmonitor|\bwe (can|will) (always )?(provide|offer) door[- ]through|\bguarantee|\balways available\b|\bramp|\bsecurement|\bweight\b/i;

test("Zenny answers each assistance level with the canonical definition", () => {
  const cases = {
    "What is curb-to-curb?": "curb_to_curb",
    "What does curb to curb mean?": "curb_to_curb",
    "What is door-to-door?": "door_to_door",
    "What is door through door?": "door_through_door",
  };
  for (const [q, level] of Object.entries(cases)) {
    const r = ask(q);
    assert.deepEqual(validateReply(r), [], q);
    assert.equal(r.kind, "assistance", q);
    const def = A.assistanceLevel(level);
    assert.equal(r.paragraphs[0], `${def.label}: ${def.description}`, q);
    assert.ok(r.paragraphs.join(" ").includes(A.ASSISTANCE_REVIEW_NOTE), q);
    assert.ok(r.actions.some((a) => a.kind === "link" && a.href === "/request-transportation"), q);
    assert.ok(r.actions.some((a) => a.kind === "link" && a.href === "/resources/wheelchair-accessible-transportation-guide"), q);
    assert.ok(!UNSUPPORTED.test(words(r)), q);
  }
});

test("Zenny compares levels, answers 'come to the door', and guides 'Not sure'", () => {
  const diff = ask("What's the difference between door-to-door and curb-to-curb?");
  assert.deepEqual(validateReply(diff), []);
  assert.ok(diff.paragraphs[0].startsWith("Curb-to-curb:") && diff.paragraphs[1].startsWith("Door-to-door:"));

  const door = ask("Can the driver come to the door?");
  assert.deepEqual(validateReply(door), []);
  assert.equal(door.kind, "assistance");
  assert.match(door.paragraphs.join(" "), /The driver meets the passenger at the building entrance/);
  assert.ok(!UNSUPPORTED.test(words(door)));

  for (const q of ["What assistance level do I need?", "I don't know which assistance option to choose."]) {
    const r = ask(q);
    assert.deepEqual(validateReply(r), [], q);
    assert.equal(r.kind, "assistance", q);
    assert.ok(r.paragraphs.includes("You can select Not sure on the request form and describe what help is needed. Zenward will review the request with you."), q);
    assert.ok(!/you need|you should choose|we recommend/i.test(r.paragraphs.join(" ")), "never assesses ability or recommends a level");
    assert.deepEqual(r.actions.filter((a) => a.kind === "reply").map((a) => a.id), ["assistance:curb_to_curb", "assistance:door_to_door", "assistance:door_through_door"]);
  }
  const quick = respond({ kind: "quick", id: "assistance:door_through_door" }, ctx);
  assert.equal(quick.paragraphs[0], `Door-through-door: ${A.assistanceLevel("door_through_door").description}`);
});

test("Zenny never promises lifting or transfers; a named service is preselected, never an assistance 'service'", () => {
  const lift = ask("Can you lift my father into the car?");
  assert.deepEqual(validateReply(lift), []);
  assert.ok(!/\byes\b|\bwe can\b|\blift/i.test(lift.paragraphs.join(" ")));
  const wc = ask("door to door for my mom in a wheelchair");
  assert.deepEqual(validateReply(wc), []);
  assert.equal(wc.actions[0].href, "/request-transportation?service=wheelchair_transportation");
  for (const r of [wc, ask("What is door-to-door?")]) {
    for (const a of r.actions) if (a.kind === "link") assert.ok(!/service=(curb|door|unsure)/.test(a.href));
  }
});
