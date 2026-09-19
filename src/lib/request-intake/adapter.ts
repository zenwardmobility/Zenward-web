// Explicit .ts extensions: `node --test` resolves these directly (no bundler),
// and `allowImportingTsExtensions` in tsconfig.json keeps them valid for tsc/Next.
import { findTenancyKeys } from "./tenancy.ts";
import { buildNemrynIntakeBody, interpretNemrynResponse, type NemrynFailure } from "./nemryn-mapping.ts";
import type { RequestSubmissionMeta, TransportationRequestInput, TransportationRequestResult } from "./types";

/**
 * The request-intake boundary. UI never talks to a database or an external
 * service directly — it calls the Server Action in
 * `src/app/request-transportation/actions.ts`, which calls whichever
 * adapter is configured here. This indirection is the whole point: the
 * delivery destination can change later without touching the form or the
 * page.
 *
 * *** PRODUCTION PATH (CONNECTED, P1-PILOT-S4B-R3) ***
 * Browser -> Server Action -> this adapter -> Nemryn HTTP endpoint. The
 * Nemryn call is server-to-server, so browser CORS is not the security
 * boundary for it (and Nemryn's CORS configuration is not loosened for it).
 * Nemryn's production contract is a flat JSON body, no bearer token, no
 * versioned envelope (see `nemryn-mapping.ts` and
 * docs/architecture/nemryn-trusted-request-intake-contract.md). Set
 * `REQUEST_INTAKE_MODE=platform` and provide `PLATFORM_INTAKE_URL` /
 * `PLATFORM_INTAKE_INTEGRATION_ID` (server-only, never `NEXT_PUBLIC_`). This
 * app never reads or writes a database directly and never gives the browser
 * an organization_id / tenant_id to choose -- Nemryn resolves the Zenward
 * Mobility tenant from the opaque `integrationExternalId` server-side. See
 * docs/architecture/request-intake-boundary.md.
 *
 * `integrationExternalId` is an OPAQUE PER-INTEGRATION IDENTIFIER, not a
 * privileged credential: it identifies which configured Nemryn integration a
 * submission belongs to and carries no standing access to Nemryn's database
 * or API. It stays server-only simply because there is no reason to expose
 * backend configuration to the browser. Nemryn's own service-role key is
 * never sent to, stored by, or reachable from this repository.
 *
 * Detailed transportation-request content (passenger identity, addresses,
 * appointment / assistance notes) must never be delivered by ordinary
 * email, persisted in the browser, logged in full, or sent to analytics.
 */
export interface RequestIntakeAdapter {
  submit(
    input: TransportationRequestInput,
    meta: RequestSubmissionMeta,
  ): Promise<TransportationRequestResult>;
}

/** Server-to-server call budget. The browser is long gone by the time this runs. */
const INTAKE_TIMEOUT_MS = 10_000;

/**
 * Customer-safe copy. Never contains an HTTP status, a provider name, API
 * terminology, or an internal error. Every failure path ends by pointing at
 * the phone number (the form and page also surface a "Call 678-935-5489" CTA).
 */
const MSG_UNAVAILABLE =
  "Online requests are temporarily unavailable right now. Please call us to arrange transportation.";
const MSG_RETRY =
  "We couldn't submit your request just now. Please try again shortly, or call us.";
const MSG_REJECTED =
  "We couldn't submit your request. Please check the form and try again, or call us to arrange transportation.";
const MSG_RATE_LIMITED =
  "We're receiving a lot of requests right now. Please try again in a little while, or call us to arrange transportation.";

const FAILURE_MESSAGE: Record<NemrynFailure, string> = {
  rejected: MSG_REJECTED,
  rate_limited: MSG_RATE_LIMITED,
  unavailable: MSG_UNAVAILABLE,
  unconfirmed: MSG_RETRY,
};

/** Stub-only display value; the platform path shows no reference (Nemryn returns none). */
function newReference(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

/** Operational metadata only — no request content, no envelope, no credential. */
function logOutcome(
  level: "info" | "warn" | "error",
  outcome: string,
  meta: { submissionId: string; status?: number; errorClass?: string; timeout?: boolean },
): void {
  const fields: Record<string, unknown> = { submissionId: meta.submissionId, outcome };
  if (typeof meta.status === "number") fields.status = meta.status;
  if (meta.errorClass) fields.errorClass = meta.errorClass;
  if (meta.timeout) fields.timeout = true;
  console[level]("[request-intake] platform", fields);
}

/**
 * Safe stub adapter. It performs no external calls, stores nothing, logs no
 * request content, and never touches a credential. It exists so the form has
 * something real to submit to before the trusted intake is available — it
 * acknowledges the submission but reports `delivered: false` so the UI can
 * tell the visitor to follow up by phone rather than implying a request is
 * sitting in someone's queue.
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
 * Calls Nemryn's production public intake endpoint
 * (`POST https://app.nemryn.com/api/public-intake/website`) with a flat JSON
 * body built by `buildNemrynIntakeBody`. When `REQUEST_INTAKE_MODE=platform`
 * is selected without the two required env vars, this fails closed with an
 * honest, non-technical message rather than pretending the request was
 * delivered.
 *
 * `delivered: true` is returned ONLY when Nemryn responds `200 {"ok": true}`.
 * Nemryn returns no reference of its own, so none is returned here either:
 * the visitor simply sees "Request received". Every other outcome -- an error
 * status, a malformed or unexpected body, a timeout, an unreachable endpoint
 * -- returns `delivered: false`.
 *
 * The idempotency key is `meta.submissionId`, which the Server Action fixes
 * once per logical submission. This adapter makes exactly one HTTP attempt per
 * `submit()` call and never mints an id of its own, so a visitor retrying the
 * same submission re-sends the same key and a new submission sends a new one.
 */
class PlatformRequestIntakeAdapter implements RequestIntakeAdapter {
  private readonly url = process.env.PLATFORM_INTAKE_URL;
  private readonly integrationExternalId = process.env.PLATFORM_INTAKE_INTEGRATION_ID;

  async submit(
    input: TransportationRequestInput,
    meta: RequestSubmissionMeta,
  ): Promise<TransportationRequestResult> {
    const { submissionId } = meta;

    if (!this.url || !this.integrationExternalId) {
      logOutcome("error", "not_configured", { submissionId });
      return { ok: false, delivered: false, error: MSG_UNAVAILABLE };
    }
    // HTTPS-only.
    if (!this.url.startsWith("https://")) {
      logOutcome("error", "insecure_url", { submissionId });
      return { ok: false, delivered: false, error: MSG_UNAVAILABLE };
    }

    const wireBody = buildNemrynIntakeBody(input, this.integrationExternalId, submissionId);

    // Defence in depth: never transmit a tenancy identifier. The Server
    // Action's whitelist rebuild, and `buildNemrynIntakeBody`'s own fixed
    // output shape, already mean a legitimate body cannot contain one;
    // if one ever somehow appeared, fail closed rather than send it.
    // Logs the outcome only — never the key values or any request
    // content.
    if (findTenancyKeys(wireBody).length > 0) {
      logOutcome("error", "forbidden_field", { submissionId });
      return { ok: false, delivered: false, error: MSG_REJECTED };
    }

    let res: Response;
    try {
      res = await fetch(this.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(wireBody),
        signal: AbortSignal.timeout(INTAKE_TIMEOUT_MS),
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : "unknown";
      const timeout = name === "TimeoutError" || name === "AbortError";
      logOutcome("error", timeout ? "timeout" : "unreachable", { submissionId, errorClass: name, timeout });
      return { ok: false, delivered: false, error: MSG_UNAVAILABLE };
    }

    const body = await res.json().catch(() => undefined);
    const outcome = interpretNemrynResponse(res.status, body);

    if (outcome.delivered) {
      logOutcome("info", "accepted", { submissionId, status: res.status });
      return { ok: true, delivered: true };
    }

    logOutcome("error", outcome.failure, { submissionId, status: res.status });
    return { ok: false, delivered: false, error: FAILURE_MESSAGE[outcome.failure] };
  }
}

let cachedAdapter: RequestIntakeAdapter | undefined;

/**
 * Builds a fresh adapter from the current environment (`REQUEST_INTAKE_MODE`,
 * `PLATFORM_INTAKE_URL`, `PLATFORM_INTAKE_INTEGRATION_ID`). Defaults to the
 * stub — see REQUEST_INTAKE_MODE in .env.example. Exposed uncached so
 * contract tests can exercise each configuration; the app itself uses
 * `getRequestIntakeAdapter`.
 */
export function createRequestIntakeAdapter(): RequestIntakeAdapter {
  const mode = (process.env.REQUEST_INTAKE_MODE ?? "stub").toLowerCase();
  switch (mode) {
    case "platform":
      return new PlatformRequestIntakeAdapter();
    case "stub":
    default:
      return new StubRequestIntakeAdapter();
  }
}

/** The configured adapter, created once per server instance. */
export function getRequestIntakeAdapter(): RequestIntakeAdapter {
  cachedAdapter ??= createRequestIntakeAdapter();
  return cachedAdapter;
}
