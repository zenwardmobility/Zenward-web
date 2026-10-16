# Zenward Resources — future backlog

Created in ZW-WEB-04K. **None of these pages are implemented.** Add a Resource
only when it answers a real planning question, ideally one that shows up in
Search Console queries, Zenny questions or calls to the team.

## How to add a Resource

1. Add the slug to `src/lib/resources/slugs.ts`.
2. Add metadata to `RESOURCES` in `src/lib/resources/catalog.ts`: category,
   audience, kind, dates, related services (the first one is the CTA service),
   2–3 related Resources, unique SEO title and description (≤160 characters).
3. Add the body to `RESOURCE_BODIES` in `src/lib/resources/content.ts`.
4. Update `src/lib/resources/resources.test.mjs` (it pins exactly six launch
   Resources on purpose).
5. The sitemap, hub, service-page "Helpful resources" and Zenny link
   validation pick it up from the catalogue automatically. Add a Zenny topic
   only if visitors actually ask about it.

Content rules: confirmed facts only (see `src/lib/operating-facts.ts` and
`src/lib/trust.ts`), no medical advice, no invented authors or reviewers,
and no Medicaid/insurance, hours, 24/7, fleet, credential or city claims
unless the owner confirms them. Don't copy service-page copy. Resources
explain how to plan, while service pages describe what Zenward offers.

## High commercial intent

| Topic | Notes |
| --- | --- |
| NEMT vs rideshare vs ambulance | Comparison framing. Stay factual about what Zenward does, and make no claims about competitors. |
| Family guide to medical appointment transportation | Links to Medical Appointment Transportation. |
| How recurring medical transportation works | Links to Recurring Care. Check for overlap with the dialysis guide. |
| Airport transportation for older adults | Links to Airport Transportation. Don't mention flight tracking, meet-and-greet or baggage help unless they're confirmed. |
| Rehabilitation transportation guide | Links to Rehabilitation Transportation. |

## Provider intent

| Topic | Notes |
| --- | --- |
| Care coordinator discharge planning guide | Extends the discharge checklist. Avoid cannibalising it. |
| Transportation request checklist for facilities | Possible second planning tool, reusing `TripChecklist`. |
| Questions care teams should ask an NEMT provider | Links to /healthcare-providers. |

## Educational

| Topic | Notes |
| --- | --- |
| Questions to ask an NEMT provider | For riders and families. |
| Preparing a parent for medical transportation | Must not drift into medical or caregiving advice. |
| Understanding return-trip transportation | Covers timing uncertainty and how the return is confirmed. |

## Not planned (guardrails)

- City or county pages (e.g. "NEMT Marietta"). Wait until the owner confirms
  detailed service-area geography.
- Insurance, Medicaid or Medicare explainers. Coverage is not owner-confirmed.
- Search on /resources. Category browsing is enough below about 15 Resources;
  revisit then, client-side only.
