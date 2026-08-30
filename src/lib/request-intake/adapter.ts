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
 * controlled server-side path that assigns organization_id itself), add a
 * new adapter here that calls it — e.g. a signed server-to-server POST to a
 * platform API route, authenticated with a secret held only in this app's
 * server environment (never sent to the browser, never a
 * NEXT_PUBLIC_-prefixed variable). Do not have this app read or write the
 * platform's Supabase project directly, and never give the browser an
 * organization_id to choose (see docs/architecture/request-intake-boundary.md).
 */
export interface RequestIntakeAdapter {
  submit(input: TransportationRequestInput): Promise<TransportationRequestResult>;
}

/**
 * Safe stub adapter for this initialization phase. It performs no external
 * calls, stores nothing, and never exposes any credential. It exists so the
 * form has something real to submit to before a delivery destination is
 * approved — replace it by implementing RequestIntakeAdapter and switching
 * REQUEST_INTAKE_MODE, not by editing the page or the Server Action.
 */
class StubRequestIntakeAdapter implements RequestIntakeAdapter {
  async submit(): Promise<TransportationRequestResult> {
    const referenceId = `ZW-STUB-${Date.now().toString(36).toUpperCase()}`;
    if (process.env.NODE_ENV !== "production") {
      console.info(`[request-intake:stub] received a request — reference ${referenceId}. No data was persisted.`);
    }
    return { ok: true, referenceId };
  }
}

let cachedAdapter: RequestIntakeAdapter | undefined;

/** Selects the configured adapter. Defaults to the stub — see REQUEST_INTAKE_MODE in .env.example. */
export function getRequestIntakeAdapter(): RequestIntakeAdapter {
  if (cachedAdapter) return cachedAdapter;

  const mode = process.env.REQUEST_INTAKE_MODE ?? "stub";
  switch (mode) {
    case "stub":
    default:
      cachedAdapter = new StubRequestIntakeAdapter();
      return cachedAdapter;
    // case "platform": cachedAdapter = new PlatformRequestIntakeAdapter(); return cachedAdapter;
  }
}
