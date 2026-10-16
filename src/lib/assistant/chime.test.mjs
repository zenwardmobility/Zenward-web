// ZW-WEB-04H2: Zenny arrival chime (Web Audio, supplemental, autoplay-safe).
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

const { playArrivalChime, CHIME } = await import("./chime.ts");

/** A minimal fake AudioContext that records what the chime schedules. */
function fakeAudio({ initial = "running", resumeTo = "running", resumeRejects = false, ctorThrows = false } = {}) {
  const log = { created: 0, oscillators: [], gains: [], closed: 0, resumed: 0 };
  class FakeCtx {
    constructor() {
      if (ctorThrows) throw new Error("NotAllowedError");
      log.created++;
      this.state = initial;
      this.currentTime = 0;
      this.destination = {};
    }
    resume() {
      log.resumed++;
      if (resumeRejects) return Promise.reject(new Error("NotAllowedError"));
      this.state = resumeTo;
      return Promise.resolve();
    }
    close() { log.closed++; return Promise.resolve(); }
    createOscillator() {
      const o = { type: "", frequency: { setValueAtTime: (f) => o.freq = f }, connect: (g) => g, start: (t) => (o.startAt = t), stop: (t) => (o.stopAt = t) };
      log.oscillators.push(o);
      return o;
    }
    createGain() {
      const g = { values: [], gain: { setValueAtTime: (v) => g.values.push(v), exponentialRampToValueAtTime: (v) => g.values.push(v) }, connect: (d) => d };
      log.gains.push(g);
      return g;
    }
  }
  return { AudioContext: FakeCtx, log };
}

test("chime plays a short, soft two-note tone when audio is allowed", async () => {
  const { AudioContext, log } = fakeAudio();
  assert.equal(await playArrivalChime({ AudioContext, hasBeenActive: true }), true);
  assert.equal(log.oscillators.length, 2);
  assert.deepEqual(log.oscillators.map((o) => Math.round(o.freq)), [659, 880]);
  assert.ok(log.oscillators.every((o) => o.type === "sine"));
  const peak = Math.max(...log.gains.flatMap((g) => g.values));
  assert.ok(peak >= 0.15 && peak <= 0.25, `peak ${peak}`);
  const end = Math.max(...log.oscillators.map((o) => o.stopAt));
  assert.ok(end >= 0.2 && end <= 0.8, `duration ${end}`);
  assert.ok(CHIME.totalSeconds >= 0.2 && CHIME.totalSeconds <= 0.8);
});

test("no prior interaction: nothing is created, nothing is logged, no error", async () => {
  const { AudioContext, log } = fakeAudio();
  assert.equal(await playArrivalChime({ AudioContext, hasBeenActive: false }), false);
  assert.equal(log.created, 0, "no AudioContext before user activation (avoids autoplay warnings)");
});

test("autoplay rejection or failure fails silently (no throw)", async () => {
  const rejected = fakeAudio({ initial: "suspended", resumeRejects: true });
  assert.equal(await playArrivalChime({ AudioContext: rejected.AudioContext }), false);
  assert.equal(rejected.log.oscillators.length, 0);
  assert.equal(rejected.log.closed, 1, "suspended context released");
  const stays = fakeAudio({ initial: "suspended", resumeTo: "suspended" });
  assert.equal(await playArrivalChime({ AudioContext: stays.AudioContext }), false);
  const throws = fakeAudio({ ctorThrows: true });
  assert.equal(await playArrivalChime({ AudioContext: throws.AudioContext, hasBeenActive: true }), false);
  assert.equal(await playArrivalChime({}), false, "no Web Audio support");
  const originalError = console.error;
  const originalWarn = console.warn;
  const logged = [];
  console.error = console.warn = (...a) => logged.push(a);
  try {
    await playArrivalChime({ AudioContext: rejected.AudioContext });
    await playArrivalChime({ AudioContext: throws.AudioContext });
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }
  assert.deepEqual(logged, []);
});

test("chime is wired once to the teaser's first appearance; never on reopen or replies", () => {
  const launcher = read("components/public/assistant/AssistantLauncher.tsx");
  assert.match(launcher, /const chimed = useRef\(false\)/);
  assert.match(launcher, /if \(!showTeaser \|\| chimed\.current\) return;\s*chimed\.current = true;\s*void playArrivalChime\(\);/);
  assert.equal((launcher.match(/playArrivalChime\(/g) ?? []).length, 1);
  assert.doesNotMatch(read("components/public/assistant/AssistantPanel.tsx"), /chime|Audio/i, "no sound in the panel or on replies");
  assert.doesNotMatch(read("lib/assistant/responses.ts"), /chime|Audio/i);
  // The teaser and assistant never wait on or depend on the sound.
  assert.doesNotMatch(launcher, /await playArrivalChime|playArrivalChime\(\)\.then/);
});

test("no audio file, external URL, network call, voice or storage", () => {
  const code = strip(read("lib/assistant/chime.ts"));
  assert.doesNotMatch(code, /new Audio\(|fetch\(|https?:\/\/|XMLHttpRequest|sendBeacon|speechSynthesis|SpeechSynthesis|localStorage|sessionStorage|track\(/);
  assert.doesNotMatch(code, /\.mp3|\.wav|\.ogg/);
});
