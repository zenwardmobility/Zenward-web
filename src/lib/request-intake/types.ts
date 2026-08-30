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
}
