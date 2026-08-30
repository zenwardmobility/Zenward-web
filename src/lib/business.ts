/**
 * Central business / contact configuration for the Zenward Mobility public
 * site. One place for the customer-facing phone number and related contact
 * details so components never hardcode raw values (mirrors the pattern of
 * `src/lib/seo.ts` for the site URL).
 *
 * The phone number below is the approved Zenward Mobility business line as
 * printed on the approved vehicle imagery (see docs/design/brand-assets.md).
 * It is real — do not replace it with a placeholder.
 *
 * `signInUrl` points at the Zenward operations platform. That app has its
 * own deployment and its production URL is not confirmed yet (Zenward
 * Platform decision register ZD-027 / ZD-079). Set `NEXT_PUBLIC_APP_URL`
 * once it is known; until then the header omits the Sign In link rather
 * than guessing a domain.
 */

const PHONE_DIGITS = "4702068005";

export const business = {
  name: "Zenward Mobility",
  /** Display form for the phone number. */
  phoneDisplay: "470-206-8005",
  /** `tel:` href form (E.164). */
  phoneHref: `tel:+1${PHONE_DIGITS}`,
  /** State the service is launching in. */
  serviceArea: "Georgia",
  /** Operations-platform sign-in, when its URL is configured. */
  signInUrl: process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "",
} as const;
