// ZW-WEB-04C2: airport_transportation through the REAL platform adapter with a
// mocked `fetch` (no network, no Nemryn, fictional data only).
//
//   npm test

import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

const { createRequestIntakeAdapter } = await import("./adapter.ts");

const URL_OK = "https://app.nemryn.test/api/public-intake/website";
const INTEGRATION = "fictional-zenward-integration";
const KEY = "22222222-2222-4222-8222-222222222222";
const ENV_KEYS = ["REQUEST_INTAKE_MODE", "PLATFORM_INTAKE_URL", "PLATFORM_INTAKE_INTEGRATION_ID", "PLATFORM_INTAKE_ORIGIN"];
const REAL_FETCH = globalThis.fetch;
const REAL_CONSOLE = { info: console.info, warn: console.warn, error: console.error };
const saved = {};
const calls = [];

const airport = (overrides = {}) => ({
  serviceType: "airport_transportation",
  requesterName: "Fictional Requester",
  requesterRelationship: "family",
  requesterPhone: "555-0100",
  passengerName: "Fictional Passenger",
  pickupDescription: "Fictional home address",
  destinationDescription: "Fictional airport",
  returnTripNeeded: "no",
  ...overrides,
});

const json = (status, body) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function mock(handler) {
  globalThis.fetch = async (url, init) => {
    calls.push({ url, headers: new Headers(init?.headers), body: JSON.parse(init.body) });
    return handler();
  };
}

function platform() {
  process.env.REQUEST_INTAKE_MODE = "platform";
  process.env.PLATFORM_INTAKE_URL = URL_OK;
  process.env.PLATFORM_INTAKE_INTEGRATION_ID = INTEGRATION;
  delete process.env.PLATFORM_INTAKE_ORIGIN;
  return createRequestIntakeAdapter();
}

beforeEach(() => {
  calls.length = 0;
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  for (const level of ["info", "warn", "error"]) console[level] = () => {};
});

afterEach(() => {
  globalThis.fetch = REAL_FETCH;
  Object.assign(console, REAL_CONSOLE);
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

test("airport request: exact serviceType, integration id, idempotency key and Origin; delivered only on 200 {ok:true}", async () => {
  mock(() => json(200, { ok: true }));
  const result = await platform().submit(airport(), { submissionId: KEY });
  assert.deepEqual(result, { ok: true, delivered: true });
  assert.equal(calls.length, 1);
  const [call] = calls;
  assert.equal(call.url, URL_OK);
  assert.equal(call.body.serviceType, "airport_transportation");
  assert.equal(call.body.integrationExternalId, INTEGRATION);
  assert.equal(call.body.idempotencyKey, KEY);
  assert.equal(call.headers.get("origin"), "https://www.zenwardmobility.com");
  assert.equal(call.headers.get("authorization"), null);
});

test("a retry of the same airport submission re-sends the same idempotency key (no duplicate request)", async () => {
  mock(() => json(200, { ok: true }));
  const adapter = platform();
  await adapter.submit(airport(), { submissionId: KEY });
  await adapter.submit(airport(), { submissionId: KEY });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].body.idempotencyKey, calls[1].body.idempotencyKey);
});

test("Nemryn rejecting airport (e.g. Airport not enabled in the org's Services -> generic 400) is NOT a success", async () => {
  mock(() => json(400, { ok: false, error: "generic" }));
  const result = await platform().submit(airport(), { submissionId: KEY });
  assert.equal(result.ok, false);
  assert.equal(result.delivered, false);
  assert.match(result.error, /call/i);
});

test("an unexpected 2xx body is never treated as delivered", async () => {
  mock(() => json(200, { accepted: true }));
  const result = await platform().submit(airport(), { submissionId: KEY });
  assert.equal(result.delivered, false);
});

test("unlinked (stub) mode fails closed for airport too: no fetch, no false success", async () => {
  mock(() => json(200, { ok: true }));
  process.env.REQUEST_INTAKE_MODE = "stub";
  const result = await createRequestIntakeAdapter().submit(airport(), { submissionId: KEY });
  assert.equal(result.ok, false);
  assert.equal(result.delivered, false);
  assert.equal(calls.length, 0);
});

test("existing services are unaffected: wheelchair and a recurring dialysis request still map exactly", async () => {
  mock(() => json(200, { ok: true }));
  const adapter = platform();
  await adapter.submit(airport({ serviceType: "wheelchair_transportation" }), { submissionId: KEY });
  const schedule = { daysOfWeek: ["monday", "wednesday"], startDate: "2026-11-02", returnTripExpected: true };
  await adapter.submit(airport({ serviceType: "dialysis", recurringSchedule: schedule, returnTripNeeded: "yes" }), {
    submissionId: "33333333-3333-4333-8333-333333333333",
  });
  assert.equal(calls[0].body.serviceType, "wheelchair_transportation");
  assert.equal(calls[1].body.serviceType, "dialysis");
  assert.deepEqual(calls[1].body.recurringSchedule, schedule);
});
