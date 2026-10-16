// ZW-WEB-04C2: Airport Transportation intake activation (replaces the 04C1
// contract-gate tests). Nemryn accepts `airport_transportation` since Core
// migration 20261015135000 / app a0a65aa, so the value is now a live, public,
// preselectable service sent to Nemryn as itself. The contract-pending
// mechanism remains available but is empty.
//
//   npm test

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const {
  SERVICE_TYPES,
  PUBLIC_SERVICE_TYPES,
  SERVICE_TYPE_OPTIONS,
  PUBLIC_SERVICE_PARAMS,
  CONTRACT_PENDING_SERVICE_LABELS,
  isServiceType,
  isPublicServiceType,
  resolveServiceParam,
  defaultFrequencyFor,
} = await import("./service-types.ts");
const { SERVICE_CATALOG, SERVICE_ORDER } = await import("../service-catalog.ts");
const { buildNemrynIntakeBody } = await import("./nemryn-mapping.ts");

const input = (overrides = {}) => ({
  serviceType: "airport_transportation",
  requesterName: "Fictional Requester",
  requesterRelationship: "family",
  requesterPhone: "555-0100",
  passengerName: "Fictional Passenger",
  pickupDescription: "Fictional pickup",
  destinationDescription: "Fictional airport",
  returnTripNeeded: "no",
  ...overrides,
});

test("no service is contract-pending any more", () => {
  assert.deepEqual(Object.keys(CONTRACT_PENDING_SERVICE_LABELS), []);
});

test("airport_transportation is in the wire enum and the public intake set", () => {
  assert.ok(SERVICE_TYPES.includes("airport_transportation"));
  assert.ok(PUBLIC_SERVICE_TYPES.includes("airport_transportation"));
  assert.ok(isServiceType("airport_transportation"));
  assert.ok(isPublicServiceType("airport_transportation"));
});

test("the request form offers Airport Transportation, before Other", () => {
  const values = SERVICE_TYPE_OPTIONS.map((o) => o.value);
  assert.equal(SERVICE_TYPE_OPTIONS.find((o) => o.value === "airport_transportation")?.label, "Airport Transportation");
  assert.equal(values.indexOf("airport_transportation"), values.indexOf("other") - 1);
});

test("?service=airport_transportation preselects Airport Transportation (one-time by default)", () => {
  assert.equal(PUBLIC_SERVICE_PARAMS.airport_transportation, "airport_transportation");
  assert.equal(resolveServiceParam("airport_transportation"), "airport_transportation");
  assert.equal(defaultFrequencyFor("airport_transportation"), "one_time");
});

test("invalid or look-alike service values are still rejected", () => {
  for (const v of ["airport", "Airport_Transportation", "airport_transportation ", "airport-transportation", "shuttle", "taxi", "", undefined]) {
    assert.equal(isPublicServiceType(v), false, String(v));
    assert.equal(resolveServiceParam(v), undefined, String(v));
  }
});

test("the airport catalogue entry is live and its quote link preselects the service", () => {
  const airport = SERVICE_CATALOG["airport-transportation"];
  assert.deepEqual(airport.intake, { kind: "live", serviceType: "airport_transportation" });
  assert.equal(airport.requestHref, "/request-transportation?service=airport_transportation");
});

test("every catalogue service is live and maps to a public wire value it preselects", () => {
  for (const slug of SERVICE_ORDER) {
    const entry = SERVICE_CATALOG[slug];
    assert.equal(entry.intake.kind, "live", slug);
    assert.ok(isPublicServiceType(entry.intake.serviceType), slug);
    assert.equal(entry.requestHref, `/request-transportation?service=${entry.intake.serviceType}`, slug);
  }
});

test("the Nemryn body carries airport_transportation as itself (never remapped to other)", () => {
  const body = buildNemrynIntakeBody(input(), "fictional-integration", "11111111-1111-4111-8111-111111111111");
  assert.equal(body.serviceType, "airport_transportation");
  assert.equal(body.integrationExternalId, "fictional-integration");
  assert.equal(body.idempotencyKey, "11111111-1111-4111-8111-111111111111");
  assert.equal(JSON.stringify(body).includes('"serviceType":"other"'), false);
  for (const key of ["organizationId", "tenantId", "organization_id", "tenant_id"]) assert.equal(key in body, false);
});

test("a recurring airport request keeps its structured schedule", () => {
  const schedule = { daysOfWeek: ["friday"], startDate: "2026-11-06", returnTripExpected: true };
  const body = buildNemrynIntakeBody(input({ recurringSchedule: schedule, returnTripNeeded: "yes" }), "int", "key");
  assert.equal(body.serviceType, "airport_transportation");
  assert.deepEqual(body.recurringSchedule, schedule);
});

test("the Server Action still gates serviceType with isPublicServiceType before the adapter", () => {
  const action = readFileSync(path.join(here, "../../app/request-transportation/actions.ts"), "utf8");
  const gate = action.indexOf("if (!isPublicServiceType(src.serviceType))");
  const submit = action.indexOf("getRequestIntakeAdapter().submit(");
  assert.ok(gate > 0 && submit > gate);
});

test("the airport page no longer tells visitors to choose Other", () => {
  const services = readFileSync(path.join(here, "../services.ts"), "utf8");
  assert.equal(/Choose Other as the service and describe your airport trip/.test(services), false);
});
