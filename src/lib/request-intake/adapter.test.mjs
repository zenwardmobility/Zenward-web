// Adapter tests (P1-PILOT-S4B-R3): drive the real adapter with a stubbed
// global `fetch` -- no network, no Nemryn.
//
//   npm test

import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

const { createRequestIntakeAdapter } = await import("./adapter.ts");

const URL_OK = "https://app.nemryn.test/api/public-intake/website";
const INTEGRATION = "zenward-web-int-123";
const REAL_FETCH = globalThis.fetch;
const ENV_KEYS = ["REQUEST_INTAKE_MODE", "PLATFORM_INTAKE_URL", "PLATFORM_INTAKE_INTEGRATION_ID", "PLATFORM_INTAKE_ORIGIN"];
const savedEnv = {};
const calls = [];
let logs;
const REAL_CONSOLE = { info: console.info, warn: console.warn, error: console.error };

function input(overrides = {}) {
  return {
    serviceType: "dialysis",
    requesterName: "Zenward Website E2E QA",
    requesterRelationship: "family",
    requesterPhone: "404-555-0142",
    passengerName: "PILOT-ZENWARD-WEBSITE-QA",
    pickupDescription: "PILOT-ZENWARD-WEBSITE-QA Pickup",
    destinationDescription: "PILOT-ZENWARD-WEBSITE-QA Destination",
    returnTripNeeded: "yes",
    additionalNotes: "Real notes only.",
    ...overrides,
  };
}

const jsonResponse = (status, body) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

function mockFetch(handler) {
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init, body: init?.body ? JSON.parse(init.body) : undefined });
    return handler(url, init);
  };
}

function platform() {
  process.env.REQUEST_INTAKE_MODE = "platform";
  process.env.PLATFORM_INTAKE_URL = URL_OK;
  process.env.PLATFORM_INTAKE_INTEGRATION_ID = INTEGRATION;
  return createRequestIntakeAdapter();
}

beforeEach(() => {
  calls.length = 0;
  logs = [];
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k];
  for (const level of ["info", "warn", "error"]) console[level] = (...args) => logs.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "));
});

afterEach(() => {
  globalThis.fetch = REAL_FETCH;
  Object.assign(console, REAL_CONSOLE);
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
});

// Words that must never reach a visitor.
const FORBIDDEN_COPY = /nemryn|supabase|postgres|pgrst|\bZW\d|integration|rate.?limit|\b(400|429|500|502|503)\b|stack|undefined|\[object|fetch|timeout/i;
function assertCustomerSafe(result) {
  assert.equal(result.ok, false);
  assert.equal(result.delivered, false);
  assert.equal(typeof result.error, "string");
  assert.equal(FORBIDDEN_COPY.test(result.error), false, result.error);
}

// ---------------------------------------------------------------------
// Success + wire format
// ---------------------------------------------------------------------

test("Nemryn 200 {ok:true} -> delivered, and no reference is invented", async () => {
  mockFetch(() => jsonResponse(200, { ok: true }));
  const result = await platform().submit(input(), { submissionId: "sub-1" });
  assert.deepEqual(result, { ok: true, delivered: true });
  assert.equal("referenceId" in result, false);
});

test("posts one flat JSON body to the configured URL, server-to-server, with no auth header", async () => {
  mockFetch(() => jsonResponse(200, { ok: true }));
  await platform().submit(
    input({ recurringSchedule: { daysOfWeek: ["monday", "friday"], startDate: "2026-10-05", returnTripExpected: true } }),
    { submissionId: "sub-2" },
  );
  assert.equal(calls.length, 1);
  const [{ url, init, body }] = calls;
  assert.equal(url, URL_OK);
  assert.equal(init.method, "POST");
  assert.equal(init.headers["content-type"], "application/json");
  const headerNames = Object.keys(init.headers).map((h) => h.toLowerCase());
  assert.equal(headerNames.includes("authorization"), false);
  assert.equal(headerNames.includes("idempotency-key"), false);
  // Nemryn's origin-locked integration fails closed without an Origin; a server-side fetch sends none itself.
  assert.equal(init.headers.origin, "https://www.zenwardmobility.com");
  assert.equal(body.integrationExternalId, INTEGRATION);
  assert.equal(body.idempotencyKey, "sub-2");
  assert.equal(body.passengerName, "PILOT-ZENWARD-WEBSITE-QA");
  assert.equal(body.serviceType, "dialysis");
  assert.deepEqual(body.recurringSchedule, {
    daysOfWeek: ["monday", "friday"],
    startDate: "2026-10-05",
    returnTripExpected: true,
  });
  assert.equal(body.additionalNotes, "Real notes only.");
  for (const key of ["schemaVersion", "submissionId", "submittedAt", "source", "request", "organizationId", "tenantId"]) {
    assert.equal(key in body, false, key);
  }
});

test("Origin is header-only (never in the body) and PLATFORM_INTAKE_ORIGIN overrides it, trailing slash trimmed", async () => {
  mockFetch(() => jsonResponse(200, { ok: true }));
  process.env.PLATFORM_INTAKE_ORIGIN = "https://staging.zenwardmobility.test/";
  await platform().submit(input(), { submissionId: "sub-origin" });
  assert.equal(calls[0].init.headers.origin, "https://staging.zenwardmobility.test");
  assert.equal(JSON.stringify(calls[0].body).includes("zenwardmobility"), false);
  assert.equal("origin" in calls[0].body, false);
});

// ---------------------------------------------------------------------
// Idempotency
// ---------------------------------------------------------------------

test("a retry of the same submission re-sends the SAME idempotencyKey", async () => {
  let n = 0;
  mockFetch(() => (++n === 1 ? jsonResponse(503, { ok: false }) : jsonResponse(200, { ok: true })));
  const adapter = platform();
  const meta = { submissionId: "22222222-2222-4222-8222-222222222222" };
  const first = await adapter.submit(input(), meta);
  const retry = await adapter.submit(input(), meta);
  assert.equal(first.delivered, false);
  assert.equal(retry.delivered, true);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].body.idempotencyKey, meta.submissionId);
  assert.equal(calls[1].body.idempotencyKey, meta.submissionId);
});

test("the adapter makes ONE attempt per submit() and never mints its own id", async () => {
  mockFetch(() => jsonResponse(500, {}));
  await platform().submit(input(), { submissionId: "only-one" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.idempotencyKey, "only-one");
});

test("a genuinely new submission sends a fresh idempotencyKey", async () => {
  mockFetch(() => jsonResponse(200, { ok: true }));
  const adapter = platform();
  await adapter.submit(input(), { submissionId: "sub-A" });
  await adapter.submit(input(), { submissionId: "sub-B" });
  assert.notEqual(calls[0].body.idempotencyKey, calls[1].body.idempotencyKey);
});

// ---------------------------------------------------------------------
// Failures -> customer-safe copy
// ---------------------------------------------------------------------

test("generic 400 -> calm submission-failure copy", async () => {
  mockFetch(() => jsonResponse(400, { ok: false, error: "invalid_request", detail: "PGRST116 ZW002 postgres" }));
  const result = await platform().submit(input(), { submissionId: "s" });
  assertCustomerSafe(result);
  assert.match(result.error, /couldn't submit/i);
});

test("429 -> retry-later copy with no threshold detail", async () => {
  mockFetch(() => jsonResponse(429, { ok: false }));
  const result = await platform().submit(input(), { submissionId: "s" });
  assertCustomerSafe(result);
  assert.match(result.error, /try again in a little while/i);
});

test("5xx -> temporary-unavailable copy", async () => {
  for (const status of [500, 502, 503]) {
    mockFetch(() => jsonResponse(status, "<html>upstream: supabase postgres stack trace</html>"));
    const result = await platform().submit(input(), { submissionId: "s" });
    assertCustomerSafe(result);
    assert.match(result.error, /temporarily unavailable/i);
  }
});

test("network failure -> temporary-unavailable copy, raw error not exposed", async () => {
  mockFetch(() => {
    throw new TypeError("fetch failed: ECONNREFUSED 10.0.0.1:443 supabase");
  });
  const result = await platform().submit(input(), { submissionId: "s" });
  assertCustomerSafe(result);
  assert.match(result.error, /temporarily unavailable/i);
});

test("timeout -> temporary-unavailable copy", async () => {
  mockFetch(() => {
    const err = new Error("The operation was aborted due to timeout");
    err.name = "TimeoutError";
    throw err;
  });
  const result = await platform().submit(input(), { submissionId: "s" });
  assertCustomerSafe(result);
  assert.match(result.error, /temporarily unavailable/i);
  assert.ok(logs.some((l) => l.includes("timeout")));
});

test("the request is sent with an abort signal (timeout budget)", async () => {
  mockFetch(() => jsonResponse(200, { ok: true }));
  await platform().submit(input(), { submissionId: "s" });
  assert.ok(calls[0].init.signal instanceof AbortSignal);
});

test("200 with a malformed (non-JSON) body is NOT delivered", async () => {
  mockFetch(() => new Response("<html>not json</html>", { status: 200 }));
  const result = await platform().submit(input(), { submissionId: "s" });
  assertCustomerSafe(result);
});

test("200 with an unexpected JSON body is NOT delivered", async () => {
  for (const body of [{}, { ok: false }, { success: true }, { ok: "yes" }, null]) {
    mockFetch(() => jsonResponse(200, body));
    assertCustomerSafe(await platform().submit(input(), { submissionId: "s" }));
  }
});

test("logs carry outcome metadata only -- never request content or the integration id", async () => {
  mockFetch(() => jsonResponse(400, { ok: false }));
  await platform().submit(input(), { submissionId: "log-sub" });
  const all = logs.join("\n");
  assert.ok(all.includes("log-sub"));
  for (const secret of ["PILOT-ZENWARD-WEBSITE-QA", "404-555-0142", INTEGRATION, "Real notes only."]) {
    assert.equal(all.includes(secret), false, secret);
  }
});

// ---------------------------------------------------------------------
// Mode selection / configuration
// ---------------------------------------------------------------------

test("platform mode without configuration fails closed and never calls fetch", async () => {
  process.env.REQUEST_INTAKE_MODE = "platform";
  delete process.env.PLATFORM_INTAKE_URL;
  delete process.env.PLATFORM_INTAKE_INTEGRATION_ID;
  mockFetch(() => jsonResponse(200, { ok: true }));
  const result = await createRequestIntakeAdapter().submit(input(), { submissionId: "s" });
  assertCustomerSafe(result);
  assert.equal(calls.length, 0);
});

test("platform mode refuses a non-https URL and never calls fetch", async () => {
  process.env.REQUEST_INTAKE_MODE = "platform";
  process.env.PLATFORM_INTAKE_URL = "http://app.nemryn.test/api";
  process.env.PLATFORM_INTAKE_INTEGRATION_ID = INTEGRATION;
  mockFetch(() => jsonResponse(200, { ok: true }));
  assertCustomerSafe(await createRequestIntakeAdapter().submit(input(), { submissionId: "s" }));
  assert.equal(calls.length, 0);
});

test("stub mode (explicit or default) delivers nothing and never calls fetch", async () => {
  mockFetch(() => jsonResponse(200, { ok: true }));
  for (const mode of ["stub", undefined, "unknown-value"]) {
    if (mode === undefined) delete process.env.REQUEST_INTAKE_MODE;
    else process.env.REQUEST_INTAKE_MODE = mode;
    const result = await createRequestIntakeAdapter().submit(input(), { submissionId: "s" });
    assert.equal(result.ok, true);
    assert.equal(result.delivered, false);
  }
  assert.equal(calls.length, 0);
});
