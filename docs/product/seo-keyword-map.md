# SEO keyword-to-page map

Internal. Created in ZW-SEO-01 (2026-10-17).

**One primary organic intent per page.** These are hypotheses, validated against current result patterns (see
`seo-competitor-opportunity-map.md`) and to be refined with real Search Console queries. Never force exact-match
phrasing: "Metro Atlanta" contains "Atlanta", so pages match "… Atlanta" queries without inventing city copy.
Paid landing pages (`/metro-atlanta/*`) are noindex, so they never compete organically.

| Page | Primary intent | Supporting / related intents | Title (after SEO-01) |
|---|---|---|---|
| `/` | non emergency medical transportation Atlanta / Metro Atlanta (head term, brand) | medical transportation Atlanta; Zenward Mobility | Non-Emergency Medical Transportation in Metro Atlanta |
| `/locations/metro-atlanta` | NEMT Atlanta / NEMT in Metro Atlanta (the abbreviation plus local detail: services, who, how to request) | non emergency transportation Metro Atlanta service area | **NEMT in Metro Atlanta: Services & How to Request** (changed) |
| `/services` | medical transportation services Atlanta (category / compare) | types of NEMT services | Our Transportation Services |
| `/services/wheelchair-transportation` | wheelchair transportation Atlanta | wheelchair accessible transportation, wheelchair van medical appointments | Wheelchair-Accessible Transportation in Metro Atlanta |
| `/services/dialysis-transportation` | dialysis transportation Atlanta | rides to dialysis, recurring dialysis transportation | Dialysis Transportation in Metro Atlanta |
| `/services/medical-appointments` | medical appointment transportation Atlanta | rides to doctor appointments | Medical Appointment Transportation in Metro Atlanta |
| `/services/hospital-discharge-transportation` | hospital discharge transportation Atlanta | ride home from hospital | Hospital Discharge Transportation in Metro Atlanta |
| `/services/recurring-care-transportation` | recurring medical transportation Atlanta | standing appointment rides | Recurring Care Transportation in Metro Atlanta |
| `/services/senior-medical-transportation` | senior medical transportation Atlanta | transportation for elderly parent to appointments | Senior Medical Transportation in Metro Atlanta |
| `/services/rehabilitation-transportation` | rehabilitation / physical therapy transportation Atlanta | rides to therapy appointments | Rehabilitation Transportation in Metro Atlanta |
| `/services/airport-transportation` | airport transportation for older adults / passengers with mobility needs (Atlanta) | wheelchair accessible airport ride | Airport Transportation in Metro Atlanta |
| `/healthcare-providers` | patient transportation for healthcare providers Atlanta | discharge planner / care coordinator transportation | Healthcare Provider Transportation in Metro Atlanta |
| `/resources` | NEMT planning guides (informational hub) | — | Medical Transportation Resources & Guides |
| `/resources/what-is-non-emergency-medical-transportation` | what is NEMT / non-emergency medical transportation meaning | NEMT vs ambulance (partial) | What Is Non-Emergency Medical Transportation? |
| `/resources/how-to-arrange-nemt-in-metro-atlanta` | how to arrange NEMT in Atlanta | how to book non-emergency medical transportation | How to Arrange NEMT in Metro Atlanta |
| `/resources/dialysis-transportation-guide` | how to arrange/plan dialysis transportation (informational) | dialysis transportation for family members | Recurring Dialysis Transportation Guide |
| `/resources/wheelchair-accessible-transportation-guide` | what to know before wheelchair transportation | curb-to-curb vs door-to-door (assistance levels) | Wheelchair-Accessible Transportation Guide |
| `/resources/hospital-discharge-transportation-checklist` | hospital discharge transportation checklist | discharge planning transportation | Hospital Discharge Transportation Checklist |
| `/resources/medical-transportation-trip-checklist` | medical appointment transportation checklist | what to have ready for a medical ride | Medical Transportation Trip Checklist |
| `/about`, `/contact` | brand / navigational | — | unchanged |

## Cannibalisation rules

- **Homepage vs hub (the one real overlap).** Before SEO-01 both titles led with "Non-Emergency Medical
  Transportation (Services) in Metro Atlanta", and the H1s were nearly identical. Now:
  - The homepage owns the spelled-out head term.
  - The hub's title leads with "NEMT in Metro Atlanta" plus its distinct purpose (services, who it serves, how to
    request).
  - The H1s were left unchanged (approved copy).
  - Watch Search Console for "Google chose different canonical" or query splitting between the two. If Google
    consolidates on the homepage, consider merging the hub's unique sections into the homepage in SEO-02 rather
    than adding more near-duplicate copy.
- **Service page vs its Resource.**
  - Service pages are transactional: "X in Metro Atlanta", plus request and call.
  - Resources are informational: "how to plan …".
  - They cross-link: service → "Helpful resources"; Resource → bridge to request.
  - Don't retitle a Resource with "… in Metro Atlanta" unless it is the local how-to (R2).
- **Dialysis:** `/services/dialysis-transportation` (book/request) vs `/resources/dialysis-transportation-guide`
  (plan a recurring schedule). The distinct intents are already reflected in the titles.
- **Discharge:** the service page vs the checklist Resource. Distinct ("transportation" vs "checklist").
- **Paid pages** (`/metro-atlanta/*`) share titles with organic pages by design, but are noindex, follow and
  outside the sitemap.

## Blocked keywords (need owner facts first)

| Keyword | Blocked on |
|---|---|
| "… near me" in city X; Marietta / Decatur / Alpharetta / Fulton / DeKalb … NEMT | Owner-confirmed service area |
| "Medicaid transportation Atlanta", "does insurance cover …" | Payment/coverage position (legal-review list) |
| "same-day medical transportation Atlanta", "24 hour …" | Unconfirmed |
| "cost of NEMT in Atlanta" (answerable honestly only with a pricing model) | Pricing model |
