# Trust proof backlog

Internal, created in ZW-WEB-04L (2026-10-16).

The public site states only owner-confirmed operating facts (see
`src/lib/trust.ts`):
- licensed & insured
- trained & vetted drivers with background checks
- punctuality as an operating standard
- patience, dignity and compassion
- wheelchair-accessible transportation
- a 2-hour response during working hours

This backlog lists **real evidence** that would strengthen trust, in priority
order.

**Never fabricate social proof.** That means no invented reviews, ratings,
star graphics, testimonials, partner, hospital or facility logos, customer
or ride counts, years in business, awards, or certification seals.
Regression tests enforce this; see `src/lib/trust.test.mjs` and
`src/lib/provider-trust.test.mjs`.

## High value

| Proof | What's needed | Where it would go |
|---|---|---|
| Genuine Google reviews | A live Google Business Profile, plus the manual review workflow (see google-business-profile-launch-checklist.md) | Homepage trust area, and possibly provider page. Show only real, attributed review text with permission. No star graphics unless the rating is real and current. |
| Real Zenward vehicle photography | Photos of the actual vehicles, including wheelchair-accessible ones | Homepage, wheelchair page, Metro Atlanta hub. Replace or supplement brand imagery. |
| Real driver/team photography | Written consent from each person | About, provider page |
| Proof of licensing / insurance | Owner decides whether to publish a licence number or offer a certificate of insurance to facilities on request | Provider page ("available on request") |
| Confirmed hours | Owner confirmation (see the legal-review list) | Footer, contact, Zenny, GBP. Also gives the 2-hour promise a concrete meaning. |
| Confirmed payment options | Owner confirmation | FAQ, provider page |
| Confirmed service-area details | Owner confirmation of counties/cities | Metro Atlanta hub, GBP. Unblocks legitimate city content. |

## Later

| Proof | What's needed |
|---|---|
| Facility testimonials | Written permission from the organisation and the named person; no patient information |
| Provider case study | A real coordination example with permission; anonymised; no health details |
| Operational response-time data | Enough real history to state a measured figure honestly (for example, a median reply time over a stated period). The public promise stays at 2 hours; the internal 30-minute target is not public. |
| Named partnerships / contracts | Only once they exist and both sides approve the wording |
