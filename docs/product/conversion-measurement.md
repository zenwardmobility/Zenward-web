# Zenward Web — Conversion Measurement

**Status:** Foundation only (ZW-WEB-04D). **No tracking vendor is installed.** No Google Ads tag, GA4, Google Tag
Manager, gtag.js, `dataLayer`, advertising cookie or analytics network request exists in this codebase.

## What exists

`src/lib/analytics/events.ts`. `track()` sanitises each event against a per-event allowlist and hands it to
registered sinks. **No sink is registered**, so production does nothing. Tests (`events.test.mjs`) enforce that
no vendor code, `dataLayer` or network client is present and that no sink is registered in the app.

| Event | Fires when | Parameters |
|---|---|---|
| `phone_cta_clicked` | Any tracked `tel:` link is clicked (CallButton, PhoneCtaButton, header, footer, homepage, practical facts) | `surface` only |
| `transportation_quote_started` | First genuine interaction (focus) with the request form, once per mount | none |
| `transportation_quote_submitted` | **Only** when the intake adapter reports `delivered: true` (Nemryn returned `200 {"ok":true}`) | none |
| `provider_enquiry_submitted` | **Only** when a contact message on the "provider" topic is genuinely delivered | none |
| `request_transportation_clicked`, `provider_cta_clicked`, `contact_started` | CTA clicks / contact form start (engagement, not conversions) | `source` / `topic` (closed lists) |

`surface` is a closed list: header, hero, homepage, services, service_page, campaign_page, market_page, footer,
request_form, provider_page, contact_page.

## Privacy rules (enforced in types **and** at runtime)

Events never carry passenger or requester names, relationship, phone, email, pickup, destination, dates/times,
assistance or additional notes, recurring schedules, integration/idempotency/organization/tenant/passenger/trip
ids, URLs, query strings or any form value. **`serviceType` is never an event parameter**: values such as
dialysis or wheelchair can reveal health or mobility context. Conversion events carry no service information
at all. The old `hasReturnTrip` parameter was removed.

## Before Google conversion tracking may be activated (separate, explicit phase)

1. **Privacy/legal (BLOCKER).** `/privacy` currently says the site aims to use "no advertising or cross-site
   tracking cookies" and that no third party processes request contents (see 04A LP-01/LP-02). Google
   advertising/conversion measurement **must not be enabled** until the privacy language is reviewed and aligned
   with the actual tracking implementation, and with the Nemryn processing that already happens.
2. **Health-data review.** Specialist review of HIPAA / state health-privacy applicability to tracking on pages
   that describe health-related transportation (04A A-04). Decide what page URLs may reach Google (04A A-01;
   e.g. strip query strings, avoid service-revealing paths in conversion hits).
3. **Consent.** Decide whether a consent mechanism (and Google Consent Mode) is required (04A A-05).
4. **Account setup.** A Google Ads account, conversion actions and their IDs/labels, created by the owner.
   **No IDs are invented or stored in this repository until then.**
5. **Configuration rules.** No remarketing or audience lists based on service, condition or mobility. Enhanced
   Conversions / user-provided data OFF. Google Signals / ads personalisation OFF if GA4 is used. Minimum data
   retention.
6. **Production domain.** Verify https://www.zenwardmobility.com in the Google Ads account and tag settings.
7. **Final event mapping.** Map `transportation_quote_submitted` (primary) and `phone_cta_clicked` (secondary),
   and optionally `provider_enquiry_submitted`, to conversion actions, with no parameters beyond the allowlist.
8. **Implementation.** One sink registered via `registerAnalyticsSink` in a single, reviewed place; vendor
   script loaded only after the consent decision is applied.
9. **Testing.** Verify with Google Tag Assistant / tag diagnostics on a preview deployment: correct event
   names, no PII, no service values, no firing on failed/undelivered submissions.

## Known gaps

- Calls placed directly from Google Ads call assets are measured inside Google Ads, not here.
- The request form's undelivered fallback `tel:` link and the contact form's "message wasn't sent" `tel:` link
  are plain links (not tracked) to avoid touching form internals in 04D.
