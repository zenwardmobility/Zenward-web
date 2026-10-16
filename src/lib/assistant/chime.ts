/**
 * Zenny's arrival chime (ZW-WEB-04H2): a soft two-note sine chime made with
 * the native Web Audio API. No audio file, no library, no network.
 *
 *   notes   E5 (659 Hz) then A5 (880 Hz), gentle attack and decay
 *   length  ~0.55 s total
 *   volume  peak gain 0.2 (~20%)
 *
 * AUTOPLAY: browsers block sound until the visitor has interacted with the
 * page, and merely creating an AudioContext before that makes some browsers
 * log a warning. So the chime only TRIES when the browser reports prior user
 * activation (navigator.userActivation.hasBeenActive). Otherwise it silently
 * does nothing. Where that API is missing, it tries once and quietly gives up
 * if the context isn't allowed to run. It never throws, never logs, never
 * retries, never bypasses autoplay rules, and nothing depends on it: the
 * visual teaser is the introduction and the chime is supplemental only.
 *
 * Returns whether the chime was scheduled (for tests).
 */

type AudioCtor = new () => AudioContext;

export interface ChimeEnv {
  AudioContext?: AudioCtor;
  /** `navigator.userActivation.hasBeenActive`, or undefined when the API doesn't exist. */
  hasBeenActive?: boolean;
}

export const CHIME = {
  notes: [
    { frequency: 659.25, start: 0, duration: 0.32 },
    { frequency: 880, start: 0.16, duration: 0.39 },
  ],
  peakGain: 0.2,
  totalSeconds: 0.55,
} as const;

/** The browser's environment, read defensively. */
export function browserChimeEnv(): ChimeEnv {
  if (typeof window === "undefined") return {};
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return { AudioContext: w.AudioContext ?? w.webkitAudioContext, hasBeenActive: activation?.hasBeenActive };
}

export async function playArrivalChime(env: ChimeEnv = browserChimeEnv()): Promise<boolean> {
  try {
    if (!env.AudioContext) return false;
    // Known: no interaction yet -> autoplay would be blocked. Do nothing (no context, no warning).
    if (env.hasBeenActive === false) return false;
    const ctx = new env.AudioContext();
    if (ctx.state !== "running") {
      await ctx.resume().catch(() => undefined);
      // `state` may have changed during resume(); re-read it as a plain string.
      if ((ctx.state as string) !== "running") {
        void ctx.close().catch(() => undefined);
        return false;
      }
    }
    const t0 = ctx.currentTime + 0.02;
    for (const note of CHIME.notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(note.frequency, t0 + note.start);
      gain.gain.setValueAtTime(0.0001, t0 + note.start);
      gain.gain.exponentialRampToValueAtTime(CHIME.peakGain, t0 + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.start + note.duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + note.start);
      osc.stop(t0 + note.start + note.duration + 0.02);
    }
    // Release the audio context shortly after the chime ends.
    setTimeout(() => void ctx.close().catch(() => undefined), (CHIME.totalSeconds + 0.2) * 1000);
    return true;
  } catch {
    return false;
  }
}
