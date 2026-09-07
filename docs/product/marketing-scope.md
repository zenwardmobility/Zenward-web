# Zenward Web — Marketing Scope

**Status:** Foundation.
**Last updated:** 2026-08-30

## Purpose

Zenward Web is the public commercial website for Zenward Mobility. It exists to:

1. Generate transportation requests.
2. Generate healthcare-provider conversations.
3. Establish Zenward's public brand.
4. Support search visibility.
5. Allow the public business presence to launch before the operations platform is complete.

## Audiences

Patients, family members, caregivers, healthcare providers (dialysis centers, clinics, rehabilitation providers, senior care organizations, hospital discharge teams), and prospective transportation requesters generally.

## What this is not

Not the dispatcher application, not the driver application, not an admin console, not a SaaS dashboard. It contains no operational logic, no trip lifecycle, no authentication-gated console.

## Relationship to the Zenward Platform

This project is the outcome of the platform repository's confirmed separation decision (Zenward Platform decision register ZD-079, `public-marketing-separation.md`). Two independent repositories, two independent deployments:

- **Zenward Platform** (`ZenWard` repo) — `/operations/...`, `/driver/...`, plus minimal application-level routes. Owns all operational data and its Row Level Security model.
- **Zenward Web** (this repo) — the public site. No runtime code is shared between the two; brand tokens are replicated, not imported (see `docs/design/design-system.md`).

This site's only connection to the platform, now or in the future, is through the request-intake boundary (`docs/architecture/request-intake-boundary.md`) — never a direct database connection, and never a shared authentication session.

## Approved brand language

- Brand: **Zenward Mobility**
- Tagline: **Care that gets you there.**
- Category: **Non-Emergency Medical Transportation**
- Geography: **geography-neutral.** The public brand and this website are not tied to any state. Zenward may begin operations market by market, but operational launch market ≠ permanent brand geography, so no state, region, county, or city appears in site copy, metadata, or structured data. Availability for a specific trip is confirmed during request coordination. The operational rollout sequence is tracked in the platform decision register (ZD-016), not here.
- Voice: plain, professional, human, transportation-focused, credible, commercially clear. Never "AI-powered," "smart," "next-generation," "operating system," "future of mobility," or similar — Zenward should not read like a software startup. No unsupported reach claims either ("nationwide," "all 50 states," "coast to coast," "national network").

## Services presented (approved list)

Medical appointments, dialysis visits, rehabilitation appointments, hospital discharge transportation, recurring scheduled care, senior medical transportation. Emergency transportation, ambulance service, stretcher transportation, and wheelchair-specific transport are **not** presented unless separately approved.

## Claim discipline

This site does not fabricate: HIPAA compliance claims, certifications, licenses, insurance claims, partner/facility logos, testimonials, ratings, statistics, fleet size, customer counts, or specific service-area counties. Where final verified business information is required (production domain, phone number, exact service area, licensing details), the site uses honest, non-committal language or omits the claim entirely rather than inventing a placeholder that could be mistaken for real. See the platform repository's decision register for what's still unresolved (ZD-016 launch territory, ZD-027 public contact information/domain, ZD-020 wait-time/policy rules) — this site's copy is written to remain true regardless of how those resolve.

## Request language discipline

A transportation request is intent, not a confirmed ride. This site never says "Ride confirmed," "Driver assigned," or "Booking complete" — only "Request received," with copy explaining that Zenward will follow up to confirm availability and next steps. This mirrors the platform's own confirmed TransportationRequest lifecycle model (platform repo `docs/product/lifecycle-model.md` §B) even though this site has no direct connection to that system yet.

When the transportation-request intake is running in `stub` mode (nothing is delivered anywhere), the success screen does **not** say "we'll contact you" — it acknowledges the details and directs the visitor to call to confirm. Only a genuinely delivered request (future `platform` mode) shows the "Zenward will review and contact you" copy and counts as a `request_form_submitted` conversion.

## Structured data (JSON-LD)

The homepage emits one JSON-LD block. Decision (WEB-P1-E2): **`schema.org/Organization`** with a `ContactPoint`, not `MedicalBusiness` or `LocalBusiness`.

- `MedicalBusiness` would misrepresent Zenward as a medical-services provider; it is a transportation company.
- `LocalBusiness` implies a verified, published physical premises and typically `address` / `openingHours`, none of which are confirmed for public use.
- `Organization` accurately states only what is verified: `name` (Zenward Mobility), `url` (`NEXT_PUBLIC_SITE_URL`), `logo`, and a customer-service `ContactPoint` with the real phone number.

No `areaServed` is emitted (geography-neutral brand; no broad service territory is formally published — see "Approved brand language"). Do not add a state or country to `areaServed`, and do not substitute `"United States"` / `"North America"` / `"nationwide"`, without a verified operational basis. No `address`, `openingHours`, `aggregateRating`, `priceRange`, license, or partner data appears — consistent with "Claim discipline" above. Revisit if/when a verified public address, hours, or defined service territory exist.

## Future local SEO model

The core brand at **https://www.zenwardmobility.com** stays geography-neutral. When Zenward genuinely operates in a verified market, that market may get its own page — `/locations/atlanta`, `/locations/[market]` — describing local availability. Those pages are created **only after** operations in that market are real, and they never make the core site or brand state-specific. No `/locations/*` route exists today, and none was created in this pass.

## Open questions

- Production domain / subdomain strategy for this site vs. the platform app (platform repo ZD-079's open items).
- Exact launch territory and service-area copy (gated on platform ZD-016).
- Final legal counsel review of `/privacy` and `/terms` (now launch-quality honest drafts, not placeholders — but not counsel-reviewed).
- The trusted Zenward Platform TransportationRequest intake endpoint (replaces `REQUEST_INTAKE_MODE=stub`). Gated on the Platform database security foundation.
- Contact email delivery: `CONTACT_INTAKE_MODE=email` needs a verified Resend sender domain + API key in production (currently `stub`).
- Analytics vendor selection (the `track()` abstraction is ready; no vendor wired).

See `docs/product/launch-readiness.md` for the full READY / BLOCKED / DEFERRED breakdown.
