# Zenward-Web — Launch Readiness

**Phase:** WEB-P1-E2 (Launch Hardening) · updated by ZW-WEB-02B (Contact Delivery + Request Intake Safety)
**Last updated:** 2026-09-07
**Deployment:** https://www.zenwardmobility.com

Classification: **READY** (done, verified) · **BLOCKED** (cannot be done here — depends on another team / external input) · **DEFERRED** (deliberately out of scope for launch; not a blocker).

Optional polish is never BLOCKED.

---

## READY

| Item | Notes |
|---|---|
| Approved visual baseline frozen | Homepage, hero, hero gradient, mobile hero, Need Transportation banner, highlighted phone CTA, section order, typography, colour system, footer — unchanged. Only form/legal/SEO/a11y work this phase. |
| Transportation-request security boundary | Browser → Server Action → validation → `RequestIntakeAdapter`. No Supabase, no anonymous DB access, no email delivery of request content, no full-payload logging, no browser storage, nothing sent to analytics. Verified. |
| Request Server Action hardening | Whitelist rebuild of the payload (unknown props dropped), per-field normalisation + length caps, enum validation, honeypot + min-fill-time check, 16 KB payload cap, generic error messages (no stack traces / adapter names / secrets). |
| Request "stub" honesty | Stub returns `delivered: false`; success screen says "we have your details — please also call to confirm" with a phone CTA, and `request_form_submitted` does **not** fire. Verified in-browser. |
| Request phone fallback | `/request-transportation` shows a highlighted, accessible "Call 678-935-5489" CTA card ("calling isn't required — the form works too"). Also on the non-delivered success screen. |
| Request assistance-field copy safety (ZW-WEB-02B) | Assistance-notes helper text changed from the equipment list ("Wheelchair, walker, oxygen, companion…") to "Tell us about any mobility or assistance needs for this trip. Zenward will review the request and confirm what we can accommodate." Collects the same information without implying any specific capability (wheelchair / oxygen / stretcher) is guaranteed. Still a single optional free-text field — not checkboxes. |
| Contact adapter (email) implemented | `EmailContactIntakeAdapter` (Resend REST API, no SDK, provider-isolated). Sends a plain-text "New Zenward Website Enquiry" with only submitted fields. Server-only env vars. Fails closed with a "call us" message if misconfigured. |
| Contact "delivered" honesty (ZW-WEB-02B) | `ContactMessageResult` now carries `delivered: boolean` (mirrors the request result). Stub → `delivered: false`; `EmailContactIntakeAdapter` → `delivered: true` **only** after a Resend 2xx, `false` on every failure/misconfig path; every Server Action early-return → `false`. Success screen branches: delivered → "Message received. Thanks for reaching out. Our team will get back to you." + reference id; not delivered → "This message wasn't sent" + "no one at Zenward has received it" + **Call 678-935-5489**. The UI can no longer imply receipt when nothing was sent. Verified in-browser (stub + missing-credential email mode). |
| Contact Server Action hardening | Same whitelist / normalise / cap / honeypot / timing / payload-cap / safe-error treatment; email-shape check. All early returns thread `delivered: false`. |
| Contact data minimisation | Collects name, email, optional phone, optional organization, reason, message. Form + Privacy page tell users not to include medical detail and point them to `/request-transportation` or the phone number. |
| Analytics privacy | No PII / addresses / appointment / assistance / message content sent to analytics — enforced by the typed `AnalyticsEvent` union (no generic escape hatch). `request_form_submitted` gated on `delivered === true`. |
| Social / Open Graph image | `src/app/opengraph-image.jpg` (1200×630): logo, current hero photo, Care Navy → teal, "Care that gets you there.", subtitle "Clear coordination from request to arrival." (geography-neutral — no state). Alt text via `opengraph-image.alt.txt` + `ogImage.alt`. Auto-wired site-wide; `og:image` present on all 8 pages; URL derives from `NEXT_PUBLIC_SITE_URL`. |
| Structured data | Homepage JSON-LD `MedicalBusiness` → **`Organization` + `ContactPoint`**. Verified fields only (name, url, logo, phone). **No `areaServed`** (geography-neutral brand). No address / hours / rating / price / licence / partners. Decision in `docs/product/marketing-scope.md`. |
| Privacy page | Launch-quality honest draft: what's submitted, why, technical data, cookies/analytics stance, service providers, security in general terms, retention in general terms, user choices, contact. No HIPAA / encryption-standard / fixed-retention / regulatory claims. "Counsel review still required" stated. |
| Terms page | Launch-quality conservative draft: what Zenward provides (NEMT, not emergency/ambulance/stretcher), site use, requests are subject to review / not a confirmed ride / no guaranteed availability or response time, emergencies → 911, info may change. No insurance / refund / liability-limitation / licensing / regulatory claims. "Counsel review still required" stated. |
| Domain configuration | `NEXT_PUBLIC_SITE_URL` is the single source of truth (canonical, OG, sitemap, robots, JSON-LD). Not hardcoded anywhere. Changing the env var is sufficient for a custom domain. |
| No software / operator positioning | The public site presents Zenward Mobility only as a non-emergency medical transportation company. No "Sign In" / operator / platform / dashboard link anywhere (`business.signInUrl` removed; `NEXT_PUBLIC_APP_URL` reserved/unused). No "Provider Solutions" / "operator tools" CTAs or copy. Verified: 0 public occurrences. |
| Environment contract | `.env.example` rewritten with PUBLIC vs SERVER-ONLY sections and every variable documented: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `REQUEST_INTAKE_MODE`, `PLATFORM_INTAKE_URL`, `PLATFORM_INTAKE_TOKEN`, `CONTACT_INTAKE_MODE`, `CONTACT_INTAKE_EMAIL`, `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_API_KEY`. |
| No Supabase credentials | None present. `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SECRET_KEY`, `DATABASE_URL` are explicitly absent and documented as forbidden. |
| SEO — titles / descriptions / canonical | Single `%s | Zenward Mobility` suffix (fixed a double-suffix bug); unique description per page; `rel=canonical` on every page. |
| SEO — sitemap / robots | 8 routes in `sitemap.xml`; `robots.txt` allows all + points at the sitemap. Both env-URL driven. |
| Heading hierarchy | Exactly one `<h1>` per page. |
| Form security — safe errors | No stack traces, adapter names, provider names, upstream status bodies, or secrets reach the browser. Server logs carry status codes / error names only — never form content. |
| Accessibility | Labelled inputs with `aria-describedby` / `aria-invalid`; error text `role="alert"`; success panel `role="status"` + `aria-live="polite"` + focus moved to it; honeypot `aria-hidden` + `tabIndex=-1`; phone CTAs have `aria-label`; FAQ uses `aria-expanded`; global `:focus-visible` outline; 48px+ touch targets; `prefers-reduced-motion` respected. |
| CTA audit | Request Transportation → `/request-transportation`; Talk to Our Team → `/contact`; Call → `tel:+16789355489`; Healthcare Providers → `/healthcare-providers`; Sign In → hidden. No dead links, no placeholder anchors. |
| Mobile QA | 390 / 430 / 768 — hero + image + phone CTA + primary CTA intact, forms comfortable, nav works, FAQ usable, footer readable, **zero horizontal overflow** on every route. |
| Performance | LCP hero image `priority`, served ≤1024px native as AVIF (~53 KB); other images lazy + responsive; fonts self-hosted (`next/font`); section min-heights prevent CLS; no animation library; client JS limited to the two forms, header, FAQ, tracked buttons. |
| Build / typecheck / lint | `npx tsc --noEmit` clean · `npm run lint` clean · `npm run build` succeeds (14 static routes incl. `opengraph-image.jpg`). |

---

## BLOCKED

| Item | Why | Unblocks when |
|---|---|---|
| **Trusted TransportationRequest intake** (`REQUEST_INTAKE_MODE=platform`) | The Zenward Platform's RLS-secured, server-assigned-`organization_id` intake endpoint does not exist yet. `PlatformRequestIntakeAdapter` is implemented and fails closed; production runs in `stub` (acknowledges, delivers nothing, tells the visitor to call). | Platform database security foundation is complete and the intake endpoint + token are issued. Then: set `PLATFORM_INTAKE_URL` / `PLATFORM_INTAKE_TOKEN`, set `REQUEST_INTAKE_MODE=platform`. No code change. |

This is the only hard launch blocker for the digital request flow. **The site can still launch** — every request path offers the phone number as an immediate alternative, and the success copy is honest about the stub.

---

## DEFERRED

| Item | Notes |
|---|---|
| Contact email delivery in production | **Code complete and truthful (ZW-WEB-02B).** `EmailContactIntakeAdapter` + the `delivered` contract are done. To go live the owner sets, in Vercel Production env: `CONTACT_INTAKE_MODE=email`, `CONTACT_INTAKE_EMAIL` (monitored, access-controlled inbox), `CONTACT_EMAIL_FROM` (verified Resend sender, e.g. `noreply@mail.zenwardmobility.com` with SPF+DKIM), `CONTACT_EMAIL_API_KEY` (Resend `re_...`). Until then the form runs in `stub` and the success screen **truthfully** tells the visitor the message was not sent and to call. Config-only, not code-blocked. No retry / durable backup yet (see ZW-WEB-02C). |
| Analytics vendor | `track()` abstraction + typed events are ready; no vendor wired. Wire one into `dispatch()` when chosen. |
| Legal counsel review of `/privacy` and `/terms` | Drafts are honest and launch-usable; formal review still required and flagged on-page. |
| Production domain | Custom domain is `https://www.zenwardmobility.com`. Set `NEXT_PUBLIC_SITE_URL` to it in production env (canonical URLs, OG, sitemap, robots, JSON-LD all derive from it). |
| Geographic positioning | The public brand is **geography-neutral** — no state/region/county/city in copy, metadata, or structured data; no `areaServed`; `business.serviceArea` removed. Availability confirmed per request. Operational market rollout tracked in platform ZD-016; verified markets may later get `/locations/[market]` pages (none exist yet). |
| OG image typography | Rendered with a system sans (build-time static asset); brand Manrope not embedded. Cosmetic only. |
| Real cookie banner / consent management | Current analytics stance is "aggregate, no ad/tracking cookies"; if a vendor that sets cookies is chosen, revisit consent. |

---

## Launch recommendation

The public marketing site is a **launch candidate**. It can go live on the current Vercel URL or a custom domain today, with:

- the transportation-request form in honest `stub` mode + phone fallback everywhere, and
- the contact form either in `stub` mode (now honest: it says the message was not sent and to call) or, once the owner sets the four `CONTACT_*` vars, delivering by Resend with delivery-gated success copy — a few minutes of config, not engineering.

The one true blocker (trusted Platform intake) blocks *automated request delivery*, not *launch* — and is owned by the Platform team.
