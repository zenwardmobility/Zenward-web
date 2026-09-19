/**
 * Structural types for a transportation request submitted from the public
 * marketing site. This is NOT the Zenward Platform's canonical
 * TransportationRequest schema — that lives in the platform repository
 * (docs/product/domain-model.md there) and is not yet finalized or
 * connected to this project. These are the minimal fields this site's form
 * needs; field names may not match the eventual platform schema 1:1.
 */
import type { ServiceType } from "./service-types";
import type { RecurringSchedule } from "./recurring";

export type { ServiceType, RecurringSchedule };

export type RequesterRelationship = "self" | "family" | "caregiver" | "facility_coordinator" | "other";
export type ReturnTripPreference = "yes" | "no" | "not_sure";

export interface TransportationRequestInput {
  /** Which approved service the request is for. Allow-listed (`SERVICE_TYPES`); required. */
  serviceType: ServiceType;
  requesterName: string;
  requesterRelationship: RequesterRelationship;
  requesterPhone: string;
  requesterEmail?: string;
  passengerName: string;
  pickupDescription: string;
  destinationDescription: string;
  preferredDate?: string;
  preferredTime?: string;
  returnTripNeeded: ReturnTripPreference;
  assistanceNotes?: string;
  additionalNotes?: string;
  /**
   * The REQUESTED recurring schedule, present only for a recurring request.
   * It describes what the requester wants — it does not create trips or a
   * booking. Absent = one-time request.
   */
  recurringSchedule?: RecurringSchedule;
}

export interface TransportationRequestResult {
  ok: boolean;
  /**
   * A reference the requester can quote in a follow-up call — not a
   * booking/trip ID of any kind. Nemryn's own trusted intake response
   * never contains a reference of its own (deliberate — see that
   * repository's "no existence oracle" design); when `delivered` is
   * `true` via the platform adapter, this is a Zenward-Web-LOCAL,
   * non-authoritative display value only, never Nemryn's internal
   * Request id.
   */
  referenceId?: string;
  error?: string;
  /**
   * True only when a **trusted delivery destination actually positively
   * accepted** the request (the trusted Nemryn intake — see
   * docs/architecture/nemryn-trusted-request-intake-contract.md). The stub
   * adapter returns `false`: it validated and acknowledged the form but
   * nothing was delivered or stored. Every non-acceptance (any error status,
   * timeout, or unreachable endpoint) also returns `false` — the adapter
   * fails closed. Drives the success-screen copy and gates the
   * `request_form_submitted` analytics event.
   */
  delivered: boolean;
}

/**
 * Client-supplied metadata that travels alongside the validated request
 * payload but is NOT part of the transportation-request fields. Collected in
 * the browser, re-validated in the Server Action, never shown to the visitor.
 */
export interface RequestSubmissionMeta {
  /**
   * A UUID identifying one *logical* form submission. Stable across
   * network-failure retries of the same submission so the trusted endpoint
   * can deduplicate. Generated client-side; the Server Action regenerates it
   * server-side if it is missing or malformed. Contains no personal
   * information. Sent to Nemryn unchanged as `idempotencyKey` — see
   * `nemryn-mapping.ts`'s own `buildNemrynIntakeBody`.
   */
  submissionId: string;
}

// The wire body actually sent to Nemryn's trusted intake endpoint is
// `NemrynIntakeRequestBody` (see `nemryn-mapping.ts`) — a flat JSON object
// with no envelope wrapper, no schema version, and no bearer credential.
// The speculative versioned-envelope shape that used to live here
// (`TrustedIntakeEnvelope`, written before Nemryn's endpoint existed) has
// been retired now that the real contract is implemented and proven; see
// docs/architecture/nemryn-trusted-request-intake-contract.md for the
// current, accurate spec.
