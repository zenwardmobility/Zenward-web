# Zenward Web — Conversion Measurement

**Status (ZW-WEB-04M, 2026-10-17): READY BUT DISABLED.**

**Nothing on the website sends any data to Google or any other ad or analytics vendor.**
- No Google tag / gtag.js, GA4, Google Tag Manager, `dataLayer`, advertising cookie, pixel or vendor network
  request exists.
- No analytics sink is registered.
- The Google Ads boundary (`src/lib/analytics/google-ads.ts`) is pure code that the app does not import. It is
  gated off by a code-level constant (`MEASUREMENT_APPROVED = false`) as well as by environment configuration.

## 1. Architecture today

```
UI component ──track()──▶ sanitizeEvent (allowlist) ──▶ registered sinks (NONE)
```

- **`src/lib/analytics/events.ts`**: closed event types, a per-event allowlist and `track()`, which is
  fire-and-forget and swallows every error. `registerAnalyticsSink` is the only integration point, and nothing
  calls it.
- **`src/lib/analytics/conversions.ts`** (04M): the one classification table (below).
- **`src/lib/analytics/google-ads.ts`** (04M): pure Google Ads boundary:
  - configuration and the default-OFF gate
  - click-ID parsing (`gclid` / `gbraid` / `wbraid` only)
  - the minimal server-upload payload
  - an optional sink factory that returns `null` unless activated
  - no network code, script loader, browser global, cookie or storage write, and no credentials

| Event | Fires when (call site) | Parameters |
|---|---|---|
| `transportation_quote_submitted` | `RequestTransportationForm`: only when the Server Action returns `ok && delivered === true` (Nemryn answered `200 {"ok":true}`); **once per form mount** via a `once()` ref (04M) | none |
| `phone_cta_clicked` | `TrackedPhoneLink` (every tracked `tel:` link) | `surface` (closed list) |
| `provider_enquiry_submitted` | `ContactForm`: only for a delivered message on the provider topic; once per mount (04M) | none |
| `transportation_quote_started` | first focus in the request form, once per mount | none |
| `request_transportation_clicked` / `provider_cta_clicked` | CTA clicks | `source` (closed list) |
| `contact_started` | first interaction with the contact form | `topic` (closed list) |
| `transportation_assistant_opened` / `transportation_assistant_quote_clicked` | Zenny launcher / Zenny quote link | none |

## 2. Conversion classification

| Tier | Event | Why |
|---|---|---|
| **PRIMARY** | `transportation_quote_submitted` | The business outcome: a transportation request the intake genuinely accepted. Delivered-only, so failed, rejected, timed-out or unconfigured submissions never count. The only event an ad platform may optimise toward. |
| SECONDARY | `phone_cta_clicked` | A click on a `tel:` link is **intent, not a call**. It doesn't show that a call connected, was answered or was qualified. Real call measurement needs Google call reporting / forwarding numbers or a call provider (an owner decision). Observation only, and **never uploaded** by the recommended architecture. |
| SECONDARY | `provider_enquiry_submitted` | A genuinely delivered provider-topic message: a different, B2B funnel. It is reported under its own conversion action and **never merged** with passenger requests. |
| DIAGNOSTIC | `transportation_quote_started`, `request_transportation_clicked`, `provider_cta_clicked`, `contact_started`, `transportation_assistant_opened`, `transportation_assistant_quote_clicked` | Engagement signals for internal funnel diagnosis. Optimising toward them would train campaigns on clicks and form starts rather than delivered requests. They are never sent to an ad platform. |

## 3. Sensitive-data rules (apply to anything Google-facing)

A Google-facing conversion may carry **only** what Google requires to attribute it:
- one click identifier
- the conversion action
- the conversion time

**Never sent:**
- service type, label or slug
- passenger or requester name, relationship, phone or email
- pickup, destination, date, time, return trip or recurring schedule
- assistance level or notes, additional notes, airport/flight details
- integration, idempotency, organization, tenant, Request, Passenger or Trip IDs
- page URL, path, query string, document title or referrer
- any free-form context object

These rules are enforced by tests (`src/lib/analytics/google-ads.test.mjs`).

## 4. The health-context URL risk (critical finding)

The site's URLs and titles reveal health and mobility intent:
- `/services/dialysis-transportation` and `/services/wheelchair-transportation`
- `/metro-atlanta/dialysis-transportation`
- `/request-transportation?service=dialysis`

A conventional **browser Google tag** (gtag.js / Google tag) reports the **current page URL including the query
string**, the **referrer** and, for page-level hits, the **page title** as part of its own requests. This happens
on every page where it runs, and on the conversion hit itself. Google receives this as standard request data, not
as custom event parameters, so **removing custom parameters does not prevent it.** The tag would also set
first-party advertising cookies site-wide.

In practice, a site-wide tag would tell Google that a visitor who clicked an ad viewed the dialysis or
wheelchair page, and a conversion fired on `/request-transportation?service=dialysis` would carry "dialysis" in
its URL.

Partial mitigations exist, but none removes the risk on its own:
- Overriding `page_location` / `page_referrer` / `page_title`.
- Stripping `?service=` with `history.replaceState`.
- Loading the tag only on non-service pages.

Each would need verification by network inspection at activation, and the tag would still run, set cookies and
observe navigation. **Finding: a browser Google tag is NOT acceptable for Zenward unless the owner/legal review
explicitly accepts this exposure.**

## 5. Attribution options considered

| Option | Attribution | Health-context exposure | New processors / cookies | Verdict |
|---|---|---|---|---|
| **A. Site-wide Google tag** | Best (conventional) | **High**: every page URL, title and referrer, including service pages and `?service=` | Google tag + ad cookies on every page | Not recommended |
| **B. Tag only at conversion time** (load the tag on the success screen) | **Largely lost.** The `gclid` arrives on the landing page, but nothing records it there; by the time the tag loads on the request page, the URL no longer carries it. Google can only fall back on its own cross-site signals, which are unreliable and declining. | Medium: the conversion hit still carries the request-page URL (`?service=…`) and referrer | Google tag + cookies on the request page | Not recommended (misleading data and residual exposure) |
| **C. First-party click-ID capture + server-side conversion upload** | Good for the same visit. Cross-visit attribution is possible if the ID is kept longer (consent decision). | **Low**: Google receives only the click ID, the conversion action and the time. No browser Google code, so no URLs, titles, referrers or browsing. | No Google script or cookie. Adds Google Ads API access (OAuth + developer token) on the server. | **Recommended** |
| C′. Nemryn-owned upload | Best quality: upload when the trip is actually confirmed (a qualified conversion) | Low | Needs a Website Intake contract change to carry the click ID to Nemryn | Future option; not now (contract frozen) |
| D. Manual offline import (owner uploads a CSV of click IDs + times) | Same as C | Low | Still needs click-ID capture and a place to export from | A fallback if API access is delayed |

## 6. Recommended architecture (needs owner/legal approval before ANY implementation of capture)

```
Google ad click (auto-tagging)  →  landing URL ?gclid=… (or gbraid / wbraid)
  → browser: parseClickId() keeps ONE click ID first-party (sessionStorage, this visit only*)
  → visitor submits the request form
  → Server Action: intake returns delivered: true
  → server: buildClickConversion("transportation_quote_submitted", clickId, now)
  → Google Ads API uploadClickConversions  (fire-and-forget; failure never affects the visitor)
```

\* **Retention: this visit only** is the recommended starting point. A longer first-party cookie (up to 90 days)
improves attribution for visitors who come back later. It is a separate consent/legal decision.

Rules for this architecture:
- The click ID travels **beside** the request, as metadata to Zenward-Web's server only. It is never in
  `TransportationRequestInput`, the Nemryn body, the notes, analytics events or the assistant.
- **No browser Google script, no Google cookies, no page context.** Phone clicks are not uploaded; measure real
  calls with Google call reporting if the owner wants them.
- The provider enquiry can follow the same path from the contact Server Action, under its own action.
- Measurement is fire-and-forget. Upload errors, ad blockers (not applicable server-side) or Google outages never
  block navigation, calls, submission, the success screen, Zenny or contact delivery.
- Duplicates:
  - the form counts the primary conversion once per mount (`once()` ref) and blocks same-frame double submits
    (04M)
  - the intake's idempotency key stays authoritative for operational duplicates
  - the server upload should run only in the delivered branch of a single Server Action call
- The idempotency key is **not** sent to Google. If Google-side deduplication is wanted, use a separate random
  conversion ID (a decision at activation).

**Why not simply choose A:** priorities 1 (protect health context) and 4 (minimise processors and cookies) rule it
out. C keeps priority 2 (real delivered requests) and most of 3 (attribution), at the cost of API setup.

## 7. Consent, privacy and policy

This is technical framing, not a legal conclusion. Legal must decide:
- Whether keeping a click ID for the visit and sharing it with Google after a health-adjacent request is
  "sharing" or "consumer health data" under applicable state laws. Examples to review: CCPA/CPRA
  cross-context advertising, Washington's My Health My Data Act, and similar statutes.
- Whether FTC guidance on health information and tracking technologies applies.
- Whether Zenward has any HIPAA covered-entity or business-associate status in any arrangement.

The answer decides whether an opt-in, an opt-out or a notice is required. **No banner is shown in 04M.** If one
becomes necessary:
- states: unknown → denied / granted
- no pre-checked boxes
- an equally easy decline
- nothing captured before a decision when opt-in is required

**Privacy page.** It currently and truthfully says no Google tags are loaded, and promises an update first.
Activation wording is drafted in `google-ads-conversion-activation-checklist.md`. **Google measurement and the
Privacy wording must change in the SAME production release.** Terms are unaffected.

## 8. Decisions recorded

| Decision | Status |
|---|---|
| Enhanced Conversions (hashed email/phone/name/address) | **NOT APPROVED FOR CURRENT ZENWARD IMPLEMENTATION** |
| Health/service-intent remarketing (dialysis, wheelchair, senior, airport-medical visitors, request starters…) | **NOT APPROVED** |
| Audiences, custom audiences, demographic enrichment, Customer Match | Not approved; no code exists |
| GA4 / GTM | Not part of this architecture |
| Google Business Profile | Not part of 04M; no profile is linked or claimed |
| Working hours | Owner-unconfirmed. Define them before paid campaigns (they give the 2-hour promise its meaning) and align the ad schedule. This does not block the disabled code. |

## 9. Activation

See `google-ads-conversion-activation-checklist.md`. Activation is a reviewed change that:
1. sets `MEASUREMENT_APPROVED = true`
2. implements the approved click-ID capture and the server upload transport (credentials in server env)
3. wires the upload into the delivered branch
4. publishes the Privacy wording, all in one release
