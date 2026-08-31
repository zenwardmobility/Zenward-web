"use server";

import { getRequestIntakeAdapter } from "@/lib/request-intake/adapter";
import type {
  RequesterRelationship,
  ReturnTripPreference,
  TransportationRequestInput,
  TransportationRequestResult,
} from "@/lib/request-intake/types";
import {
  checkSubmissionGuard,
  cleanString,
  FIELD_LIMITS,
  isAllowed,
  isPayloadWithinLimit,
  type SubmissionGuard,
} from "@/lib/forms/guard";

const RELATIONSHIPS: readonly RequesterRelationship[] = [
  "self",
  "family",
  "caregiver",
  "facility_coordinator",
  "other",
];
const RETURN_TRIP: readonly ReturnTripPreference[] = ["yes", "no", "not_sure"];

const GENERIC_ERROR =
  "We couldn't submit your request. Please check the form and try again, or call us to arrange transportation.";

/**
 * The only entry point the browser calls. Runs server-side (Next.js Server
 * Action). It rebuilds the payload from a fixed whitelist of fields —
 * unknown properties the client may send are dropped, every string is
 * normalised and length-capped, and enum fields are checked against their
 * allowed values — before anything reaches the configured adapter.
 *
 * There is no `organization_id`, trip state, driver, or vehicle field for a
 * client to supply or forge. Request content is never logged in full, never
 * persisted in the browser, and never sent to analytics.
 */
export async function submitTransportationRequest(
  input: unknown,
  guard?: SubmissionGuard,
): Promise<TransportationRequestResult> {
  const gate = checkSubmissionGuard(guard);
  if (!gate.ok) return { ok: false, delivered: false, error: gate.reason };

  if (!input || typeof input !== "object" || !isPayloadWithinLimit(input)) {
    return { ok: false, delivered: false, error: GENERIC_ERROR };
  }

  const src = input as Record<string, unknown>;

  const clean: TransportationRequestInput = {
    requesterName: cleanString(src.requesterName, FIELD_LIMITS.name) ?? "",
    requesterRelationship: (isAllowed(src.requesterRelationship, RELATIONSHIPS)
      ? src.requesterRelationship
      : "") as RequesterRelationship,
    requesterPhone: cleanString(src.requesterPhone, FIELD_LIMITS.phone) ?? "",
    requesterEmail: cleanString(src.requesterEmail, FIELD_LIMITS.email),
    passengerName: cleanString(src.passengerName, FIELD_LIMITS.name) ?? "",
    pickupDescription: cleanString(src.pickupDescription, FIELD_LIMITS.shortText) ?? "",
    destinationDescription: cleanString(src.destinationDescription, FIELD_LIMITS.shortText) ?? "",
    preferredDate: cleanString(src.preferredDate, 40),
    preferredTime: cleanString(src.preferredTime, 40),
    returnTripNeeded: (isAllowed(src.returnTripNeeded, RETURN_TRIP)
      ? src.returnTripNeeded
      : "") as ReturnTripPreference,
    assistanceNotes: cleanString(src.assistanceNotes, FIELD_LIMITS.longText),
    additionalNotes: cleanString(src.additionalNotes, FIELD_LIMITS.longText),
  };

  const missingRequired =
    !clean.requesterName ||
    !RELATIONSHIPS.includes(clean.requesterRelationship) ||
    !clean.requesterPhone ||
    !clean.passengerName ||
    !clean.pickupDescription ||
    !clean.destinationDescription ||
    !RETURN_TRIP.includes(clean.returnTripNeeded);

  if (missingRequired) {
    return { ok: false, delivered: false, error: "Please fill in all required fields." };
  }

  try {
    return await getRequestIntakeAdapter().submit(clean);
  } catch (err) {
    console.error("[request-intake] submit failed.", err instanceof Error ? err.name : "unknown");
    return { ok: false, delivered: false, error: GENERIC_ERROR };
  }
}
