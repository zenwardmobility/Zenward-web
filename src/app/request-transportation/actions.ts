"use server";

import { getRequestIntakeAdapter } from "@/lib/request-intake/adapter";
import { isPublicServiceType } from "@/lib/request-intake/service-types";
import { parseRecurringSchedule } from "@/lib/request-intake/recurring";
import { findTenancyKeys } from "@/lib/request-intake/tenancy";
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
  isUuid,
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

const RECURRING_ERROR =
  "Please check the recurring schedule (days of the week and start date) and try again, or call us.";

const GENERIC_ERROR =
  "We couldn't submit your request. Please check the form and try again, or call us to arrange transportation.";

/**
 * The only entry point the browser calls. Runs server-side (Next.js Server
 * Action). It rebuilds the payload from a fixed whitelist of fields —
 * unknown properties the client may send are dropped, every string is
 * normalised and length-capped, and enum fields are checked against their
 * allowed values — before anything reaches the configured adapter.
 *
 * There is no `organization_id` / `tenant_id`, trip state, driver, or vehicle
 * field for a client to supply or forge — and a submission that CONTAINS one
 * (at any depth) is rejected outright, not silently trimmed. Request content is never logged in
 * full, never persisted in the browser, and never sent to analytics.
 *
 * The client also sends a `submissionId` (UUID) so a network-failure retry of
 * the same submission is de-duplicated downstream. It is re-validated here and
 * regenerated server-side if missing or malformed — `submittedAt` and
 * `source` are always generated server-side (in the adapter).
 */
export async function submitTransportationRequest(
  input: unknown,
  guard?: SubmissionGuard,
): Promise<TransportationRequestResult> {
  const gate = checkSubmissionGuard(guard);
  if (!gate.ok) return { ok: false, delivered: false, error: gate.reason };

  // Trust a well-formed client submissionId (stable across retries); otherwise
  // mint one. Never derived from personal information.
  const submissionId = isUuid(guard?.submissionId) ? guard.submissionId : crypto.randomUUID();

  if (!input || typeof input !== "object" || !isPayloadWithinLimit(input)) {
    return { ok: false, delivered: false, error: GENERIC_ERROR };
  }

  const src = input as Record<string, unknown>;

  // A caller-supplied tenancy identifier is never legitimate on this public
  // form. Reject (don't just drop it) and log the fact only — no values, no
  // request content.
  if (findTenancyKeys(src).length > 0) {
    console.warn("[request-intake] rejected submission: caller-supplied tenancy field.");
    return { ok: false, delivered: false, error: GENERIC_ERROR };
  }

  // serviceType must be exactly one of the publicly offered values. A missing,
  // unknown or not-yet-public value (Nemryn accepts more than Zenward offers) is
  // rejected, never coerced to "other".
  if (!isPublicServiceType(src.serviceType)) {
    return { ok: false, delivered: false, error: "Please fill in all required fields." };
  }

  // recurringSchedule: absent → one-time; present → must validate strictly.
  const schedule = parseRecurringSchedule(src.recurringSchedule);
  if (!schedule.ok) {
    return { ok: false, delivered: false, error: RECURRING_ERROR };
  }

  const clean: TransportationRequestInput = {
    serviceType: src.serviceType,
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
  if (schedule.value) clean.recurringSchedule = schedule.value;

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
    return await getRequestIntakeAdapter().submit(clean, { submissionId });
  } catch (err) {
    console.error("[request-intake] submit failed.", err instanceof Error ? err.name : "unknown");
    return { ok: false, delivered: false, error: GENERIC_ERROR };
  }
}
