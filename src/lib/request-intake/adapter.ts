import type { TransportationRequestInput, TransportationRequestResult } from "./types";

/**
 * The request-intake boundary. UI never talks to a database or an external
 * service directly — it calls the Server Action in
 * `src/app/request-transportation/actions.ts`, which calls whichever
 * adapter is configured here. This indirection is the whole point: the
 * delivery destination can change later without touching the form or the
 * page.
 *
 * *** REPLACEMENT POINT ***
 * When the Zenward Platform's trusted TransportationRequest intake exists
 * (see the platform repo's docs/product/domain-model.md §L / §13 — a
 * controlled server-side path that assigns organization_id itself), point
 * `REQUEST_INTAKE_MODE=platform` at it and set `PLATFORM_INTAKE_URL` /
 * `PLATFORM_INTAKE_TOKEN` (server-only, never `NEXT_PUBLIC_`). This app
 * still never reads or writes the platform's database directly, and never
 * gives the browser an organization_id to choose — see
 * docs/architecture/request-intake-boundary.md.
 *
 * Detailed transportation-request content (passenger identity, addresses,
 * appointment / assistance notes) must never be delivered by ordinary
 * email, persisted in the browser, logged in full, or sent to analytics.
 */
export interface RequestIntakeAdapter {
  submit(input: TransportationRequestInput): Promise<TransportationRequestResult>;
}

function newReference(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Safe stub adapter. It performs no external calls, stores nothing, logs no
 * request content, and never touches a credential. It exists so the form has
 * something real to submit to before the trusted Platform intake is
 * available — it acknowledges the submission but reports `delivered: false`
 * so the UI can tell the visitor to follow up by phone rather than implying
 * a request is sitting in someone's queue.
 */
class StubRequestIntakeAdapter implements RequestIntakeAdapter {
  async submit(): Promise<TransportationRequestResult> {
    const referenceId = newReference("ZW-STUB");
    if (process.env.NODE_ENV === "production") {
      // No payload — just a signal for operators watching logs that the
      // trusted intake is not yet wired. See docs/product/launch-readiness.md.
      console.warn(
        "[request-intake] running in STUB mode: a transportation request was acknowledged but NOT delivered anywhere.",
      );
    } else {
      console.info(`[request-intake:stub] acknowledged ${referenceId} — nothing persisted or delivered.`);
    }
    return { ok: true, referenceId, delivered: false };
  }
}

/**
 * Calls the Zenward Platform's trusted intake endpoint with a signed
 * server-to-server request. The endpoint and token do not exist yet; when
 * `REQUEST_INTAKE_MODE=platform` is selected without them configured, this
 * fails closed with an honest, non-technical message rather than pretending
 * the request was delivered.
 */
class PlatformRequestIntakeAdapter implements RequestIntakeAdapter {
  private readonly url = process.env.PLATFORM_INTAKE_URL;
  private readonly token = process.env.PLATFORM_INTAKE_TOKEN;

  async submit(input: TransportationRequestInput): Promise<TransportationRequestResult> {
    if (!this.url || !this.token) {
      console.error("[request-intake] mode=platform but PLATFORM_INTAKE_URL / PLATFORM_INTAKE_TOKEN are not set.");
      return {
        ok: false,
        delivered: false,
        error: "Online requests are temporarily unavailable. Please call us to arrange transportation.",
      };
    }

    try {
      const res = await fetch(this.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(input),
        // The browser is long gone by now; keep this snappy.
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        console.error(`[request-intake] platform intake responded ${res.status}.`);
        return {
          ok: false,
          delivered: false,
          error: "We couldn't submit your request just now. Please try again shortly, or call us.",
        };
      }

      const data = (await res.json().catch(() => ({}))) as { referenceId?: string };
      return { ok: true, delivered: true, referenceId: data.referenceId ?? newReference("ZW") };
    } catch (err) {
      console.error("[request-intake] platform intake call failed.", err instanceof Error ? err.name : "unknown");
      return {
        ok: false,
        delivered: false,
        error: "We couldn't submit your request just now. Please try again shortly, or call us.",
      };
    }
  }
}

let cachedAdapter: RequestIntakeAdapter | undefined;

/** Selects the configured adapter. Defaults to the stub — see REQUEST_INTAKE_MODE in .env.example. */
export function getRequestIntakeAdapter(): RequestIntakeAdapter {
  if (cachedAdapter) return cachedAdapter;

  const mode = (process.env.REQUEST_INTAKE_MODE ?? "stub").toLowerCase();
  switch (mode) {
    case "platform":
      cachedAdapter = new PlatformRequestIntakeAdapter();
      break;
    case "stub":
    default:
      cachedAdapter = new StubRequestIntakeAdapter();
      break;
  }
  return cachedAdapter;
}
