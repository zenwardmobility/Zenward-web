/**
 * Structural types for a transportation request submitted from the public
 * marketing site. This is NOT the Zenward Platform's canonical
 * TransportationRequest schema — that lives in the platform repository
 * (docs/product/domain-model.md there) and is not yet finalized or
 * connected to this project. These are the minimal fields this site's form
 * needs; field names may not match the eventual platform schema 1:1.
 */
export type RequesterRelationship = "self" | "family" | "caregiver" | "facility_coordinator" | "other";
export type ReturnTripPreference = "yes" | "no" | "not_sure";

export interface TransportationRequestInput {
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
}

export interface TransportationRequestResult {
  ok: boolean;
  /** A reference the requester can quote in a follow-up call — not a booking/trip ID of any kind. */
  referenceId?: string;
  error?: string;
  /**
   * True only when a **trusted delivery destination actually positively
   * accepted** the request (the future trusted Nemryn intake — see
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
   * information.
   */
  submissionId: string;
}

/**
 * The exact JSON body `PlatformRequestIntakeAdapter` POSTs to the trusted
 * intake endpoint. An explicit, versioned envelope so the endpoint contract
 * can evolve without ambiguity. NEVER contains an organization_id / tenant_id
 * / operator id — the endpoint resolves the Zenward Mobility tenant from its
 * own server-side credentials. This envelope is internal; it is never exposed
 * to the browser or the visitor.
 */
export interface TrustedIntakeEnvelope {
  /** Envelope schema version. Bumped only on a breaking envelope change. */
  schemaVersion: "1.0";
  /** UUID — mirrors the `Idempotency-Key` header. See `RequestSubmissionMeta`. */
  submissionId: string;
  /** ISO-8601 UTC instant the Server Action forwarded the request. Server-generated. */
  submittedAt: string;
  /** Constant identifying this caller. Server-generated. */
  source: "zenward_web";
  /** The validated transportation-request fields, unchanged. */
  request: TransportationRequestInput;
}
