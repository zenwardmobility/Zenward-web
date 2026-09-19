/**
 * Pure mapping between Zenward-Web's own `TransportationRequestInput`
 * shape and Nemryn's production public intake contract (frozen at Nemryn
 * release c275ec5) -- `POST https://app.nemryn.com/api/public-intake/website`,
 * a flat JSON body, no bearer token, no versioned envelope, and a bare
 * `{"ok": true}` success response with no reference of any kind.
 *
 * Every Zenward form field that Nemryn models -- including `passengerName`,
 * `serviceType` and `recurringSchedule` -- is sent as its own structured
 * field. Nothing is folded into `additionalNotes`, which stays exactly what
 * the requester typed.
 *
 * Deliberately pure (no fetch, no env vars, no runtime imports) so it is
 * directly unit-testable with `node --test`. `adapter.ts` is the thin I/O
 * wrapper: it does the actual `fetch()` call and nothing else beyond what
 * these two functions decide.
 */
import type { RecurringSchedule, TransportationRequestInput } from "./types";

/**
 * The exact flat JSON body Nemryn's public intake route accepts. Nemryn's
 * route rejects any key outside this set, and there is deliberately no
 * organization / tenant / passenger / driver / vehicle / trip / state /
 * source field: Nemryn resolves the organization from
 * `integrationExternalId` server-side, and a public submission stops at a
 * pending Request.
 */
export interface NemrynIntakeRequestBody {
  integrationExternalId: string;
  idempotencyKey: string;
  requesterName: string;
  requesterRelationship: string;
  requesterPhone: string;
  requesterEmail?: string;
  /** Free-text snapshot of who the ride is for. Nemryn never matches it to a Passenger record. */
  passengerName: string;
  pickupDescription: string;
  destinationDescription: string;
  preferredDate?: string;
  preferredTime?: string;
  returnTripNeeded: string;
  assistanceNotes?: string;
  additionalNotes?: string;
  serviceType: string;
  /** The REQUESTED schedule only; Nemryn creates no recurring arrangement or Trips from it. Omitted for a one-time request. */
  recurringSchedule?: RecurringSchedule;
}

/**
 * Maps Zenward-Web's validated `TransportationRequestInput` (already
 * whitelisted, normalised and length-capped by the Server Action) onto
 * Nemryn's exact flat body shape.
 *
 * `integrationExternalId` is an opaque per-integration identifier issued by
 * Nemryn -- NOT a privileged credential (see `PLATFORM_INTAKE_INTEGRATION_ID`
 * in `.env.example`). `idempotencyKey` is the caller's per-submission id (a
 * UUID held stable across retries of the SAME logical submission, fresh for
 * every NEW one), passed through unchanged. The output object is built field
 * by field, so no field the input happens to carry beyond these can reach the
 * wire.
 */
export function buildNemrynIntakeBody(
  input: TransportationRequestInput,
  integrationExternalId: string,
  idempotencyKey: string,
): NemrynIntakeRequestBody {
  const body: NemrynIntakeRequestBody = {
    integrationExternalId,
    idempotencyKey,
    requesterName: input.requesterName,
    requesterRelationship: input.requesterRelationship,
    requesterPhone: input.requesterPhone,
    passengerName: input.passengerName,
    pickupDescription: input.pickupDescription,
    destinationDescription: input.destinationDescription,
    returnTripNeeded: input.returnTripNeeded,
    serviceType: input.serviceType,
  };
  if (input.requesterEmail) body.requesterEmail = input.requesterEmail;
  if (input.preferredDate) body.preferredDate = input.preferredDate;
  if (input.preferredTime) body.preferredTime = input.preferredTime;
  if (input.assistanceNotes) body.assistanceNotes = input.assistanceNotes;
  if (input.additionalNotes) body.additionalNotes = input.additionalNotes;
  if (input.recurringSchedule) {
    const schedule = input.recurringSchedule;
    const recurring: RecurringSchedule = {
      daysOfWeek: [...schedule.daysOfWeek],
      startDate: schedule.startDate,
    };
    if (schedule.endDate) recurring.endDate = schedule.endDate;
    if (schedule.appointmentTime) recurring.appointmentTime = schedule.appointmentTime;
    if (schedule.returnTripExpected !== undefined) recurring.returnTripExpected = schedule.returnTripExpected;
    body.recurringSchedule = recurring;
  }
  return body;
}

/**
 * Why a request was not accepted, in the only distinctions the visitor-facing
 * copy needs. Nemryn deliberately collapses every rejection (validation
 * failure, disabled/unknown integration, origin mismatch) into one generic
 * `400`, so nothing finer can be -- or should be -- derived here.
 */
export type NemrynFailure =
  /** Nemryn refused the submission (generic 400 and any other 4xx). */
  | "rejected"
  /** 429 -- try again later. */
  | "rate_limited"
  /** 5xx -- Nemryn is temporarily failing. */
  | "unavailable"
  /** A 2xx whose body is not exactly `{ok:true}`: acceptance was not confirmed. */
  | "unconfirmed";

export type NemrynResponseOutcome = { delivered: true } | { delivered: false; failure: NemrynFailure };

/**
 * Interprets Nemryn's response. Success is EXACTLY `200` with a JSON body
 * `{"ok": true}` -- identically for a first acceptance and for an idempotent
 * replay of the same `idempotencyKey`; Nemryn's "no existence oracle" design
 * makes the two indistinguishable, and Nemryn never returns any kind of
 * reference id. Anything else is a failure: `delivered` is never inferred.
 */
export function interpretNemrynResponse(status: number, body: unknown): NemrynResponseOutcome {
  const accepted = typeof body === "object" && body !== null && (body as { ok?: unknown }).ok === true;
  if (status === 200 && accepted) return { delivered: true };
  if (status === 429) return { delivered: false, failure: "rate_limited" };
  if (status >= 500) return { delivered: false, failure: "unavailable" };
  if (status >= 200 && status < 300) return { delivered: false, failure: "unconfirmed" };
  return { delivered: false, failure: "rejected" };
}
