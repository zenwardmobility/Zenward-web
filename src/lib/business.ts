/**
 * Central business / contact configuration for the Zenward Mobility public
 * site. One place for the customer-facing phone number and related contact
 * details so components never hardcode raw values (mirrors the pattern of
 * `src/lib/seo.ts` for the site URL).
 *
 * The phone number below is the approved Zenward Mobility business line
 * (see docs/design/brand-assets.md). It is real — do not replace it with a
 * placeholder.
 */

const PHONE_DIGITS = "6789355489";

export const business = {
  name: "Zenward Mobility",
  /** Display form for the phone number. */
  phoneDisplay: "678-935-5489",
  /** `tel:` href form (E.164). */
  phoneHref: `tel:+1${PHONE_DIGITS}`,
} as const;

/*
 * The public site presents Zenward Mobility only as a non-emergency medical
 * transportation company. It intentionally has NO "Sign In" / operator /
 * platform / dashboard link and no software positioning. Any operator or
 * account application lives elsewhere and is not linked from this site.
 *
 * There is also deliberately NO `serviceArea` / `region` / `brandLocation`
 * field: the public brand is geography-neutral so it can expand into multiple
 * markets. Operational rollout happens market by market (tracked in the
 * platform decision register, ZD-016) — that is not permanent brand geography,
 * so it does not live in site config or copy. Availability for a specific trip
 * is confirmed during request coordination.
 */
