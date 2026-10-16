# Google Ads conversion activation checklist

Internal. Created in ZW-WEB-04M (2026-10-17).

**Current state: READY BUT DISABLED.**
- No Google code runs on the website.
- Do not launch paid campaigns with conversion optimisation until every item below is complete.
- Architecture and rules: `conversion-measurement.md`.

## Owner / legal gate

- [ ] **1. Google Ads account confirmed.** Owner-controlled account, with the billing and admin users decided.
- [ ] **2. Auto-tagging decision.** Recommended ON, so ad clicks carry `gclid` / `gbraid` / `wbraid`; this
      architecture depends on it. Don't build tracking templates that copy service names into extra URL
      parameters.
- [ ] **3. Primary conversion created: "Transportation Quote Submitted".**
  - Category: Submit lead form.
  - Source: import (clicks), uploaded from the server.
  - Count: One.
  - Set as the **primary** action for bidding.
- [ ] **4. Secondary conversions** (set as *secondary*, i.e. observation only, not used for bidding):
  - [ ] "Provider Enquiry": import (clicks), uploaded from the server, its own action.
  - [ ] "Phone Click": **not uploaded by the website.** If wanted, use Google call reporting / forwarding numbers
        or call assets. That measures real calls; a website `tel:` click is only intent.
- [ ] **5. Conversion IDs supplied:** customer ID and conversion action IDs, given by the owner. Never invented and
      never committed. Production server env only.
- [ ] **6. Architecture approved:** server-side click conversions, no browser Google tag (conversion-measurement.md
      §6). Click-ID retention decided: **this visit only** (recommended start) or a longer first-party cookie.
- [ ] **7. Consent requirements reviewed** by legal (conversion-measurement.md §7). The outcome is one of: notice
      only / opt-out / opt-in. If a banner is required, it has an equally easy decline, no pre-checked boxes, and
      no capture before consent.
- [ ] **8. Privacy activation wording approved** (the draft below, adjusted to the final retention and consent
      decision).
- [ ] **9. Enhanced Conversions explicitly OFF** in the account. No hashed email, phone, name or address is ever
      sent.
- [ ] **10. Remarketing, audiences and service-based lists explicitly OFF.** No dialysis, wheelchair, senior,
      airport-medical or "started a request" audiences; no Customer Match; no demographic enrichment.
- [ ] **11. Working hours confirmed.** They define the "2 hours during working hours" promise used in ads and on
      landing pages.
- [ ] **12. Ad schedule decided,** preferably aligned with those working hours.

## Engineering activation (one reviewed release)

- [ ] **13. Production config entered:**
  - `GOOGLE_ADS_CONVERSIONS_ENABLED=true`, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_QUOTE_CONVERSION_ACTION_ID` and
    (optionally) `GOOGLE_ADS_PROVIDER_CONVERSION_ACTION_ID`
  - the API credentials (developer token, OAuth client, refresh token) as server-only secrets
  - In the same reviewed change:
    - set `MEASUREMENT_APPROVED = true`
    - implement the approved click-ID capture (`parseClickId` on landing; storage as approved)
    - implement the server upload transport
    - call `buildClickConversion` only in the delivered branch of the request (and provider-contact) Server
      Action, fire-and-forget
  - Publish the Privacy wording in the SAME production release.
- [ ] **14. Google diagnostics test:** upload diagnostics in Google Ads show the test conversions as received, with
      no errors.
- [ ] **15. Synthetic conversion QA on a preview deployment:** one ad-click URL with a test `gclid` → submit a
      clearly synthetic request → exactly ONE upload for a delivered request. None for a rejected, failed or
      unconfigured submission, a form start, a phone click or an assistant open. A double-click or a retry still
      gives one.
- [ ] **16. Verify no health or trip data reaches the vendor.** Inspect the actual upload body. It must be only the
      conversion action, the conversion time and one click ID: no URL, query, title, referrer, service, assistance
      level, names, contact details, notes or IDs. Confirm no Google script, cookie or browser request exists on
      any page.
- [ ] **17. Campaign launch authorisation:** the owner confirms in writing, after items 1–16.

## Privacy activation wording — DRAFT: NOT PUBLISHED

Do not publish this until measurement is live; Google measurement and this wording change in the SAME
production release. The text describes ONLY the recommended architecture. Adjust the bracketed parts to the final
retention and consent decisions.

> **Advertising measurement.** When you reach this website by clicking a Google ad, the link includes an
> identifier that Google adds to the ad click. This website keeps that identifier [only in your browser for
> the rest of that visit]. If you then send a transportation request [or a healthcare-provider enquiry] and
> Zenward successfully receives it, our web server tells Google Ads that a request came from that ad click. We
> send only the click identifier, the type of conversion and the time. We do not send Google the pages you
> viewed, the transportation service you chose, the contents of your request, or your name or contact
> details. We do not load Google advertising or analytics scripts on this website, do not set Google cookies,
> do not use Google remarketing or advertising audiences, and do not use Google's "enhanced conversions"
> feature. Google handles the click information under its own privacy policy. [Your choices: …per legal
> review…]

When this goes live, also update the "Cookies and analytics" and "Service providers" sections, which currently
say no Google tags are loaded. Add Google Ads as a recipient of conversion data.
