import type {
  RequestSubmissionMeta,
  TransportationRequestInput,
  TransportationRequestResult,
  TrustedIntakeEnvelope,
} from "./types";

/**
 * The request-intake boundary. UI never talks to a database or an external
 * service directly — it calls the Server Action in
 * `src/app/request-transportation/actions.ts`, which calls whichever
 * adapter is configured here. This indirection is the whole point: the
 * delivery destination can change later without touching the form or the
 * page.
 *
 * *** REPLACEMENT POINT ***
 * When the trusted Nemryn transportation-request intake exists (full spec:
 * docs/architecture/nemryn-trusted-request-intake-contract.md), set
 * `REQUEST_INTAKE_MODE=platform` and provide `PLATFORM_INTAKE_URL` /
 * `PLATFORM_INTAKE_TOKEN` (server-only, never `NEXT_PUBLIC_`). This app still
 * never reads or writes any database directly, and never gives the browser
 * an organization_id / tenant_id to choose — the endpoint resolves the
 * Zenward Mobility tenant from its own server-side credentials. See
 * docs/architecture/request-intake-boundary.md.
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

/** Envelope schema this adapter speaks. Bump only on a breaking envelope change. */
const SCHEMA_VERSION = "1.0" as const;

/** Server-to-server call budget. The browser is long gone by the time this runs. */
const INTAKE_TIMEOUT_MS = 10_000;

/**
 * Customer-safe copy. Never contains an HTTP status, a provider name, API
 * terminology, or an internal error. Every failure path ends by pointing at
 * the phone number (the form and page also surface a "Call 470-206-8005" CTA).
 */
const MSG_UNAVAILABLE =
  "Online requests are temporarily unavailable right now. Please call us to arrange transportation.";
const MSG_RETRY =
  "We couldn't submit your request just now. Please try again shortly, or call us.";

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
 * Calls the trusted Nemryn intake endpoint with a signed server-to-server
 * request carrying an explicit versioned envelope
 * (docs/architecture/nemryn-trusted-request-intake-contract.md). The endpoint
 * and token do not exist yet; when `REQUEST_INTAKE_MODE=platform` is selected
 * without them configured, this fails closed with an honest, non-technical
 * message rather than pretending the request was delivered.
 *
 * `delivered: true` is returned ONLY when the endpoint positively accepts the
 * request (2xx with `{ accepted: true, referenceId }`, or an idempotent 409
 * that echoes the original `referenceId`). Every other outcome — any error
 * status, a malformed success body, a timeout, or an unreachable endpoint —
 * returns `delivered: false`.
 */
class PlatformRequestIntakeAdapter implements RequestIntakeAdapter {
  private readonly url = process.env.PLATFORM_INTAKE_URL;
  private readonly token = process.env.PLATFORM_INTAKE_TOKEN;

  async submit(
    input: TransportationRequestInput,
    meta: RequestSubmissionMeta,
  ): Promise<TransportationRequestResult> {
    const { submissionId } = meta;

    if (!this.url || !this.token) {
      logOutcome("error", "not_configured", { submissionId });
      return { ok: false, delivered: false, error: MSG_UNAVAILABLE };
    }
    // HTTPS-only (a misconfigured plaintext URL must never carry the token).
    if (!this.url.startsWith("https://")) {
      logOutcome("error", "insecure_url", { submissionId });
      return { ok: false, delivered: false, error: MSG_UNAVAILABLE };
    }

    const envelope: TrustedIntakeEnvelope = {
      schemaVersion: SCHEMA_VERSION,
      submissionId,
      submittedAt: new Date().toISOString(),
      source: "zenward_web",
      request: input,
    };

    let res: Response;
    try {
      res = await fetch(this.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          authorization: `Bearer ${this.token}`,
          "idempotency-key": submissionId,
        },
        body: JSON.stringify(envelope),
        signal: AbortSignal.timeout(INTAKE_TIMEOUT_MS),
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : "unknown";
      const timeout = name === "TimeoutError" || name === "AbortError";
      logOutcome("error", timeout ? "timeout" : "unreachable", { submissionId, errorClass: name, timeout });
      return { ok: false, delivered: false, error: MSG_UNAVAILABLE };
    }

    const body = (await res.json().catch(() => ({}))) as {
      accepted?: boolean;
      referenceId?: string;
    };
    const reference =
      typeof body.referenceId === "string" && body.referenceId.trim() !== ""
        ? body.referenceId.trim()
        : undefined;

    // Positive acceptance.
    if ((res.status === 200 || res.status === 201) && body.accepted === true && reference) {
      logOutcome("info", "accepted", { submissionId, status: res.status });
      return { ok: true, delivered: true, referenceId: reference };
    }

    // Idempotent replay the endpoint chose to signal with 409 — only trusted
    // if it echoes the original public reference.
    if (res.status === 409 && reference) {
      logOutcome("info", "duplicate", { submissionId, status: 409 });
      return { ok: true, delivered: true, referenceId: reference };
    }

    // 2xx but the body did not confirm acceptance — do NOT assume success.
    if (res.ok) {
      logOutcome("error", "malformed_success", { submissionId, status: res.status });
      return { ok: false, delivered: false, error: MSG_RETRY };
    }

    // Explicit error statuses.
    if (res.status === 429 || res.status >= 500) {
      logOutcome("error", res.status === 429 ? "rate_limited" : "server_error", {
        submissionId,
        status: res.status,
      });
      return { ok: false, delivered: false, error: MSG_UNAVAILABLE };
    }

    // 400 / 401 / 403 / 409-without-reference / 4xx — recoverable from the
    // visitor's side (retry or call); never surface which one.
    logOutcome("error", "rejected", { submissionId, status: res.status });
    return { ok: false, delivered: false, error: MSG_RETRY };
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
