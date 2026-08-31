/**
 * Marketing analytics event layer.
 *
 * No vendor is installed yet — `track()` currently only logs in development.
 * Wire a vendor (Plausible, PostHog, GA4, etc.) into `dispatch()` below when
 * one is approved; every call site in this codebase stays unchanged.
 *
 * PRIVACY RULE, enforced structurally, not just by convention: each event's
 * property type below is a small, named shape containing only what's needed
 * to understand marketing performance (which CTA, which page, which step) —
 * never passenger name, phone, email, pickup/destination address, or any
 * medical/visit/trip-note content. There is no generic
 * `track(name: string, props: Record<string, unknown>)` escape hatch — if a
 * new event needs a new property, it's added to the type below deliberately,
 * where this rule is visible to whoever adds it.
 */

export type AnalyticsEvent =
  | {
      name: "request_transportation_clicked";
      source:
        | "header"
        | "hero"
        | "footer"
        | "mobile_nav"
        | "reassurance_strip"
        | "getting_to_care"
        | "patients_families"
        | "final_cta"
        | "services_page"
        | "provider_page"
        | "other";
    }
  | { name: "request_form_started" }
  // Fired ONLY when the request was genuinely delivered to a trusted
  // destination (TransportationRequestResult.delivered === true). The stub
  // adapter does not deliver, so in stub mode this event never fires.
  | { name: "request_form_submitted"; hasReturnTrip: boolean }
  | { name: "provider_cta_clicked"; source: "homepage" | "healthcare_providers_page" | "footer" }
  | { name: "contact_started"; topic: "general" | "provider" | "support" };

function dispatch(event: AnalyticsEvent): void {
  // Replacement point: send `event` to the approved analytics vendor here.
  // Keep the same narrow AnalyticsEvent union as the vendor call's input —
  // do not widen this to accept arbitrary properties.
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event.name, event);
  }
}

export function track(event: AnalyticsEvent): void {
  try {
    dispatch(event);
  } catch {
    // Analytics must never break the page.
  }
}
