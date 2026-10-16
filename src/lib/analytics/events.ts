/**
 * Marketing / conversion event layer (WEB-P1-E2; conversion foundation
 * ZW-WEB-04D).
 *
 * NO VENDOR IS INSTALLED. There is no gtag, Google Tag Manager, GA4, Google
 * Ads tag, dataLayer, cookie or network call here. `track()` hands a
 * sanitised event to registered sinks, and NO sink is registered anywhere in
 * the app, so production does nothing. Activating a vendor is a separate,
 * explicit phase (see docs/product/conversion-measurement.md); it must go
 * through `registerAnalyticsSink`, and it may only ever receive the
 * sanitised events defined below.
 *
 * PRIVACY RULE (enforced twice):
 *   1. Types: each event is a small, closed shape. There is no generic
 *      `track(name, props)` escape hatch.
 *   2. Runtime: `sanitizeEvent` rebuilds every event from an allowlist of
 *      keys and values, so anything else (passenger/requester names,
 *      contact details, pickup/destination, dates/times, notes, recurring
 *      schedules, integration/idempotency/tenant/trip ids, URLs, query
 *      strings, form values) is dropped even if a caller passes it.
 * `serviceType` is deliberately NOT an event parameter. Values such as
 * dialysis or wheelchair can reveal health or mobility context, and must not
 * reach advertising platforms.
 */

/** Where on the site an action happened. Closed, non-sensitive allowlist. */
export const ANALYTICS_SURFACES = [
  "header",
  "hero",
  "homepage",
  "services",
  "service_page",
  "campaign_page",
  "market_page",
  "footer",
  "request_form",
  "provider_page",
  "contact_page",
] as const;
export type AnalyticsSurface = (typeof ANALYTICS_SURFACES)[number];

/** Legacy CTA-click sources (pre-04D), kept so existing call sites stay typed. */
const REQUEST_CLICK_SOURCES = [
  "header",
  "hero",
  "footer",
  "mobile_nav",
  "reassurance_strip",
  "getting_to_care",
  "patients_families",
  "final_cta",
  "services_page",
  "service_page",
  "why_medical_transportation",
  "provider_page",
  "campaign_page",
  "market_page",
  "other",
] as const;
const PROVIDER_CLICK_SOURCES = ["homepage", "healthcare_providers_page", "footer", "market_page"] as const;
const CONTACT_TOPICS = ["general", "provider", "support"] as const;

export type AnalyticsEvent =
  // Conversion events (ZW-WEB-04D).
  | { name: "phone_cta_clicked"; surface: AnalyticsSurface }
  // First genuine interaction with the request form (fires once per mount).
  | { name: "transportation_quote_started" }
  // ONLY when the request was genuinely delivered (TransportationRequestResult.delivered === true).
  | { name: "transportation_quote_submitted" }
  // ONLY when a provider-topic contact message was genuinely delivered.
  | { name: "provider_enquiry_submitted" }
  // Navigation / engagement events.
  | { name: "request_transportation_clicked"; source: (typeof REQUEST_CLICK_SOURCES)[number] }
  | { name: "provider_cta_clicked"; source: (typeof PROVIDER_CLICK_SOURCES)[number] }
  | { name: "contact_started"; topic: (typeof CONTACT_TOPICS)[number] }
  // Transportation Assistant (ZW-WEB-04H). No parameters: never message text,
  // never the service (it can reveal health context), never a URL.
  | { name: "transportation_assistant_opened" }
  | { name: "transportation_assistant_quote_clicked" };

export type AnalyticsEventName = AnalyticsEvent["name"];

/** The ONLY keys each event may carry, and the values each key may take. */
const EVENT_SCHEMA: Record<AnalyticsEventName, Record<string, readonly string[]>> = {
  phone_cta_clicked: { surface: ANALYTICS_SURFACES },
  transportation_quote_started: {},
  transportation_quote_submitted: {},
  provider_enquiry_submitted: {},
  request_transportation_clicked: { source: REQUEST_CLICK_SOURCES },
  provider_cta_clicked: { source: PROVIDER_CLICK_SOURCES },
  contact_started: { topic: CONTACT_TOPICS },
  transportation_assistant_opened: {},
  transportation_assistant_quote_clicked: {},
};

/**
 * Rebuilds an event from its allowlist. Returns `null` for an unknown event
 * name or a missing/disallowed value for a required key. Every key not in the
 * schema is dropped.
 */
export function sanitizeEvent(input: unknown): AnalyticsEvent | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const name = raw.name;
  if (typeof name !== "string" || !Object.prototype.hasOwnProperty.call(EVENT_SCHEMA, name)) return null;
  const schema = EVENT_SCHEMA[name as AnalyticsEventName];
  const clean: Record<string, string> = { name };
  for (const [key, allowed] of Object.entries(schema)) {
    const value = raw[key];
    if (typeof value !== "string" || !allowed.includes(value)) return null;
    clean[key] = value;
  }
  return clean as AnalyticsEvent;
}

export type AnalyticsSink = (event: AnalyticsEvent) => void;

const sinks: AnalyticsSink[] = [];

/**
 * Registers a delivery sink and returns an unregister function. Nothing in
 * the app calls this today. A future, explicitly approved vendor phase is
 * the only place that may.
 */
export function registerAnalyticsSink(sink: AnalyticsSink): () => void {
  sinks.push(sink);
  return () => {
    const index = sinks.indexOf(sink);
    if (index >= 0) sinks.splice(index, 1);
  };
}

/**
 * Fire-and-forget. Never throws, never blocks, never prevents a link or call.
 * A failing sink cannot affect the user's action or other sinks.
 */
export function track(event: AnalyticsEvent): void {
  try {
    const clean = sanitizeEvent(event);
    if (!clean) return;
    if (process.env.NODE_ENV === "development") console.debug("[analytics]", clean);
    for (const sink of sinks) {
      try {
        sink(clean);
      } catch {
        // A sink failure must never break the page or other sinks.
      }
    }
  } catch {
    // Analytics must never break the page.
  }
}
