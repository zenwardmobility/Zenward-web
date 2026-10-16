// ZW-WEB-04H2 (owner revision): Zenny identity, teaser, time-of-day greeting,
// phone-only follow-up gate, inline emergency/operator lines.
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
const strip = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

const Z = await import("./zenny.ts");
const LAUNCHER = read("components/public/assistant/AssistantLauncher.tsx");
const PANEL = read("components/public/assistant/AssistantPanel.tsx");

test("exact owner copy", () => {
  assert.equal(Z.ZENNY.teaser, "Hi, I\u2019m Zenny, here to assist you.");
  assert.equal(Z.ZENNY.heading, "Zenny");
  assert.equal(Z.ZENNY.subtitle, "Zenward Transportation Assistant");
  assert.equal(Z.ZENNY.phonePrompt, "If you\u2019d like Zenward to follow up, you can leave a phone number below.");
  assert.equal(Z.ZENNY.phoneLabel, "Phone number (optional)");
  assert.equal(Z.ZENNY.phonePlaceholder, "(404) 555-0123");
  assert.equal(Z.ZENNY.consent, "If provided, we\u2019ll only use your number to follow up about this enquiry.");
  assert.equal(Z.ZENNY.ready, "How can I assist you today?");
  assert.equal(Z.ZENNY.notDelivered, "I couldn\u2019t save your number for follow-up, but you can still use Zenny below.");
  assert.equal(`${Z.ZENNY.emergencyPrefix} ${Z.ZENNY.emergencyLink}`, "If this is a medical emergency, Call 911");
  assert.equal(`${Z.ZENNY.operatorPrefix} ${Z.ZENNY.operatorLink}`, "To speak with an operator, Call Zenward 678-935-5489");
  // The old repetitive pieces are gone.
  for (const key of ["skipLabel", "skipped", "emptyHint", "delivered"]) assert.equal(Z.ZENNY[key], undefined, key);
  for (const text of Object.values(Z.ZENNY)) {
    assert.doesNotMatch(String(text), /SMS|text message|marketing|newsletter|will call you|callback is scheduled|definitely|operator will|\blive\b|online now|24\/7|required|must provide/i, String(text));
  }
});

test("greeting changes by the visitor's local time bucket (exact wording)", () => {
  const at = (h, m = 0) => new Date(2026, 9, 16, h, m);
  const cases = [[5, 0, "morning"], [11, 59, "morning"], [12, 0, "afternoon"], [16, 59, "afternoon"], [17, 0, "evening"], [23, 30, "evening"], [0, 0, "evening"], [4, 59, "evening"]];
  for (const [h, m, part] of cases) {
    assert.equal(Z.dayPart(at(h, m).getHours()), part, `${h}:${m}`);
    assert.equal(Z.timeGreeting(at(h, m)), `Good ${part}. I\u2019m Zenny, here to help with your transportation enquiry.`);
  }
});

test("a provided phone number must be a valid US number", () => {
  for (const input of ["404-555-0123", "(404) 555-0123", "404 555 0123", "404.555.0123", "+1 404 555 0123", "14045550123", "4045550123"]) {
    assert.deepEqual(Z.validatePhone(input), { ok: true, value: "4045550123" }, input);
  }
  for (const input of ["", "555-0123", "404-555-01234", "call me", "404-555-0123 ext 2", "+44 20 7946 0958", "0045550123"]) {
    const r = Z.validatePhone(input);
    assert.equal(r.ok, false, input);
    assert.match(r.error, /phone number/);
  }
  assert.equal(Z.formatUsPhone("4045550123"), "(404) 555-0123");
});

test("teaser: once per session near the launcher, dismissible, hidden on open and on form pages", () => {
  assert.match(LAUNCHER, /\{ZENNY\.teaser\}/);
  assert.match(LAUNCHER, /aria-label="Dismiss Zenny's greeting"/);
  assert.match(LAUNCHER, /const showTeaser = !open && !compact && !teaserDismissed/);
  assert.match(LAUNCHER, /setTeaserDismissed\(true\);\s*setOpen\(true\)/, "opening hides the teaser");
  assert.match(LAUNCHER, /const FORM_PAGES = new Set\(\["\/request-transportation", "\/contact"\]\)/, "04I route rules kept");
  assert.match(LAUNCHER, /compact \? "hidden size-12 lg:inline-flex"/, "launcher still hidden below lg on form pages");
  assert.match(LAUNCHER, /<Image src=\{ZENNY\.avatarSrc\}/);
  assert.match(LAUNCHER, /aria-label=\{ZENNY\.launcherLabel\}/);
  assert.doesNotMatch(strip(LAUNCHER), /unread|badge|counter|animate-(ping|bounce|pulse)/i);
});

test("panel: ONE opening bubble, optional field, single Continue, inline 911 + operator line", () => {
  assert.match(PANEL, /\{ZENNY\.heading\}/);
  assert.match(PANEL, /\{ZENNY\.subtitle\}/);
  assert.match(PANEL, /return \[\{ id: 0, from: "assistant", reply: say\(\[timeGreeting\(\), ZENNY\.phonePrompt\]\) \}\];/, "greeting + offer in one bubble, no quick actions");
  assert.match(PANEL, /if \(gateDone\) return \[\{ id: 0, from: "assistant", reply: say\(\[ZENNY\.welcomeBack\], START_ACTIONS\) \}\]/);
  assert.doesNotMatch(strip(PANEL), /first-?name|given-name|type="email"|autoComplete="(email|street-address)"/i);
  assert.match(PANEL, /htmlFor="zenny-phone"/);
  assert.match(PANEL, /\{ZENNY\.phoneLabel\}/);
  assert.match(PANEL, /id="zenny-consent"/);
  // No separate skip control: Continue is the only gate button.
  assert.doesNotMatch(PANEL, /Skip for now|onSkip|skipLabel/);
  const gateStart = PANEL.indexOf("{!gateDone ? (");
  const gate = PANEL.slice(gateStart, PANEL.indexOf(") : (", gateStart));
  assert.equal((gate.match(/<button/g) ?? []).length, 1);
  assert.ok(PANEL.indexOf("{!gateDone ? (") < PANEL.indexOf('id="assistant-input"'));
  assert.match(PANEL, /\{ZENNY\.emergencyPrefix\}\{" "\}\s*<a href="tel:911" className="font-bold text-critical-text/);
  assert.match(PANEL, /\{ZENNY\.operatorPrefix\}\{" "\}\s*<a href=\{PHONE\.href\} className="font-semibold text-text-accent-on-tint/);
  assert.doesNotMatch(PANEL, /from: "visitor", text: (phone|tel)/);
  assert.doesNotMatch(strip(PANEL), /setInterval|retry/i);
});

test("only the phone number leaves the browser, once, via the Server Action", () => {
  assert.equal((PANEL.match(/submitAssistantCallback\(/g) ?? []).length, 1);
  assert.match(PANEL, /submitAssistantCallback\(\{ phone: tel\.value \}, \{ startedAt: openedAt\.current \|\| undefined \}\)/);
  assert.match(PANEL, /import \{ submitAssistantCallback \} from "@\/app\/assistant\/actions"/);
  // The conversation never goes to a server: respond() is local and there is no other network path.
  assert.doesNotMatch(strip(PANEL), /fetch\(|XMLHttpRequest|sendBeacon|WebSocket/);
  const action = read("app/assistant/actions.ts");
  assert.match(action, /^"use server";/);
  assert.match(action, /keys\.length !== 1 \|\| keys\[0\] !== "phone"/);
  assert.match(action, /getContactIntakeAdapter\(\)\.submitCallback\(\{ phone: phone\.value \}\)/);
  assert.doesNotMatch(strip(action), /console\.[a-z]+\([^)]*phone/, "the number is never logged");
  assert.doesNotMatch(strip(action), /nemryn|request-intake|track\(/i, "no Nemryn, intake or analytics");
});

test("client keeps only a gate-done flag in memory: no storage, cookies, URL, analytics or engine access", () => {
  assert.match(LAUNCHER, /const \[gateDone, setGateDone\] = useState\(false\)/);
  assert.doesNotMatch(strip(LAUNCHER), /phone|VisitorIdentity/i, "the launcher never holds the number");
  for (const code of [LAUNCHER, PANEL, read("lib/assistant/zenny.ts"), read("app/assistant/actions.ts")].map(strip)) {
    assert.doesNotMatch(code, /localStorage|sessionStorage|indexedDB|document\.cookie|history\.(push|replace)State|router\.(push|replace)/);
  }
  const tracks = [...LAUNCHER.matchAll(/track\(\{[^}]*\}\)/g), ...PANEL.matchAll(/track\(\{[^}]*\}\)/g)].map((m) => m[0]);
  assert.deepEqual([...new Set(tracks)].sort(), ['track({ name: "transportation_assistant_opened" })', 'track({ name: "transportation_assistant_quote_clicked" })']);
  assert.doesNotMatch(PANEL, /respond\([^)]*phone/);
  assert.doesNotMatch(read("lib/assistant/responses.ts"), /phone\.value|gateDone/);
});

test("Privacy discloses the follow-up number factually (chat not sent); legal notices kept", () => {
  const privacy = read("app/privacy/page.tsx");
  assert.match(privacy, /<strong>Transportation Assistant follow-up number\.<\/strong> If you choose to give a phone number to\s+Zenny, the Transportation Assistant on this site, Zenward receives that number so our team can follow\s+up about your transportation enquiry\. Your chat messages are not sent with it\./);
  assert.match(privacy, /for contact enquiries and Transportation Assistant follow-up numbers — an email/);
  assert.match(privacy, /pre-launch draft pending final legal review/);
  assert.doesNotMatch(privacy, /SMS|text messages|marketing purposes/i);
});

test("capability limits are stated in context: status, change, cancel, reschedule -> can't + Call Zenward", async () => {
  const R = await import("./responses.ts");
  const { SERVICE_ORDER } = await import("../service-catalog.ts");
  const ctx = { marketName: "Metro Atlanta", summaries: Object.fromEntries(SERVICE_ORDER.map((s) => [s, "x"])) };
  const cases = [
    ["Where is my request?", /can't view request status/],
    ["Was my request accepted?", /can't view request status/],
    ["I need to change my booking", /can't change or cancel a trip here/],
    ["Can I cancel my ride?", /can't change or cancel a trip here/],
    ["I want to reschedule my trip", /can't change or cancel a trip here/],
  ];
  for (const [text, re] of cases) {
    const r = R.respond({ kind: "text", text }, ctx);
    assert.match(r.paragraphs.join(" "), re, text);
    const tel = r.actions.find((a) => a.kind === "tel");
    assert.equal(tel?.label, "Call Zenward 678-935-5489", text);
    assert.equal(tel?.href, "tel:+16789355489", text);
  }
  // The header no longer carries the phone instruction; the operator line stays at the bottom of the gate.
  assert.doesNotMatch(PANEL, /PANEL_NOTE/);
  assert.match(PANEL, /\{ZENNY\.operatorPrefix\}/);
});

test("header title is exactly \"Zenny\" with the role subtitle", () => {
  assert.equal(Z.ZENNY.heading, "Zenny");
  assert.equal(Z.ZENNY.subtitle, "Zenward Transportation Assistant");
  assert.match(PANEL, /<h2 id="assistant-title"[^>]*>\s*\{ZENNY\.heading\}\s*<\/h2>/);
  assert.match(PANEL, /\{ZENNY\.subtitle\}/);
});

test("phone is optional: empty Continue skips (no server call); filled Continue uses the approved handoff; both continue", () => {
  const submit = PANEL.slice(PANEL.indexOf("async function onGateSubmit"), PANEL.indexOf("function onQuickReply"));
  const finish = PANEL.slice(PANEL.indexOf("function finishGate"), PANEL.indexOf("async function onGateSubmit"));
  // Empty field: straight to the assistant, before any server call.
  const emptyBranch = submit.slice(submit.indexOf("if (!phone.trim())"), submit.indexOf("const tel = validatePhone"));
  assert.match(emptyBranch, /finishGate\(\[ZENNY\.ready\], START_ACTIONS\);\s*return;/);
  assert.doesNotMatch(emptyBranch, /submitAssistantCallback/);
  assert.ok(submit.indexOf("if (!phone.trim())") < submit.indexOf("submitAssistantCallback"));
  // Valid number: the single approved server-side handoff, then the assistant either way.
  assert.equal((PANEL.match(/submitAssistantCallback\(/g) ?? []).length, 1);
  assert.match(submit, /submitAssistantCallback\(\{ phone: tel\.value \}/);
  assert.match(submit, /if \(delivered\) finishGate\(\[ZENNY\.ready\], START_ACTIONS\);\s*else finishGate\(\[ZENNY\.notDelivered, ZENNY\.ready\], \[\{ kind: "tel", label: ZENNY\.operatorLink, href: PHONE\.href \}, \.\.\.START_ACTIONS\]\);/);
  // Every path marks the session done (no re-prompt), clears the number and reveals the assistant.
  assert.match(finish, /setPhone\(""\);[\s\S]*onGateDone\(\);[\s\S]*inputRef\.current\?\.focus\(\)/);
});
