# Google Business Profile — launch checklist

Internal operational document, created in ZW-WEB-04L (2026-10-16).

- **No profile is known to exist yet.** Nothing on the website claims or
  links to one.
- **The website has no schema `sameAs` entry for it.** Add one only after the
  profile is live and verified.

## 1. Canonical business information (use exactly)

| Field | Value | Status |
|---|---|---|
| Business name | Zenward Mobility | Confirmed. Use the name exactly; no keywords appended (Google policy). |
| Phone | (678) 935-5489 / +1 678-935-5489 | Confirmed |
| Website | https://www.zenwardmobility.com | Confirmed |
| Positioning | Non-emergency medical transportation in Metro Atlanta | Confirmed |
| Tagline (not a GBP field; for descriptions/posts) | Care that gets you there. | Confirmed |
| Physical address | — | **Owner decision required.** Do not invent one. Google requires an address for verification even for a service-area business that hides it. |
| Service areas | — | **Owner confirmation required.** Only "Metro Atlanta" is confirmed. GBP asks for specific cities/counties; enter only confirmed ones. |
| Hours | — | **Owner confirmation required.** Must match the "working hours" behind the 2-hour response. |
| Primary category | — | **Owner to choose in the GBP category picker.** Search the picker for a medical transport / non-emergency medical transport category and pick the closest available match. Do not pick "Ambulance service". |
| Additional categories | — | Owner. Only if accurate; "Airport shuttle service" only if airport trips will be promoted. |

## 2. Description drafts (owner to approve before use)

These use confirmed facts only. They contain no hours, coverage, price, fleet,
years, ratings or guarantees.

**Short (about 250 characters):**

> Zenward Mobility provides scheduled, non-emergency medical transportation in Metro Atlanta, including wheelchair-accessible trips, for appointments, dialysis, rehabilitation, hospital discharge and recurring care. Licensed & insured.

**Longer (under 750 characters):**

> Zenward Mobility provides non-emergency medical transportation in Metro Atlanta for patients, families, caregivers and the care teams who arrange their trips. We help with medical appointments, dialysis, rehabilitation, hospital discharge, recurring care, senior medical trips and wheelchair-accessible transportation. Zenward is licensed and insured, and our drivers are trained and vetted, with background checks as part of our operating standard. Request transportation online or call (678) 935-5489. Requests received during working hours are reviewed and answered within 2 hours, and every trip is confirmed with you before it is arranged. Zenward does not provide emergency, ambulance or stretcher transportation.

## 3. Services list (from the canonical catalogue)

- Medical Appointment Transportation
- Dialysis Transportation
- Rehabilitation Transportation
- Hospital Discharge Transportation
- Recurring Care Transportation
- Senior Medical Transportation
- Wheelchair-Accessible Transportation
- Airport Transportation

Link each to its `/services/...` page where GBP allows. Use no prices unless
the owner confirms them.

## 4. Photo checklist (real photos only)

- [ ] Logo (square) and cover image, from approved brand assets
- [ ] Real Zenward vehicles: exterior, with livery if any
- [ ] Wheelchair-accessible vehicle: ramp or lift deployed (no passengers unless consented)
- [ ] Interior seating and securement area (no specifications claimed in captions)
- [ ] Team/drivers, only with written consent
- [ ] No stock photos presented as Zenward vehicles or staff; no patient faces without written consent; no identifiable medical facilities' signage without care

## 5. Review-generation workflow (manual, policy-safe)

- [ ] Ask after a completed trip, in person or with a follow-up message sent by a person. **No automated review solicitation.**
- [ ] Ask every customer the same way. **No review gating** (don't ask only happy customers) and **no incentives** (discounts, gifts); both breach Google policy.
- [ ] Ask reviewers not to include health or medical details.
- [ ] Reply to reviews without confirming that anyone is a patient or revealing trip, health or personal details.
- [ ] Never write, buy or ask staff to write reviews.
- [ ] Once there are genuine reviews, the owner decides whether the website may reference them (see trust-proof backlog). Until then the site shows no ratings.

## 6. Before publishing the profile

- [ ] Owner confirms address handling, service areas, hours and category (section 1)
- [ ] Owner approves a description (section 2)
- [ ] Profile hours match the working hours behind the 2-hour response
- [ ] Phone and website match exactly (NAP consistency with the site footer)
- [ ] After verification, add `sameAs` to the Organization schema (`src/lib/organization.ts`)
