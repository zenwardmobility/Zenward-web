// ZW-WEB-04H2 (owner revision): the Zenny follow-up number travels ONLY through
// the trusted server-side contact-intake path, phone only, delivered:true only
// on a genuine provider 2xx.
//
//   npm test

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

const ENV = ["CONTACT_INTAKE_MODE", "CONTACT_INTAKE_EMAIL", "CONTACT_EMAIL_FROM", "CONTACT_EMAIL_API_KEY"];
const saved = {};
const REAL_FETCH = globalThis.fetch;
const quiet = { warn: console.warn, error: console.error, info: console.info };
let calls;

beforeEach(() => {
  calls = [];
  for (const k of ENV) saved[k] = process.env[k];
  console.warn = console.error = console.info = () => {};
});
afterEach(() => {
  globalThis.fetch = REAL_FETCH;
  Object.assign(console, quiet);
  for (const k of ENV) (saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k]));
});

/** Fresh module instances (the adapter is cached per module). */
async function load() {
  const v = `?v=${Math.random()}`;
  const adapter = await import(`./adapter.ts${v}`);
  return { adapter };
}

function emailMode(status = 200) {
  process.env.CONTACT_INTAKE_MODE = "email";
  process.env.CONTACT_INTAKE_EMAIL = "inbox@example.test";
  process.env.CONTACT_EMAIL_FROM = "Zenward Website <noreply@example.test>";
  process.env.CONTACT_EMAIL_API_KEY = "re_test_key";
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), headers: init.headers });
    return new Response("{}", { status });
  };
}

test("email text contains only source, fixed description and the number", async () => {
  const { adapter } = await load();
  const text = adapter.buildAssistantCallbackText({ phone: "4045550123" });
  assert.match(text, /Source:\s+Zenny Transportation Assistant/);
  assert.match(text, /Phone:\s+\(404\) 555-0123/);
  assert.match(text, /Visitor provided a callback number through the Zenny Transportation Assistant\./);
  assert.match(text, /No chat messages, trip details or other information were included\./);
  assert.doesNotMatch(text, /service|pickup|destination|http|url|transcript:|question:|email:|name:/i);
});

test("email mode: delivered only on a 2xx, body carries the phone only, credentials stay server-side", async () => {
  emailMode(200);
  const { adapter } = await load();
  assert.deepEqual(await adapter.getContactIntakeAdapter().submitCallback({ phone: "4045550123" }), { delivered: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.deepEqual(Object.keys(calls[0].body).sort(), ["from", "subject", "text", "to"]);
  assert.equal(calls[0].body.subject, "Follow-up number — Zenny Transportation Assistant");
  assert.match(calls[0].body.text, /\(404\) 555-0123/);

  emailMode(500);
  const again = await load();
  assert.deepEqual(await again.adapter.getContactIntakeAdapter().submitCallback({ phone: "4045550123" }), { delivered: false });
});

test("stub mode (repo default) never claims delivery and sends nothing", async () => {
  process.env.CONTACT_INTAKE_MODE = "stub";
  globalThis.fetch = async () => { calls.push("fetch"); return new Response("{}"); };
  const { adapter } = await load();
  assert.deepEqual(await adapter.getContactIntakeAdapter().submitCallback({ phone: "4045550123" }), { delivered: false });
  assert.equal(calls.length, 0);
});

test("Server Action accepts exactly { phone }, re-validates it, and fails closed", async () => {
  emailMode(200);
  const action = await import(`../../app/assistant/actions.ts?v=${Math.random()}`);
  const ok = { startedAt: Date.now() - 5000 };
  // Rejected without any delivery attempt:
  for (const bad of [
    { phone: "404-555-0123", message: "my mum needs dialysis" },
    { phone: "404-555-0123", serviceType: "dialysis" },
    { phone: "404-555-0123", url: "/request-transportation?service=dialysis" },
    { phone: "12" },
    { phone: "call me" },
    {},
    null,
    "4045550123",
  ]) {
    assert.deepEqual(await action.submitAssistantCallback(bad, ok), { delivered: false }, JSON.stringify(bad));
  }
  // Too-fast submission (bot-like) is refused by the existing guard.
  assert.deepEqual(await action.submitAssistantCallback({ phone: "404-555-0123" }, { startedAt: Date.now() }), { delivered: false });
  assert.equal(calls.length, 0, "nothing sent for rejected input");
});
