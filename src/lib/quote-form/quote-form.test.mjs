// ZW-WEB-04G: multi-step quote form. Pure model + calendar/time helpers,
// contract parity with the pre-04G form, delivery-gated events, and source
// checks for wording, privacy and accessibility semantics.
//
//   npm test

import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../..");
const read = (rel) => readFileSync(path.join(src, rel), "utf8");

const dates = await import("./dates.ts");
const model = await import("./model.ts");
const { buildNemrynIntakeBody } = await import("../request-intake/nemryn-mapping.ts");
const { findTenancyKeys } = await import("../request-intake/tenancy.ts");
const { parseRecurringSchedule } = await import("../request-intake/recurring.ts");
const { resolveServiceParam } = await import("../request-intake/service-types.ts");
const { createRequestIntakeAdapter } = await import("../request-intake/adapter.ts");

const TODAY = "2026-10-16";
const { quoteFormReducer, initialState, buildRequestInput, validateStep, reviewSections } = model;

const FORM_FILES = [
  "components/public/RequestTransportationForm.tsx",
  "components/public/RecurringScheduleFields.tsx",
  "components/public/quote-form/QuoteCalendar.tsx",
  "components/public/quote-form/PreferredTimeSelect.tsx",
  "components/public/quote-form/QuoteStepper.tsx",
  "lib/quote-form/model.ts",
  "lib/quote-form/dates.ts",
];

/** Drive the reducer like a visitor: set fields, press Continue. */
function run(state, actions) {
  return actions.reduce((s, a) => quoteFormReducer(s, a), state);
}
const set = (field, value) => ({ type: "set", field, value });
const next = { type: "next", today: TODAY };

const ONE_TIME = [
  set("pickupDescription", "QA Pickup, 1 Main St"),
  set("destinationDescription", "QA Clinic"),
  next,
  set("preferredDate", "2026-10-23"),
  set("preferredTime", "09:15"),
  set("returnTripNeeded", "yes"),
  next,
  set("passengerName", "QA Passenger"),
  set("assistanceLevel", "door_to_door"),
  set("assistanceNotes", "Uses a walker."),
  next,
  set("requesterRelationship", "family"),
  set("requesterName", "QA Requester"),
  set("requesterPhone", "404-555-0142"),
  next,
];

/**
 * The pre-04G form's payload logic, verbatim in behaviour (git 12e1d0c,
 * RequestTransportationForm.tsx handleSubmit), fed the same answers as a
 * FormData-like map. Used to prove 04G sends the identical payload.
 */
function legacyPayload(f) {
  const get = (k) => (f[k] === undefined ? null : f[k]);
  const isRecurring = f.tripFrequency === "recurring";
  const days = isRecurring ? f.recurringDay ?? [] : [];
  const returnExpected = isRecurring ? get("recurringReturnExpected") === "yes" : undefined;
  const input = {
    serviceType: get("serviceType"),
    requesterName: String(get("requesterName") ?? ""),
    requesterRelationship: get("requesterRelationship"),
    requesterPhone: String(get("requesterPhone") ?? ""),
    requesterEmail: String(get("requesterEmail") ?? "") || undefined,
    passengerName: String(get("passengerName") ?? ""),
    pickupDescription: String(get("pickupDescription") ?? ""),
    destinationDescription: String(get("destinationDescription") ?? ""),
    preferredDate: isRecurring ? undefined : String(get("preferredDate") ?? "") || undefined,
    preferredTime: isRecurring ? undefined : String(get("preferredTime") ?? "") || undefined,
    returnTripNeeded: isRecurring ? (returnExpected ? "yes" : "no") : get("returnTripNeeded"),
    assistanceNotes: String(get("assistanceNotes") ?? "") || undefined,
    additionalNotes: String(get("additionalNotes") ?? "") || undefined,
  };
  if (isRecurring) {
    input.recurringSchedule = {
      daysOfWeek: days,
      startDate: String(get("recurringStartDate") ?? ""),
      endDate: String(get("recurringEndDate") ?? "") || undefined,
      appointmentTime: String(get("recurringAppointmentTime") ?? "") || undefined,
      returnTripExpected: returnExpected,
    };
  }
  return input;
}

const NEMRYN_KEYS = new Set([
  "integrationExternalId", "idempotencyKey", "requesterName", "requesterRelationship", "requesterPhone", "requesterEmail",
  "passengerName", "pickupDescription", "destinationDescription", "preferredDate", "preferredTime", "returnTripNeeded",
  "assistanceNotes", "additionalNotes", "serviceType", "recurringSchedule",
]);

// ------------------------------------------------------------- preselection

test("service URL preselection: every public ?service= value preselects; junk does not", () => {
  for (const value of ["medical_appointment", "dialysis", "rehabilitation", "hospital_discharge", "recurring_care", "senior_medical", "wheelchair_transportation", "airport_transportation"]) {
    const resolved = resolveServiceParam(value);
    assert.equal(resolved, value);
    assert.equal(initialState(resolved).values.serviceType, value);
  }
  assert.equal(initialState(resolveServiceParam("junk")).values.serviceType, "");
  assert.equal(initialState("other").values.serviceType, "other"); // a valid public type if ever passed
  assert.equal(initialState("recurring_care").values.frequency, "recurring");
  assert.equal(initialState("dialysis").values.frequency, "one_time");
});

// ------------------------------------------------------------- calendar

test("calendar: past dates rejected, today and future accepted", () => {
  assert.equal(dates.isBefore("2026-10-15", TODAY), true);
  assert.equal(dates.isBefore(TODAY, TODAY), false);
  const base = run(initialState("dialysis"), ONE_TIME.slice(0, 3));
  const past = run(base, [set("preferredDate", "2026-10-15"), set("returnTripNeeded", "no"), next]);
  assert.equal(past.step, 1);
  assert.match(past.errors.preferredDate, /today or a future date/);
  for (const ok of [TODAY, "2026-12-31", "2027-02-28"]) {
    const s = run(base, [set("preferredDate", ok), set("returnTripNeeded", "no"), next]);
    assert.equal(s.step, 2, ok);
  }
});

test("one-time preferredDate is required; pickup time stays optional (No preference)", () => {
  const base = run(initialState("dialysis"), ONE_TIME.slice(0, 3));
  const noDate = run(base, [set("preferredTime", "09:15"), set("returnTripNeeded", "no"), next]);
  assert.equal(noDate.step, 1);
  assert.match(noDate.errors.preferredDate, /preferred trip date/);
  // Date chosen, time left at "No preference" (""): valid, and preferredTime is omitted.
  const noTime = run(base, [set("preferredDate", "2026-10-23"), set("returnTripNeeded", "not_sure"), next]);
  assert.equal(noTime.step, 2);
  assert.equal(noTime.errors.preferredTime, undefined);
  const full = run(noTime, ONE_TIME.slice(7));
  const input = buildRequestInput(full.values);
  assert.equal(input.preferredDate, "2026-10-23");
  assert.equal(input.preferredTime, undefined);
  assert.equal(input.returnTripNeeded, "not_sure");
  assert.equal("preferredTime" in buildNemrynIntakeBody(input, "int", "6f1c6c1e-1b1a-4c5e-9d1e-1a2b3c4d5e6f"), false);
  // Recurring: startDate still required, and no preferredDate is needed or sent.
  const rec = run(initialState("recurring_care"), [...ONE_TIME.slice(0, 3), set("recurringDays", ["monday"]), set("recurringReturnExpected", "no"), next]);
  assert.match(rec.errors.recurringStartDate, /start/);
  assert.equal(rec.errors.preferredDate, undefined);
  // The calendar marks the one-time date as required.
  assert.match(read("components/public/RequestTransportationForm.tsx"), /label="Preferred trip date"\s+required/);
});

test("calendar math and formatting are timezone-safe", () => {
  assert.equal(dates.formatLongDate("2026-10-23"), "Friday, October 23, 2026");
  assert.equal(dates.formatLongDate("2027-01-01"), "Friday, January 1, 2027");
  // 03:30 UTC on Oct 17 is still Oct 16 in Metro Atlanta.
  assert.equal(dates.todayInMarket(new Date("2026-10-17T03:30:00Z")), "2026-10-16");
  assert.equal(dates.todayInMarket(new Date("2026-10-17T04:30:00Z")), "2026-10-17");
  assert.equal(dates.addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(dates.addDays("2026-03-08", 1), "2026-03-09"); // US DST change day
  const oct = dates.monthWeeks({ year: 2026, month: 9 });
  assert.equal(oct.flat().filter(Boolean).length, 31);
  assert.equal(oct[0].indexOf("2026-10-01"), 4); // Thursday, Sunday-first grid
  assert.ok(oct.every((w) => w.length === 7));
  assert.equal(dates.formatMonth({ year: 2026, month: 9 }), "October 2026");
  assert.deepEqual(dates.addMonths({ year: 2026, month: 11 }, 1), { year: 2027, month: 0 });
});

// ------------------------------------------------------------- time

test("preferred time: 15-minute preferences in HH:MM, retained into the payload", () => {
  const all = dates.PREFERRED_TIME_GROUPS.flatMap((g) => g.options);
  assert.equal(all.length, 96);
  assert.equal(new Set(all.map((o) => o.value)).size, 96);
  assert.ok(all.every((o) => /^([01]\d|2[0-3]):(00|15|30|45)$/.test(o.value)));
  assert.equal(all.find((o) => o.value === "09:15").label, "9:15 AM");
  assert.equal(dates.formatTime12h("00:00"), "12:00 AM");
  assert.equal(dates.formatTime12h("12:30"), "12:30 PM");
  const s = run(initialState("dialysis"), ONE_TIME);
  assert.equal(buildRequestInput(s.values).preferredTime, "09:15");
});

test("time and date controls never claim availability or booking", () => {
  const banned = /\bavailable (times?|slots?|rides?)|\bslots?\b|reserve|book now|book (a|your) ride|confirm booking|choose an available/i;
  for (const rel of FORM_FILES) {
    const code = read(rel).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
    assert.doesNotMatch(code, banned, rel);
  }
  assert.equal(model.SUBMIT_LABEL, "Submit Quote Request");
  assert.match(model.SCHEDULE_REASSURANCE, /preferred date and pickup time.*Zenward will review availability and confirm/);
  assert.match(model.NOT_A_BOOKING, /not a confirmed booking/);
  assert.ok(dates.PREFERRED_TIME_GROUPS.every((g) => !/avail/i.test(g.label)));
});

// ------------------------------------------------------------- steps

test("multi-step: Back/Next preserve every value", () => {
  let s = run(initialState("airport_transportation"), ONE_TIME);
  assert.equal(s.step, 4);
  const before = structuredClone(s.values);
  s = run(s, [{ type: "back" }, { type: "back" }, { type: "back" }, { type: "back" }]);
  assert.equal(s.step, 0);
  assert.deepEqual(s.values, before);
  s = run(s, [next, next, next, next]);
  assert.equal(s.step, 4);
  assert.deepEqual(s.values, before);
});

test("per-step validation: required fields block only their own step, errors clear on edit", () => {
  let s = run(initialState(), [next]);
  assert.equal(s.step, 0);
  assert.deepEqual(Object.keys(s.errors).sort(), ["destinationDescription", "pickupDescription", "serviceType"]);
  s = run(s, [set("serviceType", "dialysis")]);
  assert.equal(s.errors.serviceType, undefined);
  // Nothing is validated before the visitor presses Continue.
  assert.deepEqual(initialState().errors, {});
  assert.deepEqual(Object.keys(validateStep("passenger", initialState().values, TODAY)).sort(), ["assistanceLevel", "passengerName"]);
  assert.deepEqual(Object.keys(validateStep("contact", initialState().values, TODAY)).sort(), ["requesterName", "requesterPhone", "requesterRelationship"]);
  assert.match(validateStep("contact", { ...initialState().values, requesterEmail: "nope" }, TODAY).requesterEmail, /valid email/);
  assert.deepEqual(validateStep("review", initialState().values, TODAY), {});
});

test("return trip: No / Yes / Not sure yet map to the existing wire values", () => {
  assert.deepEqual(model.RETURN_TRIP_OPTIONS.map((o) => o.value), ["no", "yes", "not_sure"]);
  for (const answer of ["no", "yes", "not_sure"]) {
    const s = run(initialState("dialysis"), [...ONE_TIME.slice(0, 5), set("returnTripNeeded", answer)]);
    assert.equal(buildRequestInput(s.values).returnTripNeeded, answer);
  }
  assert.match(model.RETURN_TRIP_NOTE, /Zenward will confirm return-trip timing/);
  const missing = run(initialState("dialysis"), [...ONE_TIME.slice(0, 3), next]);
  assert.match(missing.errors.returnTripNeeded, /return trip/);
});

test("no fake return-time field: the contract has none, so the form has none", () => {
  for (const rel of FORM_FILES) assert.doesNotMatch(read(rel), /returnTime|returnPickup|return_time/i, rel);
  const payload = buildRequestInput(run(initialState("dialysis"), ONE_TIME).values);
  assert.ok(!Object.keys(payload).some((k) => /return/i.test(k) && k !== "returnTripNeeded"));
  assert.doesNotMatch(String(payload.additionalNotes ?? "") + String(payload.assistanceNotes ?? ""), /return/i);
});

test("recurring schedule: validated, ordered, contract-only, return derived", () => {
  const base = run(initialState("recurring_care"), ONE_TIME.slice(0, 3));
  const missing = run(base, [next]);
  assert.deepEqual(Object.keys(missing.errors).sort(), ["recurringDays", "recurringReturnExpected", "recurringStartDate"]);
  const s = run(base, [
    set("recurringDays", ["friday", "monday", "wednesday"]),
    set("recurringStartDate", "2026-11-02"),
    set("recurringAppointmentTime", "07:30"),
    set("recurringReturnExpected", "yes"),
    next,
  ]);
  assert.equal(s.step, 2);
  const input = buildRequestInput(s.values);
  assert.deepEqual(input.recurringSchedule.daysOfWeek, ["monday", "wednesday", "friday"]);
  assert.equal(input.preferredDate, undefined);
  assert.equal(input.preferredTime, undefined);
  assert.equal(input.returnTripNeeded, "yes");
  assert.equal(parseRecurringSchedule(JSON.parse(JSON.stringify(input.recurringSchedule))).ok, true);
  const badEnd = run(base, [set("recurringDays", ["monday"]), set("recurringStartDate", "2026-11-02"), set("recurringEndDate", "2026-11-01"), set("recurringReturnExpected", "no"), next]);
  assert.match(badEnd.errors.recurringEndDate, /on or after/);
  assert.match(model.RECURRING_NOTE, /isn't an automatically booked series/);
  // Choosing Recurring Care before touching the schedule defaults to Recurring.
  assert.equal(run(initialState(), [set("serviceType", "recurring_care")]).values.frequency, "recurring");
});

// ------------------------------------------------------------- review

test("review reflects entered values in plain language, with no internal ids", () => {
  const s = run(initialState("airport_transportation"), ONE_TIME);
  const sections = reviewSections(s.values);
  assert.deepEqual(sections.map((x) => x.title), ["Trip", "Schedule", "Passenger", "Requester"]);
  const flat = Object.fromEntries(sections.flatMap((x) => x.rows.map((r) => [r.label, r.value])));
  assert.equal(flat.Service, "Airport Transportation");
  assert.equal(flat["Preferred date"], "Friday, October 23, 2026");
  assert.equal(flat["Preferred pickup time"], "9:15 AM");
  assert.match(flat["Return trip"], /^Yes/);
  assert.equal(flat.Relationship, "Family member");
  assert.equal(flat.Email, "Not provided");
  assert.doesNotMatch(JSON.stringify(sections), /idempotency|integration|submissionId|organization|tenant/i);
});

test("edit from review returns to the step, keeps data, and can't skip ahead", () => {
  let s = run(initialState("dialysis"), ONE_TIME);
  const values = structuredClone(s.values);
  s = run(s, [{ type: "goto", step: 1 }]);
  assert.equal(s.step, 1);
  assert.deepEqual(s.values, values);
  s = run(s, [next, next, next]);
  assert.equal(s.step, 4);
  const fresh = run(initialState("dialysis"), [{ type: "goto", step: 3 }]);
  assert.equal(fresh.step, 0);
});

// ------------------------------------------------------------- contract parity

/** 04G3: the pre-04G fields are unchanged; the only addition is the structured assistanceLevel (never a wire key). */
function withoutLevel(input) {
  const { assistanceLevel, ...rest } = input;
  assert.equal(assistanceLevel, "door_to_door");
  return rest;
}

test("contract parity: one-time, recurring and airport payloads equal the pre-04G form (+ structured assistanceLevel)", () => {
  const oneTime = run(initialState("dialysis"), ONE_TIME);
  assert.deepEqual(
    withoutLevel(buildRequestInput(oneTime.values)),
    legacyPayload({
      tripFrequency: "one_time", serviceType: "dialysis", requesterName: "QA Requester", requesterRelationship: "family",
      requesterPhone: "404-555-0142", requesterEmail: "", passengerName: "QA Passenger", pickupDescription: "QA Pickup, 1 Main St",
      destinationDescription: "QA Clinic", preferredDate: "2026-10-23", preferredTime: "09:15", returnTripNeeded: "yes",
      assistanceNotes: "Uses a walker.", additionalNotes: "",
    }),
  );

  const recurring = run(initialState("recurring_care"), [
    ...ONE_TIME.slice(0, 3),
    set("recurringDays", ["tuesday", "thursday"]),
    set("recurringStartDate", "2026-11-03"),
    set("recurringEndDate", "2026-12-31"),
    set("recurringReturnExpected", "no"),
    next,
    ...ONE_TIME.slice(7),
  ]);
  assert.deepEqual(
    withoutLevel(buildRequestInput(recurring.values)),
    legacyPayload({
      tripFrequency: "recurring", serviceType: "recurring_care", requesterName: "QA Requester", requesterRelationship: "family",
      requesterPhone: "404-555-0142", requesterEmail: "", passengerName: "QA Passenger", pickupDescription: "QA Pickup, 1 Main St",
      destinationDescription: "QA Clinic", recurringDay: ["tuesday", "thursday"], recurringStartDate: "2026-11-03",
      recurringEndDate: "2026-12-31", recurringAppointmentTime: "", recurringReturnExpected: "no",
      assistanceNotes: "Uses a walker.", additionalNotes: "",
    }),
  );

  for (const s of [oneTime, recurring, run(initialState("airport_transportation"), ONE_TIME)]) {
    const input = buildRequestInput(s.values);
    assert.deepEqual(findTenancyKeys(input), []);
    const body = buildNemrynIntakeBody(input, "int-test", "6f1c6c1e-1b1a-4c5e-9d1e-1a2b3c4d5e6f");
    for (const key of Object.keys(body)) assert.ok(NEMRYN_KEYS.has(key), `unexpected wire key ${key}`);
    // No UI-only state can leak: none of these names exist on the wire.
    for (const uiKey of ["frequency", "step", "errors", "recurringDays", "recurringStartDate", "status", "tripFrequency"]) {
      assert.equal(uiKey in body, false, uiKey);
    }
  }
});

let realFetch;
afterEach(() => {
  if (realFetch) globalThis.fetch = realFetch;
  realFetch = undefined;
  for (const k of ["REQUEST_INTAKE_MODE", "PLATFORM_INTAKE_URL", "PLATFORM_INTAKE_INTEGRATION_ID"]) delete process.env[k];
});

test("Airport payload on the wire is unchanged and idempotency key passes through", async () => {
  const calls = [];
  realFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    calls.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
  };
  process.env.REQUEST_INTAKE_MODE = "platform";
  process.env.PLATFORM_INTAKE_URL = "https://app.nemryn.test/api/public-intake/website";
  process.env.PLATFORM_INTAKE_INTEGRATION_ID = "zenward-web-int-123";
  const quiet = { info: console.info, warn: console.warn, error: console.error };
  console.info = console.warn = console.error = () => {};
  try {
    const input = buildRequestInput(run(initialState("airport_transportation"), ONE_TIME).values);
    const key = "6f1c6c1e-1b1a-4c5e-9d1e-1a2b3c4d5e6f";
    const first = await createRequestIntakeAdapter().submit(input, { submissionId: key });
    const retry = await createRequestIntakeAdapter().submit(input, { submissionId: key });
    assert.equal(first.delivered, true);
    assert.equal(retry.delivered, true);
    assert.equal(calls[0].serviceType, "airport_transportation");
    assert.equal(calls[0].idempotencyKey, key);
    assert.equal(calls[1].idempotencyKey, key);
    assert.equal(calls[0].preferredDate, "2026-10-23");
    assert.equal(calls[0].preferredTime, "09:15");
    assert.equal("recurringSchedule" in calls[0], false);
  } finally {
    Object.assign(console, quiet);
  }
});

// ------------------------------------------------------------- submit + events

test("success only after ok; the conversion counts only delivered:true; failure never shows success", () => {
  const ready = run(initialState("dialysis"), ONE_TIME);
  const delivered = run(ready, [{ type: "submitStart" }, { type: "submitResult", result: { ok: true, delivered: true } }]);
  assert.equal(delivered.status, "success");
  assert.equal(delivered.delivered, true);
  assert.equal(model.isDeliveredConversion({ ok: true, delivered: true }), true);
  assert.equal(model.isDeliveredConversion({ ok: true, delivered: false }), false);
  assert.equal(model.isDeliveredConversion({ ok: false, delivered: false }), false);

  const failed = run(ready, [{ type: "submitStart" }, { type: "submitResult", result: { ok: false, delivered: false, error: "Online requests are temporarily unavailable right now. Please call us to arrange transportation." } }]);
  assert.equal(failed.status, "error");
  assert.equal(failed.step, 4);
  assert.match(failed.submitError, /call us/);
  assert.deepEqual(failed.values, ready.values, "a failure keeps everything the visitor entered");
  assert.equal(failed.referenceId, undefined);

  const threw = run(ready, [{ type: "submitStart" }, { type: "submitFailed", message: "x" }]);
  assert.equal(threw.status, "error");

  const form = read("components/public/RequestTransportationForm.tsx");
  assert.match(form, /if \(isDeliveredConversion\(result\)\) track\(\{ name: "transportation_quote_submitted" \}\)/);
  assert.equal((form.match(/transportation_quote_submitted/g) ?? []).length, 1);
  assert.match(form, /TrackedPhoneLink[\s\S]*?Call \{business\.phoneDisplay\}/);
});

test("quote-started fires once per mount, with no form values", () => {
  let count = 0;
  const fire = model.once(() => count++);
  fire(); fire(); fire();
  assert.equal(count, 1);
  const form = read("components/public/RequestTransportationForm.tsx");
  assert.match(form, /once\(\(\) => track\(\{ name: "transportation_quote_started" \}\)\)/);
  assert.match(form, /onFocus=\{\(\) => markStarted\.current\(\)\}/);
});

// ------------------------------------------------------------- privacy + a11y

test("no browser persistence, cookies, URL state or vendor analytics in the form", () => {
  for (const rel of FORM_FILES) {
    // Comments explain what is NOT used; scan code only.
    const code = read(rel).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
    assert.doesNotMatch(code, /localStorage|sessionStorage|indexedDB|document\.cookie/, rel);
    assert.doesNotMatch(code, /gtag|dataLayer|googletagmanager|google-analytics|fbq\(/, rel);
    assert.doesNotMatch(code, /history\.(push|replace)State|router\.(push|replace)|searchParams\.set/, rel);
  }
});

test("accessibility semantics in the stepper, calendar and form", () => {
  const stepper = read("components/public/quote-form/QuoteStepper.tsx");
  assert.match(stepper, /aria-label="Request progress"/);
  assert.match(stepper, /aria-current=\{active \? "step" : undefined\}/);
  assert.match(stepper, /\(completed\)/);
  assert.match(stepper, /Step \{current \+ 1\} of \{total\}/);
  const cal = read("components/public/quote-form/QuoteCalendar.tsx");
  assert.match(cal, /aria-pressed=\{selected\}/);
  assert.match(cal, /disabled=\{past\}/);
  assert.match(cal, /aria-label=\{`\$\{formatLongDate\(iso\)\}/);
  assert.match(cal, /aria-label="Previous month"/);
  assert.match(cal, /aria-label="Next month"/);
  assert.match(cal, /h-11 w-full min-w-11/);
  for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"]) assert.match(cal, new RegExp(key));
  assert.match(cal, /aria-live="polite"/);
  const form = read("components/public/RequestTransportationForm.tsx");
  assert.match(form, /role="alert"/);
  assert.match(form, /sr-only">\s*Step \{step \+ 1\} of \{STEPS\.length\}/);
  assert.match(form, /aria-label=\{`Edit \$\{section\.title\.toLowerCase\(\)\} details`\}/);
  const time = read("components/public/quote-form/PreferredTimeSelect.tsx");
  assert.match(time, /<label htmlFor=\{id\}/);
});

test("the form asks only what transportation needs: no diagnosis, record, insurance or SSN fields", () => {
  const code = FORM_FILES.map(read).join("\n");
  assert.doesNotMatch(code, /diagnos|medical record|insurance id|member id|\bSSN\b|social security|medication/i);
});
