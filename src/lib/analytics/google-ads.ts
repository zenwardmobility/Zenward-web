/**
 * Google Ads conversion boundary (ZW-WEB-04M): READY BUT DISABLED.
 *
 * Recommended architecture (see docs/product/conversion-measurement.md):
 * NO Google script in the browser. A Google Ads click identifier (gclid,
 * gbraid or wbraid) is read from the landing URL, kept first-party, and only
 * when the trusted intake reports delivered: true does the SERVER upload one
 * click conversion to Google Ads. Google then receives only the click
 * identifier, the conversion action and the conversion time: never a page
 * URL, path, query string (e.g. ?service=dialysis), title, referrer, cookie,
 * service type, assistance level or any trip or personal data.
 *
 * This module holds only the PURE parts: configuration and the activation
 * gate, conversion classification, click-ID parsing and the minimal upload
 * payload. It contains no network code, no script loader, no browser global,
 * no cookie or storage write, and no API credentials. Nothing in the app
 * imports it yet, so it adds nothing to any bundle.
 *
 * Activation needs ALL of:
 *   1. MEASUREMENT_APPROVED = true (a reviewed code change, after the
 *      owner/legal gate in docs/product/google-ads-conversion-activation-checklist.md)
 *   2. GOOGLE_ADS_CONVERSIONS_ENABLED=true plus the customer and
 *      conversion-action IDs (server env, supplied by the owner)
 *   3. an approved click-ID capture (first-party storage) and a server
 *      transport with credentials, which are deliberately NOT implemented here.
 * Missing anything means OFF. Enhanced Conversions, remarketing and audiences
 * are not supported by design.
 *
 * Relative imports only (node-testable).
 */
import type { AnalyticsEvent, AnalyticsSink } from "./events.ts";
import { conversionKeyFor, type ConversionKey } from "./conversions.ts";

/**
 * Code-level kill switch. Environment variables alone can never activate
 * Google measurement; flipping this requires a reviewed change made in the
 * SAME release as the Privacy-policy update.
 */
export const MEASUREMENT_APPROVED = false;

/** Conversions this architecture would upload server-side. Phone clicks are not uploaded (see SERVER_UPLOAD_KEYS). */
export interface GoogleAdsConfig {
  enabled: boolean;
  /** Google Ads customer ID, digits only. */
  customerId?: string;
  /** Conversion action IDs (digits), per conversion key. */
  actions: Partial<Record<ConversionKey, string>>;
}

/**
 * The only conversions uploaded server-side. Phone clicks are deliberately
 * excluded: a click on a tel: link is not a call, and real call measurement
 * belongs to Google call reporting / forwarding numbers (an owner decision).
 */
export const SERVER_UPLOAD_KEYS: readonly ConversionKey[] = ["quote_submitted", "provider_enquiry"];

const DIGITS = /^\d{6,20}$/;

/**
 * Reads the SERVER-only configuration (never NEXT_PUBLIC_: nothing runs in
 * the browser). Anything missing or malformed means disabled.
 */
export function readGoogleAdsConfig(env: Record<string, string | undefined> = process.env): GoogleAdsConfig {
  const customerId = (env.GOOGLE_ADS_CUSTOMER_ID ?? "").replace(/-/g, "").trim();
  const quote = (env.GOOGLE_ADS_QUOTE_CONVERSION_ACTION_ID ?? "").trim();
  const provider = (env.GOOGLE_ADS_PROVIDER_CONVERSION_ACTION_ID ?? "").trim();
  const actions: GoogleAdsConfig["actions"] = {};
  if (DIGITS.test(quote)) actions.quote_submitted = quote;
  if (DIGITS.test(provider)) actions.provider_enquiry = provider;
  return {
    enabled: env.GOOGLE_ADS_CONVERSIONS_ENABLED === "true",
    customerId: DIGITS.test(customerId) ? customerId : undefined,
    actions,
  };
}

/** True only when the code gate, the env switch, a customer ID and the primary action are all present. */
export function isGoogleAdsMeasurementActive(config: GoogleAdsConfig, approved: boolean = MEASUREMENT_APPROVED): boolean {
  return approved && config.enabled && Boolean(config.customerId) && Boolean(config.actions.quote_submitted);
}

// ---------------------------------------------------------------- click identifiers

export type ClickIdType = "gclid" | "gbraid" | "wbraid";
export interface ClickId {
  type: ClickIdType;
  value: string;
}

const CLICK_ID_TYPES: readonly ClickIdType[] = ["gclid", "gbraid", "wbraid"];
const CLICK_ID_VALUE = /^[A-Za-z0-9_-]{10,512}$/;

/**
 * Extracts ONE Google Ads click identifier from a query string, or null.
 * Only gclid / gbraid / wbraid (in that order of preference), with a strict
 * character allowlist. UTM parameters, ?service= and every other query value
 * are ignored and never returned. Pure: it reads nothing and stores nothing.
 */
export function parseClickId(search: string): ClickId | null {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  } catch {
    return null;
  }
  for (const type of CLICK_ID_TYPES) {
    const value = params.get(type);
    if (value && CLICK_ID_VALUE.test(value)) return { type, value };
  }
  return null;
}

// ---------------------------------------------------------------- upload payload

/** Google Ads API ClickConversion fields: exactly the minimum Google requires, and nothing else. */
export interface ClickConversionUpload {
  conversionAction: string;
  conversionDateTime: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
}

/** "yyyy-mm-dd hh:mm:ss+00:00" in UTC, the format the Google Ads API expects. */
export function formatConversionDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}+00:00`;
}

/**
 * The upload for one conversion, or null when measurement is inactive, the
 * event isn't an uploadable conversion, its action isn't configured, or
 * there's no click identifier (no ad click means nothing to attribute).
 * Takes the event NAME only, so no event payload can leak into it.
 */
export function buildClickConversion(
  event: Pick<AnalyticsEvent, "name">,
  clickId: ClickId | null,
  occurredAt: Date,
  config: GoogleAdsConfig,
  approved: boolean = MEASUREMENT_APPROVED,
): ClickConversionUpload | null {
  if (!isGoogleAdsMeasurementActive(config, approved) || !clickId) return null;
  const key = conversionKeyFor(event);
  if (!key || !SERVER_UPLOAD_KEYS.includes(key)) return null;
  const actionId = config.actions[key];
  if (!actionId || !CLICK_ID_VALUE.test(clickId.value) || !CLICK_ID_TYPES.includes(clickId.type)) return null;
  return {
    conversionAction: `customers/${config.customerId}/conversionActions/${actionId}`,
    conversionDateTime: formatConversionDateTime(occurredAt),
    [clickId.type]: clickId.value,
  };
}

// ---------------------------------------------------------------- browser sink boundary

/**
 * An `AnalyticsSink` for a future activation that needs a browser-side signal.
 * Returns null (nothing to register) unless measurement is active. It passes
 * ONLY the conversion key to `deliver`, never the event's fields. It counts
 * the primary conversion at most once per page lifetime, swallows every
 * error, and ignores diagnostic events. The app does not register it
 * anywhere today.
 */
export function createConversionSink(
  config: GoogleAdsConfig,
  deliver: (key: ConversionKey) => void,
  approved: boolean = MEASUREMENT_APPROVED,
): AnalyticsSink | null {
  if (!isGoogleAdsMeasurementActive(config, approved)) return null;
  let primarySent = false;
  return (event) => {
    try {
      const key = conversionKeyFor(event);
      if (!key) return;
      if (key === "quote_submitted") {
        if (primarySent) return;
        primarySent = true;
      }
      deliver(key);
    } catch {
      // Measurement must never affect the visitor's action.
    }
  };
}
