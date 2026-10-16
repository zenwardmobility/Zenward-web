/**
 * Conversion classification (ZW-WEB-04M): the ONE place that says which
 * internal Zenward events may ever count as advertising conversions.
 *
 *   PRIMARY     transportation_quote_submitted: a transportation request the
 *               intake genuinely accepted (delivered: true). The only event an
 *               ad platform may optimise toward.
 *   SECONDARY   phone_cta_clicked: a click on a tel: link. Intent only, NOT a
 *               completed or qualified call. provider_enquiry_submitted: a
 *               delivered provider-topic message; a different funnel, never
 *               merged with passenger requests.
 *   DIAGNOSTIC  everything else (form starts, CTA clicks, contact starts,
 *               assistant opens). Internal observation only; never sent to an
 *               ad platform as a conversion.
 *
 * Conversions carry NO parameters. The internal event layer
 * (src/lib/analytics/events.ts) already strips everything else.
 *
 * Pure, relative imports only (node-testable).
 */
import type { AnalyticsEvent, AnalyticsEventName } from "./events.ts";

export type ConversionTier = "primary" | "secondary" | "diagnostic";

export const CONVERSION_TIERS: Record<AnalyticsEventName, ConversionTier> = {
  transportation_quote_submitted: "primary",
  phone_cta_clicked: "secondary",
  provider_enquiry_submitted: "secondary",
  transportation_quote_started: "diagnostic",
  request_transportation_clicked: "diagnostic",
  provider_cta_clicked: "diagnostic",
  contact_started: "diagnostic",
  transportation_assistant_opened: "diagnostic",
  transportation_assistant_quote_clicked: "diagnostic",
};

/** Conversion actions an ad account may define. Names only; no IDs live in this repository. */
export type ConversionKey = "quote_submitted" | "phone_click" | "provider_enquiry";

const CONVERSION_KEYS: Partial<Record<AnalyticsEventName, ConversionKey>> = {
  transportation_quote_submitted: "quote_submitted",
  phone_cta_clicked: "phone_click",
  provider_enquiry_submitted: "provider_enquiry",
};

/** The conversion an event represents, or null for diagnostic events. Takes only the event name. */
export function conversionKeyFor(event: Pick<AnalyticsEvent, "name">): ConversionKey | null {
  return CONVERSION_KEYS[event.name] ?? null;
}

/** Human-readable conversion action names for the ad account (activation checklist). */
export const CONVERSION_ACTION_NAMES: Record<ConversionKey, string> = {
  quote_submitted: "Transportation Quote Submitted",
  phone_click: "Phone Click",
  provider_enquiry: "Provider Enquiry",
};
