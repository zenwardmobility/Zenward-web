"use server";

import { getRequestIntakeAdapter } from "@/lib/request-intake/adapter";
import type { TransportationRequestInput, TransportationRequestResult } from "@/lib/request-intake/types";

const REQUIRED_FIELDS: (keyof TransportationRequestInput)[] = [
  "requesterName",
  "requesterRelationship",
  "requesterPhone",
  "passengerName",
  "pickupDescription",
  "destinationDescription",
  "returnTripNeeded",
];

/**
 * The only entry point the browser calls. Runs server-side (Next.js Server
 * Action) — no service-role or other secret is ever sent to the client, and
 * there is no `organization_id` field anywhere in this form for a client to
 * supply or forge; ownership assignment, when a real backend exists, is the
 * adapter's / platform's responsibility, never this form's.
 */
export async function submitTransportationRequest(
  input: TransportationRequestInput,
): Promise<TransportationRequestResult> {
  for (const field of REQUIRED_FIELDS) {
    if (!input[field] || String(input[field]).trim() === "") {
      return { ok: false, error: `Missing required field: ${field}` };
    }
  }

  const adapter = getRequestIntakeAdapter();
  return adapter.submit(input);
}
