# Public policy & legal review needed

Internal. Created in ZW-WEB-04L (2026-10-16).

These items need an owner decision or legal confirmation before the website
can state them. Until then the site deliberately says nothing specific, or
hands the question to the team ("call or send a message"). None of them
blocks the factual website work already done.

The canonical "not yet confirmed" answers are in `src/lib/operating-facts.ts`
(`OPERATING_FACTS`). When one of the items below is confirmed:

1. Set its `status` to `"confirmed"` and add a `statement`.
2. Update this file.

Pages and Zenny pick the change up automatically.

| # | Item | Current public position | Needs |
|---|------|-------------------------|-------|
| 1 | Business hours | "Our exact working hours aren't published here yet." The 2-hour response is stated as "during working hours". | Owner: the actual working hours, including weekends and holidays. The 2-hour promise depends on this definition. |
| 2 | Payment methods | Handed to the team. | Owner: accepted methods; whether a deposit or pre-payment applies. |
| 3 | Private pay | Not stated. | Owner: whether trips are private-pay, and how quotes are given. |
| 4 | Insurance / Medicaid / Medicare | Not stated ("payment and coverage options can depend on the transportation arrangement"). | Owner + legal: any coverage, broker or Medicaid NEMT participation, and how it may be described. |
| 5 | Facility billing | Handed to the team. | Owner: whether organisations can be invoiced, and on what terms. |
| 6 | Cancellation / no-show / wait-time policy | "Call as soon as possible." No fees stated. | Owner + legal: policy text and any fees. Terms then need a section. |
| 7 | Advance notice / same-day | "Request as early as possible"; same-day is confirmed by the team. | Owner: minimum notice; whether same-day requests are accepted. |
| 8 | Exact service area | "Zenward serves Metro Atlanta." No cities, counties or radius. | Owner: counties/cities served (and excluded). Unblocks city content and Google Business Profile service areas. |
| 9 | Public business address | None published. Not in schema. | Owner: whether a public address exists (or service-area-only). Required for Google Business Profile verification even if hidden. |
| 10 | Data retention | "Specific retention periods are being finalized." | Owner + legal: retention for request data, contact messages and follow-up numbers. |
| 11 | Health-data compliance statements | No HIPAA or other compliance claim. The privacy page explicitly says so. | Legal: whether Zenward is a covered entity or business associate in any arrangement, and what (if anything) may be stated. Never publish "HIPAA compliant" without this. |
| 12 | Liability, governing law, disputes | Terms set none of these (stated in the page note). | Legal: whether the terms need these sections. |
| 13 | Licensing / insurance details | "Licensed & Insured" stated plainly (owner-confirmed). No licence numbers, authorities or policy limits. | Owner: whether to publish a licence number or certificate of insurance (see trust-proof backlog). |
| 14 | Terms / privacy final review | Both pages say they are drafts pending legal review. | Legal: review before removing the draft notices. Never publish "lawyer approved", "legally compliant" or similar. |

## Wording guardrails while items are open

- Never state an hours range, 24/7, same-day availability, a notice period,
  fees, coverage acceptance, a cancellation rule, a county/city list or an
  address.
- The 2-hour line is a RESPONSE during working hours, never availability,
  dispatch or a confirmed ride.
- Requests are always request → review → confirmation.
