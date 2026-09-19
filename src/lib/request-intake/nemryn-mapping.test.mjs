// Unit tests for the pure Nemryn intake mapping (P1-PILOT-S4B-R3).
//
//   npm test

import test from "node:test";
import assert from "node:assert/strict";

const { buildNemrynIntakeBody, interpretNemrynResponse } = await import("./nemryn-mapping.ts");
const { SERVICE_TYPES } = await import("./service-types.ts");

// Nemryn's frozen production allow-list of top-level keys (its route rejects any other).
const NEMRYN_ALLOWED_KEYS = new Set([
  "integrationExternalId",
  "idempotencyKey",
  "requesterName",
  "requesterRelationship",
  "requesterPhone",
  "requesterEmail",
  "passengerName",
  "pickupDescription",
  "destinationDescription",
  "preferredDate",
  "preferredTime",
  "returnTripNeeded",
  "assistanceNotes",
  "additionalNotes",
  "serviceType",
  "recurringSchedule",
]);
const NEMRYN_SERVICE_TYPES = [
  "medical_appointment",
  "dialysis",
  "rehabilitation",
  "hospital_discharge",
  "recurring_care",
  "senior_medical",
  "wheelchair_transportation",
  "other",
];
const PROTECTED = ["organizationId", "tenantId", "passengerId", "driverId", "vehicleId", "tripId", "state", "source"];

function baseInput(overrides = {}) {
  return {
    serviceType: "medical_appointment",
    requesterName: "Dana Ellsworth",
    requesterRelationship: "family",
    requesterPhone: "404-555-0142",
    passengerName: "Marion Ellsworth",
    pickupDescription: "418 Peachtree Manor, Apt 6B",
    destinationDescription: "Northside Dialysis Center",
    returnTripNeeded: "yes",
    ...overrides,
  };
}

const build = (input = baseInput(), id = "idem-1") => buildNemrynIntakeBody(input, "zenward-web-int", id);

// ---------------------------------------------------------------------
// buildNemrynIntakeBody
// ---------------------------------------------------------------------

test("required requester fields and integration id map 1:1", () => {
  const body = build();
  assert.equal(body.integrationExternalId, "zenward-web-int");
  assert.equal(body.requesterName, "Dana Ellsworth");
  assert.equal(body.requesterRelationship, "family");
  assert.equal(body.requesterPhone, "404-555-0142");
  assert.equal(body.pickupDescription, "418 Peachtree Manor, Apt 6B");
  assert.equal(body.destinationDescription, "Northside Dialysis Center");
  assert.equal(body.returnTripNeeded, "yes");
});

test("requesterEmail is omitted when absent and sent when present", () => {
  assert.equal("requesterEmail" in build(), false);
  assert.equal(build(baseInput({ requesterEmail: "dana@example.com" })).requesterEmail, "dana@example.com");
});

test("passengerName is a direct structured field, even when equal to requesterName", () => {
  assert.equal(build().passengerName, "Marion Ellsworth");
  const self = build(baseInput({ requesterName: "Marion Ellsworth", passengerName: "Marion Ellsworth" }));
  assert.equal(self.passengerName, "Marion Ellsworth");
});

test("serviceType is a direct structured field and every Zenward value equals Nemryn's frozen enum", () => {
  assert.deepEqual([...SERVICE_TYPES].sort(), [...NEMRYN_SERVICE_TYPES].sort());
  for (const serviceType of SERVICE_TYPES) {
    assert.equal(build(baseInput({ serviceType })).serviceType, serviceType);
  }
});

test("one-time request has no recurringSchedule key", () => {
  assert.equal("recurringSchedule" in build(), false);
  assert.equal("recurringSchedule" in build(baseInput({ recurringSchedule: undefined })), false);
});

test("recurring request sends the structured schedule object", () => {
  const schedule = {
    daysOfWeek: ["monday", "wednesday", "friday"],
    startDate: "2026-10-05",
    endDate: "2026-12-18",
    appointmentTime: "09:15",
    returnTripExpected: true,
  };
  const body = build(baseInput({ serviceType: "dialysis", recurringSchedule: schedule }));
  assert.deepEqual(body.recurringSchedule, schedule);
  assert.notEqual(body.recurringSchedule, schedule, "a copy, not the input reference");
  assert.equal(body.serviceType, "dialysis");
});

test("recurring schedule optional members are omitted when absent; returnTripExpected:false is kept", () => {
  const minimal = build(baseInput({ recurringSchedule: { daysOfWeek: ["tuesday"], startDate: "2026-10-06" } }));
  assert.deepEqual(minimal.recurringSchedule, { daysOfWeek: ["tuesday"], startDate: "2026-10-06" });
  const no = build(
    baseInput({ recurringSchedule: { daysOfWeek: ["tuesday"], startDate: "2026-10-06", returnTripExpected: false } }),
  );
  assert.equal(no.recurringSchedule.returnTripExpected, false);
});

test("returnTripNeeded passes through all three values", () => {
  for (const returnTripNeeded of ["yes", "no", "not_sure"]) {
    assert.equal(build(baseInput({ returnTripNeeded })).returnTripNeeded, returnTripNeeded);
  }
});

test("preferredDate / preferredTime / assistanceNotes are sent only when present", () => {
  const withOptional = build(baseInput({ preferredDate: "2026-09-25", preferredTime: "09:15", assistanceNotes: "Uses a walker." }));
  assert.equal(withOptional.preferredDate, "2026-09-25");
  assert.equal(withOptional.preferredTime, "09:15");
  assert.equal(withOptional.assistanceNotes, "Uses a walker.");
  const without = build();
  for (const key of ["preferredDate", "preferredTime", "assistanceNotes", "additionalNotes"]) {
    assert.equal(key in without, false, key);
  }
});

test("additionalNotes is exactly the requester's text -- nothing folded in", () => {
  const notes = "Please call the daughter first.";
  const body = build(
    baseInput({
      serviceType: "dialysis",
      additionalNotes: notes,
      recurringSchedule: { daysOfWeek: ["monday"], startDate: "2026-10-05" },
    }),
  );
  assert.equal(body.additionalNotes, notes);
});

test("no passenger / service / schedule text appears in any notes field", () => {
  const body = build(
    baseInput({
      serviceType: "wheelchair_transportation",
      assistanceNotes: "Ramp needed.",
      recurringSchedule: { daysOfWeek: ["monday"], startDate: "2026-10-05", appointmentTime: "09:00" },
    }),
  );
  assert.equal("additionalNotes" in body, false, "no notes are invented when the requester wrote none");
  assert.equal(body.assistanceNotes, "Ramp needed.");
  const noteText = `${body.additionalNotes ?? ""}|${body.assistanceNotes ?? ""}`;
  for (const leaked of ["Marion", "Passenger", "Service requested", "Wheelchair", "Recurring", "2026-10-05"]) {
    assert.equal(noteText.includes(leaked), false, leaked);
  }
});

test("wire body contains only keys in Nemryn's frozen allow-list, and no protected identifier", () => {
  const body = build(
    baseInput({
      requesterEmail: "dana@example.com",
      preferredDate: "2026-09-25",
      preferredTime: "09:15",
      assistanceNotes: "a",
      additionalNotes: "b",
      recurringSchedule: { daysOfWeek: ["monday"], startDate: "2026-10-05" },
      // Extra properties a tampered caller might attach must not reach the wire.
      organizationId: "org-1",
      tenantId: "t-1",
      passengerId: "p-1",
      driverId: "d-1",
      vehicleId: "v-1",
      tripId: "trip-1",
      state: "confirmed",
      source: "evil",
    }),
  );
  for (const key of Object.keys(body)) assert.ok(NEMRYN_ALLOWED_KEYS.has(key), `unexpected key ${key}`);
  for (const key of PROTECTED) assert.equal(key in body, false, key);
});

test("idempotencyKey is passed through unchanged: same submission -> same key", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  const first = build(baseInput(), id);
  const retry = build(baseInput(), id);
  assert.equal(first.idempotencyKey, id);
  assert.equal(retry.idempotencyKey, first.idempotencyKey);
});

test("a new submission with a fresh id gets a different idempotencyKey", () => {
  assert.notEqual(build(baseInput(), "key-a").idempotencyKey, build(baseInput(), "key-b").idempotencyKey);
});

// ---------------------------------------------------------------------
// interpretNemrynResponse
// ---------------------------------------------------------------------

test("200 {ok:true} is delivered and carries no reference", () => {
  const outcome = interpretNemrynResponse(200, { ok: true, unexpected: "ignored" });
  assert.deepEqual(outcome, { delivered: true });
});

test("generic 400 is a rejection", () => {
  assert.deepEqual(interpretNemrynResponse(400, { ok: false, error: "invalid_request" }), {
    delivered: false,
    failure: "rejected",
  });
});

test("other 4xx are rejections", () => {
  for (const status of [401, 403, 404, 409, 413, 422]) {
    assert.equal(interpretNemrynResponse(status, { ok: false }).failure, "rejected", String(status));
  }
});

test("429 is rate_limited", () => {
  assert.deepEqual(interpretNemrynResponse(429, { ok: false }), { delivered: false, failure: "rate_limited" });
});

test("5xx is unavailable regardless of body", () => {
  for (const status of [500, 502, 503, 504]) {
    assert.deepEqual(interpretNemrynResponse(status, undefined), { delivered: false, failure: "unavailable" });
  }
});

test("a 2xx whose body is not exactly ok:true is never delivered", () => {
  for (const body of [undefined, null, {}, { ok: false }, { ok: "true" }, { ok: 1 }, "ok", []]) {
    assert.deepEqual(interpretNemrynResponse(200, body), { delivered: false, failure: "unconfirmed" });
  }
  assert.equal(interpretNemrynResponse(201, { ok: true }).delivered, false, "only 200 counts");
  assert.equal(interpretNemrynResponse(204, undefined).delivered, false);
});
